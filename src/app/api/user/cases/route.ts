import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || 'all';
    const type = searchParams.get('type') || 'all';
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, cl.first_name, cl.last_name, cl.email as client_email,
             u.name as advocate_name 
      FROM cases c 
      LEFT JOIN clients cl ON c.client_id = cl.id 
      LEFT JOIN users u ON c.advocate_id = u.id 
      WHERE 1=1
    `;
    let params: any[] = [];

    if (search) {
      query += ' AND (c.title LIKE ? OR c.case_number LIKE ? OR cl.first_name LIKE ? OR cl.last_name LIKE ?)';
      params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      query += ' AND c.status = ?';
      params.push(status);
    }

    if (type !== 'all') {
      query += ' AND c.case_type = ?';
      params.push(type);
    }

    query += ' ORDER BY c.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [cases] = await pool.execute(query, params);

    // Get total count
    let countQuery = `
      SELECT COUNT(*) as total 
      FROM cases c 
      LEFT JOIN clients cl ON c.client_id = cl.id 
      WHERE 1=1
    `;
    let countParams: any[] = [];

    if (search) {
      countQuery += ' AND (c.title LIKE ? OR c.case_number LIKE ? OR cl.first_name LIKE ? OR cl.last_name LIKE ?)';
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== 'all') {
      countQuery += ' AND c.status = ?';
      countParams.push(status);
    }

    if (type !== 'all') {
      countQuery += ' AND c.case_type = ?';
      countParams.push(type);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = (countResult as any)[0].total;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Cases retrieved successfully',
      data: {
        cases,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
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

    // For now, use advocate_id = 1 (admin user)
    const advocate_id = 1;

    const [result] = await pool.execute(
      'INSERT INTO cases (advocate_id, client_id, case_number, title, description, case_type, status, priority, start_date, fees) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)',
      [advocate_id, client_id, case_number, title, description, case_type, status, priority, start_date, fees]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Case created successfully',
      data: { id: (result as any).insertId }
    });

  } catch (error: any) {
    console.error('Create case error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
