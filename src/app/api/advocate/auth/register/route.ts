import { NextRequest, NextResponse } from 'next/server';
import {pool} from '@/lib/database';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterRequest, AuthResponse } from '@/types';

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'All fields are required'
      }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'Password must be at least 6 characters long'
      }, { status: 400 });
    }

    // Check if user already exists
    const [existingUsers] = await pool.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const [result] = await pool.execute(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, 'advocate']
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Create user profile
    await pool.execute(
      'INSERT INTO profiles (user_id) VALUES (?)',
      [userId]
    );

    // Generate token
    const token = generateToken({
      id: userId,
      email,
      name,
      role: 'advocate'
    });

    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'User registered successfully',
      user: {
        id: userId,
        email,
        name,
        role: 'advocate',
        createdAt: new Date()
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json<AuthResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}
