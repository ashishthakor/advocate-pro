import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');
import { logUserRegistration } from '@/lib/activity-logger';

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address, role = 'user' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Prevent unauthorized admin creation through this endpoint
    if (role === 'admin') {
      return NextResponse.json(
        { success: false, message: 'Admin registration not allowed through this endpoint. Use /api/auth/admin-register' },
        { status: 403 }
      );
    }

    // Check if user already exists
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new user using Sequelize ORM
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role,
      phone: phone || null,
      address: address || null,
      is_approved: true // All users are auto-approved by default
    });

    const userId = newUser.id;

    // Log activity
    await logUserRegistration(newUser.toJSON ? newUser.toJSON() : newUser, role);

    return NextResponse.json({
      success: true,
      message: 'User registered successfully.',
      userId,
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
