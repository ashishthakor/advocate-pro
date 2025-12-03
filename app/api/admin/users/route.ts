import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';

// Admin endpoint to create users/clients
export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can create users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Only admins can create users.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { name, email, password, phone, address } = body;

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

    // Create new user with role='user' and is_approved=true (admin created)
    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      role: 'user',
      phone: phone || null,
      address: address || null,
      is_approved: true // Auto-approved when created by admin
    });

    return NextResponse.json({
      success: true,
      message: 'User created successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        role: newUser.role,
        is_approved: newUser.is_approved
      }
    });

  } catch (error) {
    console.error('Create user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

