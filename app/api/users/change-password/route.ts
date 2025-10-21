import { NextRequest, NextResponse } from 'next/server';
import { verifyToken } from 'lib/auth';
import { sequelize } from 'lib/database';
import bcrypt from 'bcryptjs';

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
    const { currentPassword, newPassword } = body;

    // Validate required fields
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ 
        success: false, 
        message: 'Current password and new password are required' 
      }, { status: 400 });
    }

    // Validate new password length
    if (newPassword.length < 6) {
      return NextResponse.json({ 
        success: false, 
        message: 'New password must be at least 6 characters long' 
      }, { status: 400 });
    }

    // Get current user data
    const [userResults] = await sequelize.query(`
      SELECT id, password FROM users WHERE id = ?
    `, {
      replacements: [decoded.userId]
    });

    const user = userResults[0] as any;
    
    if (!user) {
      return NextResponse.json({ success: false, message: 'User not found' }, { status: 404 });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return NextResponse.json({ 
        success: false, 
        message: 'Current password is incorrect' 
      }, { status: 400 });
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await sequelize.query(`
      UPDATE users SET 
        password = ?,
        updated_at = NOW()
      WHERE id = ?
    `, {
      replacements: [hashedNewPassword, decoded.userId]
    });

    return NextResponse.json({
      success: true,
      message: 'Password changed successfully'
    });

  } catch (error) {
    console.error('Password change error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
