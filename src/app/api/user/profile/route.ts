import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';
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

    // Get user profile using Sequelize ORM
    const user = await User.findByPk(decoded.id, {
      attributes: ['id', 'name', 'email', 'role', 'phone', 'address', 'created_at']
    });

    if (!user) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Profile not found'
      }, { status: 404 });
    }

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt: new Date(user.created_at),
        phone: user.phone,
        address: user.address
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
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

    const body = await request.json();
    const { name, phone, address } = body;

    // Update user data using Sequelize ORM
    await User.update(
      { name, phone, address },
      { where: { id: decoded.id } }
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile updated successfully'
    });

  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json<ApiResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
