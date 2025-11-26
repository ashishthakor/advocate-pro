import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');
import { logUserRegistration } from '@/lib/activity-logger';

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

    // Validate required fields
    if (!name || !email || !password || !specialization || !bar_number || !license_number) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!specialization) missingFields.push('specialization');
      if (!bar_number) missingFields.push('bar_number');
      if (!license_number) missingFields.push('license_number');
      
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
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

    // Log activity (don't fail registration if logging fails)
    try {
      await logUserRegistration(newUser.toJSON ? newUser.toJSON() : newUser, 'advocate');
    } catch (logError) {
      console.error('Failed to log user registration activity:', logError);
      // Continue even if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Advocate registered successfully. Please wait for admin approval.',
      userId,
    });

  } catch (error: any) {
    console.error('Advocate registration error:', error);
    const errorMessage = error?.message || 'Internal server error';
    // Don't expose full error object in production
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
