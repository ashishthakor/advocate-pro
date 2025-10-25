import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address, role = 'user' } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
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
      is_approved: role === 'admin' // Admins are auto-approved
    });

    const userId = newUser.id;

    return NextResponse.json({
      success: true,
      message: 'User registered successfully. Please wait for admin approval.',
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
