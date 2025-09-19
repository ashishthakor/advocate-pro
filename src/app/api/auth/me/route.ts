import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { ApiResponse, User } from '@/types';

export async function GET(request: NextRequest) {
  try {
    const token = getTokenFromRequest(request);
    
    if (!token) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'No token provided'
      }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Invalid token'
      }, { status: 401 });
    }

    // Get user from database
    const [users] = await pool.execute(
      'SELECT id, name, email, role, created_at FROM users WHERE id = ?',
      [decoded.id]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    const user = users[0] as any;

    return NextResponse.json<ApiResponse<User>>({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date(user.created_at)
      }
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
