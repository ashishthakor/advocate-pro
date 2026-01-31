/**
 * Helper functions for notice operations
 */

const { Notice } = require('@/models/init-models');

/**
 * Calculate the next notice stage for a given case
 * @param caseId - The case ID
 * @returns Promise<string> - The next notice stage (e.g., "Notice-1", "Notice-2")
 */
export async function getNextNoticeStage(caseId: number): Promise<string> {
  const count = await Notice.count({
    where: {
      case_id: caseId,
      deleted_at: null
    }
  });
  return `Notice-${count + 1}`;
}

/**
 * Validate file type for notice uploads
 * @param mimeType - The MIME type of the file
 * @param fileName - The file name
 * @returns boolean - True if file type is valid
 */
export function isValidNoticeFileType(mimeType: string, fileName: string): boolean {
  const allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
  ];
  
  const allowedExtensions = ['.pdf', '.doc', '.docx'];
  const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
  
  return allowedMimeTypes.includes(mimeType) || allowedExtensions.includes(fileExtension);
}

/**
 * Validate file size (max 10MB)
 * @param fileSize - The file size in bytes
 * @returns boolean - True if file size is valid
 */
export function isValidNoticeFileSize(fileSize: number): boolean {
  const maxSize = 10 * 1024 * 1024; // 10MB
  return fileSize <= maxSize;
}
