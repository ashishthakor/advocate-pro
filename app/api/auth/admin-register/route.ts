import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');

export async function POST(request: NextRequest) {
  try {
    const { name, email, password, phone, address, adminKey } = await request.json();

    // Validate required fields
    if (!name || !email || !password) {
      return NextResponse.json(
        { success: false, message: 'Name, email, and password are required' },
        { status: 400 }
      );
    }

    // Security: Require admin key for creating admin users
    const requiredAdminKey = process.env.ADMIN_REGISTRATION_KEY || 'ADMIN_SECRET_KEY_2025';
    if (!adminKey || adminKey !== requiredAdminKey) {
      return NextResponse.json(
        { success: false, message: 'Invalid admin registration key' },
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

    // Create new admin user
    const newAdmin = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'admin',
      phone: phone || null,
      address: address || null,
      is_approved: true // Admins are auto-approved
    });

    const adminId = newAdmin.id;

    return NextResponse.json({
      success: true,
      message: 'Admin user created successfully',
      adminId,
      admin: {
        id: adminId,
        name: newAdmin.name,
        email: newAdmin.email,
        role: newAdmin.role,
        is_approved: newAdmin.is_approved
      }
    });

  } catch (error) {
    console.error('Admin registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
