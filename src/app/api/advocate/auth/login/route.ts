// Corrected app/api/advocate/auth/login/route.ts
// It now queries the 'users' table and checks for the 'advocate' role

import { NextRequest, NextResponse } from 'next/server';
import {pool} from '@/lib/database';
import { verifyPassword, generateToken } from '@/lib/auth';
import { LoginRequest, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Email and password are required'
      }, { status: 400 });
    }

    // Query the 'users' table for the provided email
    const [users] = await pool.execute(
      'SELECT id, name, email, password, role, created_at FROM users WHERE email = ?',
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    const user = users[0] as any;

    // Check if the user has the correct role for this login endpoint
    if (user.role !== 'advocate') {
        return NextResponse.json<AuthResponse>({
            success: false,
            message: 'Invalid email or password'
        }, { status: 401 });
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Invalid email or password'
      }, { status: 401 });
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    });

    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: new Date(user.created_at)
      },
      token
    });

  } catch (error) {
    console.error('Advocate login error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}