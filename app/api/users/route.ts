import { NextRequest, NextResponse } from 'next/server';
const { User, Case } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { Op, fn, col } from 'sequelize';

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

    // Only admin and advocate can view users
    if (authResult.user.role !== 'admin' && authResult.user.role !== 'advocate') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const role = searchParams.get('role');
    const is_approved = searchParams.get('is_approved');
    const search = searchParams.get('search');
    const user_type = searchParams.get('user_type');
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
    if (user_type) {
      whereConditions.user_type = user_type;
    }
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } },
        { phone: { [Op.like]: `%${search}%` } }
      ];
    }

    // For advocates, only show clients who have cases assigned to them
    let includeConditions: any[] = [];
    if (authResult.user.role === 'advocate') {
      includeConditions = [
        {
          model: Case,
          as: 'userCases',
          attributes: [],
          where: { advocate_id: authResult.user.userId },
          required: true // INNER JOIN - only users with cases assigned to this advocate
        }
      ];
    }

    // Get total count for pagination
    const countOptions: any = { where: whereConditions };
    if (includeConditions.length > 0) {
      countOptions.include = includeConditions;
    }
    const total = await User.count(countOptions);
    const totalPages = Math.ceil(total / limit);

    // Get statistics (approved and pending counts) - only when role filter is applied
    let statistics = null;
    if (role) {
      const baseWhereConditions: any = { role };
      if (search) {
        baseWhereConditions[Op.or] = [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ];
      }
      
      const approvedCount = await User.count({ 
        where: { ...baseWhereConditions, is_approved: true } 
      });
      const pendingCount = await User.count({ 
        where: { ...baseWhereConditions, is_approved: false } 
      });
      
      statistics = {
        total: total,
        approved: approvedCount,
        pending: pendingCount
      };
    }

    // Get users with pagination using Sequelize ORM
    const findOptions: any = {
      where: whereConditions,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
      attributes: { exclude: ['password'] }, // Exclude password from response
      distinct: true // Important for counting with includes
    };

    if (includeConditions.length > 0) {
      findOptions.include = includeConditions;
    }

    const users = await User.findAll(findOptions);

    // For advocates, get cases count for each user
    let usersWithCaseCount = users;
    if (authResult.user.role === 'advocate' && role === 'user') {
      const userIds = users.map((u: any) => {
        const userData = u.toJSON ? u.toJSON() : u;
        return userData.id;
      });
      if (userIds.length > 0) {
        // Get cases count for each user
        const casesCounts = await Case.findAll({
          where: {
            user_id: { [Op.in]: userIds },
            advocate_id: authResult.user.userId
          },
          attributes: [
            'user_id',
            [fn('COUNT', col('id')), 'cases_count']
          ],
          group: ['user_id'],
          raw: true
        });

        const casesCountMap = new Map();
        casesCounts.forEach((item: any) => {
          casesCountMap.set(item.user_id, parseInt(item.cases_count) || 0);
        });

        usersWithCaseCount = users.map((user: any) => {
          const userData = user.toJSON ? user.toJSON() : user;
          return {
            ...userData,
            cases_count: casesCountMap.get(userData.id) || 0
          };
        });
      } else {
        usersWithCaseCount = users.map((user: any) => {
          const userData = user.toJSON ? user.toJSON() : user;
          return {
            ...userData,
            cases_count: 0
          };
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: usersWithCaseCount,
      pagination: {
        currentPage: page,
        totalPages,
        totalItems: total,
        itemsPerPage: limit,
        hasNextPage: page < totalPages,
        hasPrevPage: page > 1
      },
      ...(statistics && { statistics })
    });

  } catch (error) {
    console.error('Get users error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
