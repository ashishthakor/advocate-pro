/**
 * Activity Logger Utility
 * 
 * This utility provides functions to log various activities in the system
 * for display in the admin dashboard's recent activity section.
 */

const { RecentActivity } = require('@/models/init-models');

/**
 * Log an activity to the recent_activities table
 * 
 * @param {Object} options - Activity options
 * @param {string} options.type - Activity type (e.g., 'case_created', 'user_registration')
 * @param {string} options.message - Human-readable activity message
 * @param {string} options.status - Activity status: 'success', 'warning', 'error', 'info' (default: 'info')
 * @param {number} [options.userId] - ID of user who performed the action
 * @param {number} [options.relatedId] - ID of related entity (e.g., case_id)
 * @param {string} [options.relatedType] - Type of related entity (e.g., 'case', 'user')
 * @param {Object} [options.metadata] - Additional metadata in JSON format
 * @returns {Promise<Object>} Created activity record
 */
async function logActivity({
  type,
  message,
  status = 'info',
  userId = null,
  relatedId = null,
  relatedType = null,
  metadata = null
}) {
  try {
    const activity = await RecentActivity.create({
      type,
      message,
      status,
      user_id: userId,
      related_id: relatedId,
      related_type: relatedType,
      metadata: metadata || null
    });

    return activity;
  } catch (error) {
    console.error('Error logging activity:', error);
    // Don't throw error - activity logging should not break the main flow
    return null;
  }
}

/**
 * Log a case creation activity
 */
async function logCaseCreated(caseData, userId) {
  return logActivity({
    type: 'case_created',
    message: `New case "${caseData.title}" created by ${caseData.user?.name || 'Unknown User'}`,
    status: 'info',
    userId: userId,
    relatedId: caseData.id,
    relatedType: 'case',
    metadata: {
      case_number: caseData.case_number,
      case_type: caseData.case_type
    }
  });
}

/**
 * Log a case assignment activity
 */
async function logCaseAssigned(caseData, advocateId, advocateName) {
  return logActivity({
    type: 'case_assigned',
    message: `Case "${caseData.title}" assigned to ${advocateName}`,
    status: 'info',
    userId: advocateId,
    relatedId: caseData.id,
    relatedType: 'case',
    metadata: {
      case_number: caseData.case_number
    }
  });
}

/**
 * Log a case status change activity
 */
async function logCaseStatusChanged(caseData, oldStatus, newStatus, userId) {
  return logActivity({
    type: 'case_status_changed',
    message: `Case "${caseData.title}" status changed from ${oldStatus} to ${newStatus}`,
    status: 'info',
    userId: userId,
    relatedId: caseData.id,
    relatedType: 'case',
    metadata: {
      case_number: caseData.case_number,
      old_status: oldStatus,
      new_status: newStatus
    }
  });
}

/**
 * Log a user registration activity
 */
async function logUserRegistration(userData, role = 'user') {
  const roleLabel = role === 'advocate' ? 'advocate' : 'user';
  const needsApproval = role === 'advocate';
  
  return logActivity({
    type: 'user_registration',
    message: `New ${roleLabel} registration: ${userData.name} (${userData.email})${needsApproval ? ' - pending approval' : ''}`,
    status: needsApproval ? 'warning' : 'success',
    userId: userData.id,
    relatedId: userData.id,
    relatedType: 'user',
    metadata: {
      role: role,
      email: userData.email
    }
  });
}

/**
 * Log an advocate approval activity
 */
async function logAdvocateApproval(userData, approvedBy) {
  return logActivity({
    type: 'advocate_approval',
    message: `Advocate ${userData.name} has been ${userData.is_approved ? 'approved' : 'rejected'}`,
    status: userData.is_approved ? 'success' : 'warning',
    userId: approvedBy,
    relatedId: userData.id,
    relatedType: 'user',
    metadata: {
      advocate_name: userData.name,
      advocate_email: userData.email
    }
  });
}

/**
 * Log a document upload activity
 */
async function logDocumentUpload(documentData, userId) {
  return logActivity({
    type: 'document_uploaded',
    message: `Document "${documentData.original_name}" uploaded to case`,
    status: 'info',
    userId: userId,
    relatedId: documentData.case_id,
    relatedType: 'case',
    metadata: {
      document_id: documentData.id,
      file_name: documentData.original_name
    }
  });
}

/**
 * Log a system update activity
 */
async function logSystemUpdate(message, status = 'info') {
  return logActivity({
    type: 'system_update',
    message: message,
    status: status,
    userId: null,
    relatedId: null,
    relatedType: null,
    metadata: null
  });
}

module.exports = {
  logActivity,
  logCaseCreated,
  logCaseAssigned,
  logCaseStatusChanged,
  logUserRegistration,
  logAdvocateApproval,
  logDocumentUpload,
  logSystemUpdate
};

