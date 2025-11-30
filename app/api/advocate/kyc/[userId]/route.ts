import { NextRequest, NextResponse } from 'next/server';
import { s3Uploader } from '@/lib/aws-s3';
import { verifyTokenFromRequest } from '@/lib/auth';
const { User } = require('@/models/init-models');

// Get KYC documents for an advocate with presigned URLs
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    // Verify authentication
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { userId } = await params;
    const userIdNum = parseInt(userId);

    if (isNaN(userIdNum)) {
      return NextResponse.json(
        { success: false, message: 'Invalid user ID' },
        { status: 400 }
      );
    }

    // Check if user is admin or viewing their own KYC
    const isAdmin = authResult.user?.role === 'admin';
    const isOwnKYC = authResult.user?.userId === userIdNum;

    if (!isAdmin && !isOwnKYC) {
      return NextResponse.json(
        { success: false, message: 'Forbidden: You can only view your own KYC documents' },
        { status: 403 }
      );
    }

    // Get user from database
    const user = await User.findByPk(userIdNum);

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user is an advocate
    if (user.role !== 'advocate') {
      return NextResponse.json(
        { success: false, message: 'User is not an advocate' },
        { status: 400 }
      );
    }

    const kycDocuments: {
      aadhar?: { filePath: string; presignedUrl: string };
      pan?: { filePath: string; presignedUrl: string };
      cancelled_cheque?: { filePath: string; presignedUrl: string };
    } = {};

    // Generate presigned URLs for existing documents
    if (user.aadhar_file_path) {
      try {
        const presignedUrl = await s3Uploader.generateDownloadUrl(user.aadhar_file_path, 3600);
        kycDocuments.aadhar = {
          filePath: user.aadhar_file_path,
          presignedUrl,
        };
      } catch (error) {
        console.error('Error generating presigned URL for Aadhar:', error);
      }
    }

    if (user.pan_file_path) {
      try {
        const presignedUrl = await s3Uploader.generateDownloadUrl(user.pan_file_path, 3600);
        kycDocuments.pan = {
          filePath: user.pan_file_path,
          presignedUrl,
        };
      } catch (error) {
        console.error('Error generating presigned URL for PAN:', error);
      }
    }

    if (user.cancelled_cheque_file_path) {
      try {
        const presignedUrl = await s3Uploader.generateDownloadUrl(user.cancelled_cheque_file_path, 3600);
        kycDocuments.cancelled_cheque = {
          filePath: user.cancelled_cheque_file_path,
          presignedUrl,
        };
      } catch (error) {
        console.error('Error generating presigned URL for Cancelled Cheque:', error);
      }
    }

    return NextResponse.json({
      success: true,
      data: kycDocuments,
    });

  } catch (error: any) {
    console.error('Get KYC documents error:', error);
    return NextResponse.json(
      { success: false, message: error?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

