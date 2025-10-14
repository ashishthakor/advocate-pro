import { NextRequest, NextResponse } from 'next/server';
import { hashPassword, generateToken } from '@/lib/auth';
import { RegisterRequest, AuthResponse } from '@/types';
const { User } = require('models/init-models');

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

    // Check if user already exists using Sequelize ORM
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json<AuthResponse>({
        success: false,
        message: 'User with this email already exists'
      }, { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with 'user' role using Sequelize ORM
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user'
    });

    // // Create user profile using Sequelize ORM
    // await Profile.create({
    //   user_id: user.id
    // });

    // Generate token with 'user' role
    const token = generateToken({
      id: user.id,
      email,
      name,
      role: 'user'
    });

    return NextResponse.json<AuthResponse>({
      success: true,
      message: 'User registered successfully',
      user: {
        id: user.id,
        email,
        name,
        role: 'user',
        createdAt: user.created_at,
        isApproved: user.is_approved === 1
      },
      token
    }, { status: 201 });

  } catch (error) {
    console.error('User registration error:', error); // Updated error message
    return NextResponse.json<AuthResponse>({
      success: false,
      message: 'Internal server error'
    }, { status: 500 });
  }
}