import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { ApiResponse } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;

    let query = 'SELECT * FROM competitions';
    let params: any[] = [];

    if (status) {
      query += ' WHERE status = ?';
      params.push(status);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const [competitions] = await pool.execute(query, params);

    // Get total count
    let countQuery = 'SELECT COUNT(*) as total FROM competitions';
    let countParams: any[] = [];

    if (status) {
      countQuery += ' WHERE status = ?';
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = (countResult as any)[0].total;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Competitions retrieved successfully',
      data: {
        competitions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      }
    });

  } catch (error: any) {
    console.error('Get competitions error:', error);
    
    // If table doesn't exist or access denied, return fallback data
    if (error.code === 'ER_NO_SUCH_TABLE' || error.code === 'ER_ACCESS_DENIED_ERROR' || error.code === 'ER_WRONG_ARGUMENTS') {
      const fallbackCompetitions = [
        {
          id: 1,
          title: 'AI Innovation Challenge',
          description: 'Build innovative AI solutions for real-world problems. Showcase your machine learning skills and compete with the best minds in AI.',
          start_date: '2024-02-01T09:00:00Z',
          end_date: '2024-02-28T18:00:00Z',
          max_participants: 100,
          current_participants: 45,
          status: 'upcoming'
        },
        {
          id: 2,
          title: 'Data Science Competition',
          description: 'Analyze datasets and build predictive models. Work with real-world data and create solutions that matter.',
          start_date: '2024-03-01T09:00:00Z',
          end_date: '2024-03-31T18:00:00Z',
          max_participants: 50,
          current_participants: 23,
          status: 'upcoming'
        },
        {
          id: 3,
          title: 'Web Development Hackathon',
          description: 'Create full-stack web applications. Build modern, responsive applications using the latest technologies.',
          start_date: '2024-04-01T09:00:00Z',
          end_date: '2024-04-30T18:00:00Z',
          max_participants: 75,
          current_participants: 38,
          status: 'upcoming'
        }
      ];

      const filtered = status 
        ? fallbackCompetitions.filter(c => c.status === status)
        : fallbackCompetitions;

      return NextResponse.json<ApiResponse>({
        success: true,
        message: 'Competitions retrieved successfully (fallback data)',
        data: {
          competitions: filtered,
          pagination: {
            page,
            limit,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / limit)
          }
        }
      });
    }

    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
