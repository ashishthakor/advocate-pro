import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { ApiResponse, User as UserType } from '@/types';
const { User } = require('models/init-models');

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

    // Get user from database using Sequelize ORM
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'created_at']
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse<UserType>>({
      success: true,
      message: 'User data retrieved successfully',
      data: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date(user.created_at),
        isApproved: user.is_approved
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
