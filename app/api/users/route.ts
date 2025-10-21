import { NextRequest, NextResponse } from 'next/server';
const { User } = require('models/init-models');
import { verifyTokenFromRequest } from 'lib/auth';
import { Op } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    console.log("🚀 ~ GET ~ request:", request)
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can view all users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const is_approved = searchParams.get('is_approved');
    const search = searchParams.get('search');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    // Validate pagination parameters
    const offset = (page - 1) * limit;
    const validSortColumns = ['id', 'name', 'email', 'role', 'is_approved', 'created_at', 'updated_at'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (!validSortColumns.includes(sortBy)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort column' },
        { status: 400 }
      );
    }
    
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort order' },
        { status: 400 }
      );
    }

    // Build where conditions for Sequelize
    const whereConditions: any = {};
    
    if (role) {
      whereConditions.role = role;
    }
    if (is_approved !== null && is_approved !== '') {
      whereConditions.is_approved = is_approved === 'true';
    }
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get total count for pagination
    const total = await User.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    // Get users with pagination using Sequelize ORM
    const users = await User.findAll({
      where: whereConditions,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
      attributes: { exclude: ['password'] } // Exclude password from response
    });

    return NextResponse.json({
      success: true,
      data: users,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      }
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
