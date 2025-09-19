import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/database';
import { verifyToken, getTokenFromRequest } from '@/lib/auth';
import { ApiResponse } from '@/types';

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

    // Get user profile with user data
    const [profiles] = await pool.execute(
      `SELECT u.id, u.name, u.email, u.role, u.created_at, 
              p.bio, p.avatar_url, p.phone, p.address, p.created_at as profile_created_at
       FROM users u 
       LEFT JOIN profiles p ON u.id = p.user_id 
       WHERE u.id = ?`,
      [decoded.id]
    );

    if (!Array.isArray(profiles) || profiles.length === 0) {
      return NextResponse.json<ApiResponse>({
        success: false,
        message: 'Profile not found'
      }, { status: 404 });
    }

    const profile = profiles[0] as any;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: profile.id,
        name: profile.name,
        email: profile.email,
        role: profile.role,
        createdAt: new Date(profile.created_at),
        bio: profile.bio,
        avatarUrl: profile.avatar_url,
        phone: profile.phone,
        address: profile.address,
        profileCreatedAt: profile.profile_created_at ? new Date(profile.profile_created_at) : null
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
    const { name, bio, phone, address } = body;

    // Update user data
    if (name) {
      await pool.execute(
        'UPDATE users SET name = ? WHERE id = ?',
        [name, decoded.id]
      );
    }

    // Update profile data
    await pool.execute(
      `INSERT INTO profiles (user_id, bio, phone, address) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       bio = VALUES(bio), 
       phone = VALUES(phone), 
       address = VALUES(address)`,
      [decoded.id, bio, phone, address]
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
