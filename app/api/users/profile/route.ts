import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from 'lib/auth';
import { sequelize } from 'lib/database';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const [results] = await sequelize.query(`
      SELECT 
        id, name, email, phone, address, role, is_approved,
        specialization, experience_years, bar_number, license_number,
        created_at, updated_at
      FROM users 
      WHERE id = ?
    `, {
      replacements: [decoded.userId]
    });

    const user = results[0] as any;
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: user
    });

  } catch (error) {
    console.error('Profile fetch error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ success: false, message: 'No token provided' }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ success: false, message: 'Invalid token' }, { status: 401 });
    }

    const body = await request.json();
    const { name, email, phone, address, specialization, experience_years, bar_number, license_number } = body;

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json({ 
        success: false, 
        message: 'Name and email are required' 
      }, { status: 400 });
    }

    // Check if email is already taken by another user
    const [existingUser] = await sequelize.query(`
      SELECT id FROM users WHERE email = ? AND id != ?
    `, {
      replacements: [email, decoded.userId]
    });

    if (existingUser.length > 0) {
      return NextResponse.json({ 
        success: false, 
        message: 'Email is already taken' 
      }, { status: 400 });
    }

    // Update user profile
    const [results] = await sequelize.query(`
      UPDATE users SET 
        name = ?,
        email = ?,
        phone = ?,
        address = ?,
        specialization = ?,
        experience_years = ?,
        bar_number = ?,
        license_number = ?,
        updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [
        name,
        email,
        phone || null,
        address || null,
        specialization || null,
        experience_years || null,
        bar_number || null,
        license_number || null,
        decoded.userId
      ]
    });

    // Fetch updated user data
    const [updatedUser] = await sequelize.query(`
      SELECT 
        id, name, email, phone, address, role, is_approved,
        specialization, experience_years, bar_number, license_number,
        created_at, updated_at
      FROM users 
      WHERE id = ?
    `, {
      replacements: [decoded.userId]
    });

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      data: updatedUser[0]
    });

  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
