import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/database';
import { verifyTokenFromRequest } from '@/lib/auth';

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

    let whereClause = '';
    let replacements: any[] = [];

    // Build where clause
    const conditions = [];
    if (role) {
      conditions.push('role = ?');
      replacements.push(role);
    }
    if (is_approved !== null && is_approved !== '') {
      conditions.push('is_approved = ?');
      replacements.push(is_approved === 'true');
    }
    if (search) {
      conditions.push('(name LIKE ? OR email LIKE ? OR phone LIKE ?)');
      replacements.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (conditions.length > 0) {
      whereClause = 'WHERE ' + conditions.join(' AND ');
    }

    // Get total count for pagination
    const [countResult] = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM users
      ${whereClause}
    `, {
      replacements,
      type: sequelize.QueryTypes.SELECT
    });

    const total = (countResult as any).total;
    const totalPages = Math.ceil(total / limit);

    // Get users with pagination
    const users = await sequelize.query(`
      SELECT 
        id, name, email, role, is_approved, phone, address,
        specialization, experience_years, bar_number, license_number,
        created_at, updated_at
      FROM users
      ${whereClause}
      ORDER BY ${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `, {
      replacements: [...replacements, limit, offset],
      type: sequelize.QueryTypes.SELECT
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
