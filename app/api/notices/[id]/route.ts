import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';

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

    // Only admin can access notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const notice = await Notice.findOne({
      where: { 
        id: noticeId,
        deleted_at: null // Only get non-deleted notices
      },
      include: [
        {
          model: Case,
          as: 'case',
          include: [
            {
              model: User,
              as: 'user',
              attributes: ['id', 'name', 'email', 'phone', 'address']
            }
          ]
        }
      ]
    });

    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: notice
    });
  } catch (error: any) {
    console.error('Error fetching notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notice' },
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

    // Only admin can delete notices
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Admin only.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    const noticeId = parseInt(id);

    const notice = await Notice.findOne({ 
      where: { 
        id: noticeId,
        deleted_at: null // Only allow deleting non-deleted notices
      } 
    });
    if (!notice) {
      return NextResponse.json(
        { success: false, message: 'Notice not found' },
        { status: 404 }
      );
    }

    // Soft delete: destroy() with paranoid mode will set deleted_at timestamp
    await notice.destroy();

    return NextResponse.json({
      success: true,
      message: 'Notice deleted successfully'
    });
  } catch (error: any) {
    console.error('Error deleting notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to delete notice' },
      { status: 500 }
    );
  }
}

