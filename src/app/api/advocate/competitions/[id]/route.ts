import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { ApiResponse } from '@/types';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const competitionId = parseInt(params.id);

    if (isNaN(competitionId)) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid competition ID'
      }, { status: 400 });
    }

    const [competitions] = await pool.execute(
      'SELECT * FROM competitions WHERE id = ?',
      [competitionId]
    );

    if (!Array.isArray(competitions) || competitions.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Competition not found'
      }, { status: 404 });
    }

    const competition = competitions[0] as any;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Competition retrieved successfully',
      data: competition
    });

  } catch (error) {
    console.error('Get competition error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
