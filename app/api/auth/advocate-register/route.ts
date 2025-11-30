import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
const { User } = require('@/models/init-models');
import { logUserRegistration } from '@/lib/activity-logger';
import { s3Uploader, FileValidator } from '@/lib/aws-s3';

export async function POST(request: NextRequest) {
  let uploadedFiles: string[] = []; // Track uploaded files for cleanup on error

  try {
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

    // Extract KYC files
    const aadharFile = formData.get('aadhar') as File;
    const panFile = formData.get('pan') as File;
    const cancelledChequeFile = formData.get('cancelled_cheque') as File;

    // Validate required fields
    if (!name || !email || !password || !specialization || !bar_number || !license_number) {
      const missingFields = [];
      if (!name) missingFields.push('name');
      if (!email) missingFields.push('email');
      if (!password) missingFields.push('password');
      if (!specialization) missingFields.push('specialization');
      if (!bar_number) missingFields.push('bar_number');
      if (!license_number) missingFields.push('license_number');
      
      return NextResponse.json(
        { success: false, message: `Missing required fields: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }

    // Validate KYC files are present
    if (!aadharFile || !panFile || !cancelledChequeFile) {
      const missing = [];
      if (!aadharFile) missing.push('Aadhar');
      if (!panFile) missing.push('PAN');
      if (!cancelledChequeFile) missing.push('Cancelled Cheque');
      
      return NextResponse.json(
        { success: false, message: `Missing required KYC documents: ${missing.join(', ')}` },
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

    // Generate a temporary userId for file uploads (we'll use email hash + timestamp)
    // Actually, we need to create user first to get real userId, but we want to upload files first
    // Solution: Create user first, then upload files, then update user with file paths
    // OR: Use email-based temporary path, then move files after user creation
    // Better: Create user first, upload files with userId, update user with paths
    
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
      is_approved: false
    });

    const userId = newUser.id;

    // Upload KYC files to S3
    const filePaths: { [key: string]: string } = {};
    const filesToUpload = [
      { file: aadharFile, type: 'aadhar' as const, key: 'aadhar_file_path' },
      { file: panFile, type: 'pan' as const, key: 'pan_file_path' },
      { file: cancelledChequeFile, type: 'cancelled_cheque' as const, key: 'cancelled_cheque_file_path' },
    ];

    try {
      for (const { file, type, key } of filesToUpload) {
        // Convert file to buffer
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileName = file.name;
        const mimeType = file.type;

        // Validate file type - only images and PDF
        const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];
        if (!allowedTypes.includes(mimeType)) {
          throw new Error(`Invalid file type for ${type}. Only PDF, JPEG, or PNG files are allowed.`);
        }

        // Validate file size (5MB max)
        if (fileBuffer.length > 5 * 1024 * 1024) {
          throw new Error(`File size for ${type} exceeds 5MB limit.`);
        }

        // Validate file using FileValidator
        const validation = FileValidator.validateFile(fileBuffer, fileName, mimeType);
        if (!validation.valid) {
          throw new Error(`Validation failed for ${type}: ${validation.error}`);
        }

        // Upload to S3
        const uploadResult = await s3Uploader.uploadFile({
          file: fileBuffer,
          fileName,
          mimeType,
          userId: userId,
          documentType: type,
        });

        if (!uploadResult.success || !uploadResult.key) {
          throw new Error(`Failed to upload ${type} document: ${uploadResult.error || 'Upload failed'}`);
        }

        filePaths[key] = uploadResult.key;
        uploadedFiles.push(uploadResult.key);
      }

      // Update user with file paths
      await newUser.update({
        aadhar_file_path: filePaths.aadhar_file_path,
        pan_file_path: filePaths.pan_file_path,
        cancelled_cheque_file_path: filePaths.cancelled_cheque_file_path,
      });

    } catch (uploadError: any) {
      // If file upload fails, delete uploaded files and user
      console.error('File upload error:', uploadError);
      
      // Delete uploaded files from S3
      for (const filePath of uploadedFiles) {
        try {
          await s3Uploader.deleteFile(filePath);
        } catch (deleteError) {
          console.error(`Failed to delete file ${filePath}:`, deleteError);
        }
      }

      // Delete user if created
      try {
        await newUser.destroy();
      } catch (deleteError) {
        console.error('Failed to delete user:', deleteError);
      }

      return NextResponse.json(
        { success: false, message: uploadError?.message || 'Failed to upload KYC documents' },
        { status: 500 }
      );
    }

    // Log activity (don't fail registration if logging fails)
    try {
      await logUserRegistration(newUser.toJSON ? newUser.toJSON() : newUser, 'advocate');
    } catch (logError) {
      console.error('Failed to log user registration activity:', logError);
      // Continue even if logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Advocate registered successfully. Please wait for admin approval.',
      userId,
    });

  } catch (error: any) {
    console.error('Advocate registration error:', error);
    
    // Cleanup: Delete any uploaded files if user creation failed
    for (const filePath of uploadedFiles) {
      try {
        await s3Uploader.deleteFile(filePath);
      } catch (deleteError) {
        console.error(`Failed to delete file ${filePath}:`, deleteError);
      }
    }

    const errorMessage = error?.message || 'Internal server error';
    return NextResponse.json(
      { success: false, message: errorMessage },
      { status: 500 }
    );
  }
}
