import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { sequelize } from '@/lib/database';

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
    const existingUsers = await sequelize.query(
      'SELECT id FROM users WHERE email = ?',
      {
        replacements: [email],
        type: sequelize.QueryTypes.SELECT
      }
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { success: false, message: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Insert new user
    const [result] = await sequelize.query(
      `INSERT INTO users (name, email, password, role, phone, address, is_approved, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      {
        replacements: [name, email, hashedPassword, role, phone || null, address || null, role === 'admin'],
        type: sequelize.QueryTypes.INSERT
      }
    );

    const insertResult = result as any;
    const userId = insertResult[0];

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
