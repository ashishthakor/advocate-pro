import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('models/init-models');

export async function POST(request: NextRequest) {
  try {
    const { 
      name, 
      email, 
      password, 
      phone, 
      address, 
      specialization, 
      experience_years, 
      bar_number, 
      license_number 
    } = await request.json();

    if (!name || !email || !password || !specialization || !bar_number || !license_number) {
      return NextResponse.json(
        { success: false, message: 'All required fields must be provided' },
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

    // Check if bar number already exists
    const existingBar = await User.findOne({
      where: { bar_number: bar_number }
    });

    if (existingBar) {
      return NextResponse.json(
        { success: false, message: 'Advocate with this bar number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create new advocate using Sequelize ORM
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'advocate',
      phone: phone || null,
      address: address || null,
      specialization,
      experience_years: experience_years || 0,
      bar_number,
      license_number,
      is_approved: false // Advocates need admin approval
    });

    const userId = newUser.id;

    return NextResponse.json({
      success: true,
      message: 'Advocate registered successfully. Please wait for admin approval.',
      userId,
    });

  } catch (error) {
    console.error('Advocate registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
