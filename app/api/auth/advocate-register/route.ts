import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { QueryTypes } from 'sequelize';
import { sequelize } from '@/lib/database';

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
    const existingUsers = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: [email],
        type: QueryTypes.SELECT
      }
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Check if bar number already exists
    const existingBar = await sequelize.query(
      'SELECT id FROM users WHERE bar_number = ?',
      {
        replacements: [bar_number],
        type: QueryTypes.SELECT
      }
    );

    if (Array.isArray(existingBar) && existingBar.length > 0) {
      return NextResponse.json(
        { success: false, message: 'Advocate with this bar number already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new advocate
    const [result] = await sequelize.query(
      `INSERT INTO users (
        name, email, password, role, phone, address, 
        specialization, experience_years, bar_number, license_number, 
        is_approved, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [
          name, 
          email, 
          hashedPassword, 
          'advocate', 
          phone || null, 
          address || null,
          specialization,
          experience_years || 0,
          bar_number,
          license_number,
          false // Advocates need admin approval
        ],
        type: QueryTypes.INSERT
      }
    );

    const insertResult = result as any;
    const userId = insertResult[0];

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
