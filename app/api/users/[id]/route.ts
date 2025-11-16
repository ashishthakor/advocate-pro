import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/database';
import { QueryTypes } from 'sequelize';
import { verifyTokenFromRequest } from '@/lib/auth';
import { logAdvocateApproval } from '@/lib/activity-logger';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Get user details
    const users = await sequelize.query(`
      SELECT 
        id, name, email, role, is_approved, phone, address,
        specialization, experience_years, bar_number, license_number,
        created_at, updated_at
      FROM users
      WHERE id = ?
    `, {
      replacements: [userId],
      type: QueryTypes.SELECT
    });

    if (users.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: users[0]
    });

  } catch (error) {
    console.error('Get user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can update users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);
    const updateData = await request.json();

    // Check if user exists
    const existingUsers = await sequelize.query(`
      SELECT * FROM users WHERE id = ?
    `, {
      replacements: [userId],
      type: QueryTypes.SELECT
    });

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Build update query
    const allowedFields = [
      'name', 'phone', 'address', 'specialization', 
      'experience_years', 'bar_number', 'license_number', 'is_approved'
    ];
    const updateFields = [];
    const replacements = [];

    for (const [key, value] of Object.entries(updateData)) {
      if (allowedFields.includes(key) && value !== undefined) {
        updateFields.push(`${key} = ?`);
        replacements.push(value);
      }
    }

    if (updateFields.length === 0) {
      return NextResponse.json(
        { success: false, message: 'No valid fields to update' },
        { status: 400 }
      );
    }

    replacements.push(userId);

    // Check if is_approved is being changed (for activity logging)
    const oldUser = existingUsers[0] as any;
    const isApprovalChange = updateData.hasOwnProperty('is_approved') && 
                             updateData.is_approved !== oldUser.is_approved;

    await sequelize.query(`
      UPDATE users 
      SET ${updateFields.join(', ')}, updated_at = NOW()
      WHERE id = ?
    `, {
      replacements,
        type: QueryTypes.UPDATE
    });

    // Log activity if advocate approval status changed
    if (isApprovalChange && oldUser.role === 'advocate') {
      const updatedUser = await sequelize.query(
        'SELECT * FROM users WHERE id = ?',
        {
          replacements: [userId],
          type: QueryTypes.SELECT
        }
      );
      if (updatedUser && Array.isArray(updatedUser) && updatedUser.length > 0) {
        await logAdvocateApproval(updatedUser[0] as any, authResult.user.userId);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'User updated successfully'
    });

  } catch (error) {
    console.error('Update user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can delete users
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const userId = parseInt(id);

    // Prevent admin from deleting themselves
    if (userId === authResult.user.userId) {
      return NextResponse.json(
        { success: false, message: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUsers = await sequelize.query(`
      SELECT * FROM users WHERE id = ?
    `, {
      replacements: [userId],
      type: QueryTypes.SELECT
    });

    if (existingUsers.length === 0) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Delete user (cascade will handle related records)
    await sequelize.query(`
      DELETE FROM users WHERE id = ?
    `, {
      replacements: [userId],
      type: QueryTypes.DELETE
    });

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Delete user error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
