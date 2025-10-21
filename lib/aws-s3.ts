import AWS from 'aws-sdk';
import { v4 as uuidv4 } from 'uuid';

// Configure AWS SDK
AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1',
});

const s3 = new AWS.S3();

export interface UploadFileParams {
  file: Buffer;
  fileName: string;
  mimeType: string;
  folder?: string;
  caseId?: number;
  userId?: number;
}

export interface S3UploadResult {
  success: boolean;
  url?: string;
  key?: string;
  error?: string;
}

export class S3FileUploader {
  private bucketName: string;

  constructor() {
    this.bucketName = process.env.AWS_S3_BUCKET_NAME || 'legal-case-management-files';
  }

  /**
   * Upload file to S3 bucket
   */
  async uploadFile(params: UploadFileParams): Promise<S3UploadResult> {
    try {
      const { file, fileName, mimeType, folder = 'documents', caseId, userId } = params;
      
      // Generate unique file key with new structure: <user_id_with_user>/<case_id_with_case>/file_name
      const fileExtension = fileName.split('.').pop();
      const uniqueFileName = `${uuidv4()}.${fileExtension}`;
      const fileKey = `${userId ? `user-${userId}` : 'anonymous'}/${caseId ? `case-${caseId}` : 'general'}/${uniqueFileName}`;

      const uploadParams = {
        Bucket: this.bucketName,
        Key: fileKey,
        Body: file,
        ContentType: mimeType,
        ACL: 'private', // Private by default for security
        Metadata: {
          originalName: fileName,
          uploadedBy: userId?.toString() || 'anonymous',
          caseId: caseId?.toString() || 'none',
          uploadedAt: new Date().toISOString(),
        },
      };

      const result = await s3.upload(uploadParams).promise();
      
      return {
        success: true,
        url: result.Location,
        key: result.Key,
      };
    } catch (error) {
      console.error('S3 upload error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Upload failed',
      };
    }
  }

  /**
   * Generate presigned URL for file download
   */
  async generateDownloadUrl(key: string, expiresIn: number = 3600): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
        Expires: expiresIn,
      };

      return await s3.getSignedUrlPromise('getObject', params);
    } catch (error) {
      console.error('S3 presigned URL error:', error);
      throw new Error('Failed to generate download URL');
    }
  }

  /**
   * Delete file from S3
   */
  async deleteFile(key: string): Promise<boolean> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      await s3.deleteObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 delete error:', error);
      return false;
    }
  }

  /**
   * Get file metadata
   */
  async getFileMetadata(key: string) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: key,
      };

      const result = await s3.headObject(params).promise();
      return {
        size: result.ContentLength,
        lastModified: result.LastModified,
        contentType: result.ContentType,
        metadata: result.Metadata,
      };
    } catch (error) {
      console.error('S3 metadata error:', error);
      return null;
    }
  }

  /**
   * List files in a folder
   */
  async listFiles(prefix: string, maxKeys: number = 1000) {
    try {
      const params = {
        Bucket: this.bucketName,
        Prefix: prefix,
        MaxKeys: maxKeys,
      };

      const result = await s3.listObjectsV2(params).promise();
      return result.Contents || [];
    } catch (error) {
      console.error('S3 list error:', error);
      return [];
    }
  }

  /**
   * Copy file within S3
   */
  async copyFile(sourceKey: string, destinationKey: string): Promise<boolean> {
    try {
      const params = {
        Bucket: this.bucketName,
        CopySource: `${this.bucketName}/${sourceKey}`,
        Key: destinationKey,
      };

      await s3.copyObject(params).promise();
      return true;
    } catch (error) {
      console.error('S3 copy error:', error);
      return false;
    }
  }
}

// File validation utilities
export class FileValidator {
  static readonly ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  static readonly ALLOWED_DOCUMENT_TYPES = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'application/rtf',
  ];
  static readonly MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

  static validateFile(file: Buffer, fileName: string, mimeType: string): { valid: boolean; error?: string } {
    // Check file size
    if (file.length > this.MAX_FILE_SIZE) {
      return {
        valid: false,
        error: `File size exceeds maximum allowed size of ${this.MAX_FILE_SIZE / (1024 * 1024)}MB`,
      };
    }

    // Check file type
    const allowedTypes = [...this.ALLOWED_IMAGE_TYPES, ...this.ALLOWED_DOCUMENT_TYPES];
    if (!allowedTypes.includes(mimeType)) {
      return {
        valid: false,
        error: 'File type not allowed. Please upload images (JPEG, PNG, GIF, WebP) or documents (PDF, DOC, DOCX, TXT, RTF)',
      };
    }

    // Check file extension
    const fileExtension = fileName.split('.').pop()?.toLowerCase();
    const allowedExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'pdf', 'doc', 'docx', 'txt', 'rtf'];
    if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
      return {
        valid: false,
        error: 'Invalid file extension',
      };
    }

    return { valid: true };
  }

  static isImage(mimeType: string): boolean {
    return this.ALLOWED_IMAGE_TYPES.includes(mimeType);
  }

  static isDocument(mimeType: string): boolean {
    return this.ALLOWED_DOCUMENT_TYPES.includes(mimeType);
  }
}

export const s3Uploader = new S3FileUploader();
