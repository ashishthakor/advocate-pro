import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { s3Uploader } from '@/lib/aws-s3';

// Admin endpoint to create advocates
export async function POST(request: NextRequest) {
  let uploadedFiles: string[] = [];

  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Only admin can create advocates
    if (authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Access denied. Only admins can create advocates.' },
        { status: 403 }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    
    // Extract form fields
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const phone = formData.get('phone') as string;
    const address = formData.get('address') as string;
    const specialization = formData.get('specialization') as string;
    const experience_years = parseInt(formData.get('experience_years') as string) || 0;
    const bar_number = formData.get('bar_number') as string;
    const license_number = formData.get('license_number') as string;

    // Extract KYC files (optional for admin creation)
    const aadharFile = formData.get('aadhar') as File;
    const panFile = formData.get('pan') as File;
    const cancelledChequeFile = formData.get('cancelled_cheque') as File;

    // Validate required fields
    if (!name || !email || !password || !specialization || !bar_number || !license_number) {
      return NextResponse.json(
        { success: false, message: 'Name, email, password, specialization, bar number, and license number are required' },
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

    // Create user first (without KYC paths) to get userId
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
      is_approved: true // Auto-approved when created by admin
    });

    const userId = newUser.id;

    // Upload KYC files to S3 if provided
    const filePaths: { [key: string]: string } = {};
    const filesToUpload = [
      { file: aadharFile, type: 'aadhar' as const, key: 'aadhar_file_path' },
      { file: panFile, type: 'pan' as const, key: 'pan_file_path' },
      { file: cancelledChequeFile, type: 'cancelled_cheque' as const, key: 'cancelled_cheque_file_path' },
    ];

    for (const { file, type, key } of filesToUpload) {
      // Check if file exists and is valid
      if (file && file instanceof File && file.size > 0 && file.name) {
        try {
          // Convert file to buffer
          const fileBuffer = Buffer.from(await file.arrayBuffer());
          const fileName = file.name;
          const mimeType = file.type || 'application/octet-stream';

          // Validate file type - only images and PDF
          const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
          if (!allowedTypes.includes(mimeType)) {
            console.error(`Invalid file type for ${type}: ${mimeType}`);
            continue; // Skip this file but continue with others
          }

          // Validate file size (5MB max)
          if (fileBuffer.length > 5 * 1024 * 1024) {
            console.error(`File size for ${type} exceeds 5MB limit`);
            continue; // Skip this file but continue with others
          }

          // Upload to S3
          const uploadResult = await s3Uploader.uploadFile({
            file: fileBuffer,
            fileName,
            mimeType,
            userId: userId,
            documentType: type,
          });

          if (uploadResult.success && uploadResult.key) {
            filePaths[key] = uploadResult.key;
            uploadedFiles.push(uploadResult.key);
          } else {
            console.error(`Failed to upload ${type} document: ${uploadResult.error || 'Upload failed'}`);
            // Continue with other files even if one fails
          }
        } catch (error) {
          console.error(`${type} upload error:`, error);
          // Continue with other files even if one fails
        }
      }
    }

    // Update user with file paths if any were uploaded
    if (Object.keys(filePaths).length > 0) {
      await newUser.update(filePaths);
    }

    return NextResponse.json({
      success: true,
      message: 'Advocate created successfully and auto-approved',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: newUser.phone,
        address: newUser.address,
        specialization: newUser.specialization,
        experience_years: newUser.experience_years,
        bar_number: newUser.bar_number,
        license_number: newUser.license_number,
        role: newUser.role,
        is_approved: newUser.is_approved
      }
    });

  } catch (error) {
    console.error('Create advocate error:', error);
    
    // Cleanup uploaded files on error
    if (uploadedFiles.length > 0) {
      try {
        for (const fileKey of uploadedFiles) {
          if (fileKey && typeof fileKey === 'string') {
            await s3Uploader.deleteFile(fileKey);
          }
        }
      } catch (cleanupError) {
        console.error('File cleanup error:', cleanupError);
      }
    }

    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}

