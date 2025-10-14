import { NextRequest, NextResponse } from 'next/server';
import { ApiResponse } from '@/types';
const { Case, User } = require('models/init-models');

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    // Build where conditions
    const whereConditions: any = {};
    
    if (status !== 'all') {
      whereConditions.status = status;
    }
    
    if (type !== 'all') {
      whereConditions.case_type = type;
    }

    // Get cases with pagination using Sequelize ORM
    const { count, rows: cases } = await Case.findAndCountAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: User,
          as: 'advocate',
          attributes: ['id', 'name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    // Filter by search if provided
    let filteredCases = cases;
    if (search) {
      filteredCases = cases.filter((caseItem: any) => 
        caseItem.title.toLowerCase().includes(search.toLowerCase()) ||
        caseItem.case_number.toLowerCase().includes(search.toLowerCase()) ||
        (caseItem.user && caseItem.user.name.toLowerCase().includes(search.toLowerCase()))
      );
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cases retrieved successfully',
      data: {
        cases: filteredCases,
        pagination: {
          page,
          limit,
          total: search ? filteredCases.length : count,
          totalPages: Math.ceil((search ? filteredCases.length : count) / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get cases error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      client_id, 
      case_number, 
      title, 
      description, 
      case_type, 
      status = 'open', 
      priority = 'medium',
      start_date,
      fees = 0
    } = body;

    // Create case using Sequelize ORM
    const newCase = await Case.create({
      user_id: 1, // Default user for now
      advocate_id: 1, // Default advocate for now
      case_number,
      title,
      description,
      case_type,
      status,
      priority,
      start_date: start_date ? new Date(start_date) : null,
      fees
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Case created successfully',
      data: { id: newCase.id }
    });

  } catch (error: any) {
    console.error('Create case error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
