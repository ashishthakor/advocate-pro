import { NextRequest, NextResponse } from 'next/server';
const { Notice, Case, User } = require('@/models/init-models');
const { sequelize } = require('@/lib/database');
import { verifyTokenFromRequest } from '@/lib/auth';
import { generateNoticePDF } from '@/lib/pdf-generator';
import { s3Uploader } from '@/lib/aws-s3';
import { Op, col } from 'sequelize';

export async function GET(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin, user (for their cases), and advocate (for assigned cases) can access notices
    const user = authResult.user;
    if (user.role !== 'admin' && user.role !== 'user' && user.role !== 'advocate') {
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const caseId = searchParams.get('case_id');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const noticeNumber = searchParams.get('notice_number'); // Filter by notice number
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';

    // Validate sort parameters
    const validSortColumns = ['id', 'respondent_name', 'subject', 'date', 'case_number', 'user_name', 'notice_number'];
    const validSortOrders = ['ASC', 'DESC'];
    
    if (!validSortColumns.includes(sortBy)) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort column' },
        { status: 400 }
      );
    }
    
    if (!validSortOrders.includes(sortOrder.toUpperCase())) {
      return NextResponse.json(
        { success: false, message: 'Invalid sort order' },
        { status: 400 }
      );
    }

    const whereConditions: any = {
      deleted_at: null // Only get non-deleted notices
    };
    if (caseId) {
      whereConditions.case_id = parseInt(caseId);
    }
    if (noticeNumber) {
      const noticeNum = parseInt(noticeNumber);
      if (!isNaN(noticeNum) && noticeNum > 0) {
        whereConditions.notice_number = noticeNum;
      }
    }

    // Filter by user/advocate access
    if (user.role === 'user') {
      // User can only see notices for their cases
      const userCases = await Case.findAll({
        where: { user_id: user.id },
        attributes: ['id'],
        raw: true
      });
      const userCaseIds = userCases.map((c: any) => c.id);
      if (userCaseIds.length === 0) {
        // User has no cases, return empty result
        return NextResponse.json({
          success: true,
          data: {
            notices: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        });
      }
      whereConditions.case_id = { [Op.in]: userCaseIds };
    } else if (user.role === 'advocate') {
      // Advocate can only see notices for their assigned cases
      const advocateCases = await Case.findAll({
        where: { advocate_id: user.id },
        attributes: ['id'],
        raw: true
      });
      const advocateCaseIds = advocateCases.map((c: any) => c.id);
      if (advocateCaseIds.length === 0) {
        // Advocate has no assigned cases, return empty result
        return NextResponse.json({
          success: true,
          data: {
            notices: [],
            pagination: {
              currentPage: page,
              totalPages: 0,
              totalItems: 0,
              itemsPerPage: limit,
              hasNextPage: false,
              hasPrevPage: false
            }
          }
        });
      }
      // If caseId is provided, verify it belongs to advocate
      if (caseId && !advocateCaseIds.includes(parseInt(caseId))) {
        return NextResponse.json(
          { success: false, message: 'Access denied. Case not assigned to you.' },
          { status: 403 }
        );
      }
      // Otherwise filter by advocate's cases
      if (!caseId) {
        whereConditions.case_id = { [Op.in]: advocateCaseIds };
      }
    }

    const offset = (page - 1) * limit;

    // Build include conditions
    const includeConditions: any = [
      {
        model: Case,
        as: 'case',
        required: true, // INNER JOIN to ensure case exists
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'name', 'email', 'phone', 'address']
          }
        ]
      }
    ];

    // Add search conditions - search across notice fields and related case/user fields
    if (search && search.trim() !== '') {
      const searchTerm = search.trim();
      
      // Search in notice fields directly
      const noticeSearchConditions: any[] = [
        { respondent_name: { [Op.like]: `%${searchTerm}%` } },
        { subject: { [Op.like]: `%${searchTerm}%` } },
        { respondent_address: { [Op.like]: `%${searchTerm}%` } },
        { pdf_filename: { [Op.like]: `%${searchTerm}%` } }
      ];

      try {
        // For case and user fields, find matching case IDs first
        // This is more efficient than complex nested queries
        const matchingCases = await Case.findAll({
          where: {
            [Op.or]: [
              { case_number: { [Op.like]: `%${searchTerm}%` } },
              { title: { [Op.like]: `%${searchTerm}%` } }
            ]
          },
          attributes: ['id'],
          raw: true
        });
        const matchingCaseIds = matchingCases.map((c: any) => c.id);

        // Get user IDs that match the search
        const matchingUsers = await User.findAll({
          where: {
            [Op.or]: [
              { name: { [Op.like]: `%${searchTerm}%` } },
              { email: { [Op.like]: `%${searchTerm}%` } }
            ]
          },
          attributes: ['id'],
          raw: true
        });
        const matchingUserIds = matchingUsers.map((u: any) => u.id);

        // Get case IDs for cases belonging to matching users
        if (matchingUserIds.length > 0) {
          const casesForMatchingUsers = await Case.findAll({
            where: {
              user_id: { [Op.in]: matchingUserIds }
            },
            attributes: ['id'],
            raw: true
          });
          const caseIdsForMatchingUsers = casesForMatchingUsers.map((c: any) => c.id);
          matchingCaseIds.push(...caseIdsForMatchingUsers);
        }

        // Combine all matching case IDs (remove duplicates)
        const allMatchingCaseIds = [...new Set(matchingCaseIds)];

        // Add case_id search condition if we have matches
        if (allMatchingCaseIds.length > 0) {
          noticeSearchConditions.push({ case_id: { [Op.in]: allMatchingCaseIds } });
        }
      } catch (searchError) {
        console.error('Error in search subqueries:', searchError);
        // If subquery fails, just search in notice fields
      }

      // Combine all search conditions
      whereConditions[Op.or] = noticeSearchConditions;
    }

    // Build order clause
    let orderClause: any;
    if (sortBy === 'case_number') {
      orderClause = [[{ model: Case, as: 'case' }, 'case_number', sortOrder.toUpperCase()]];
    } else if (sortBy === 'user_name') {
      orderClause = [[{ model: Case, as: 'case' }, { model: User, as: 'user' }, 'name', sortOrder.toUpperCase()]];
    } else if (sortBy === 'notice_number') {
      // Order by notice_number (integer)
      orderClause = [['notice_number', sortOrder.toUpperCase()]];
    } else {
      orderClause = [[sortBy, sortOrder.toUpperCase()]];
    }

    const { count, rows: notices } = await Notice.findAndCountAll({
      where: whereConditions,
      include: includeConditions,
      order: orderClause,
      limit,
      offset,
      distinct: true // Important when using includes to avoid duplicate counts
    });

    return NextResponse.json({
      success: true,
      data: {
        notices,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(count / limit),
          totalItems: count,
          itemsPerPage: limit,
          hasNextPage: page * limit < count,
          hasPrevPage: page > 1
        }
      }
    });
  } catch (error: any) {
    console.error('Error fetching notices:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to fetch notices' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authResult = await verifyTokenFromRequest(request);
    if (!authResult.success || !authResult.user) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Admin, user (for their cases), and advocate (for assigned cases) can create notices
    const user = authResult.user;
    if (user.role !== 'admin' && user.role !== 'user' && user.role !== 'advocate') {
      return NextResponse.json(
        { success: false, message: 'Access denied.' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { case_id, respondent_name, respondent_address, respondent_pincode, subject, content, date, recipient_email, notice_number } = body;

    // Validation
    if (!case_id || !respondent_name || !respondent_address || !respondent_pincode || !subject || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Auto-fill date if empty - convert YYYY-MM-DD to DATE for database
    let noticeDateForDB: string | null = null;
    let noticeDateForPDF: string = '';
    
    if (date && date.trim() !== '') {
      // Date comes in YYYY-MM-DD format from the form
      noticeDateForDB = date.trim();
      // Convert to DD-MM-YYYY for PDF
      const dateObj = new Date(date);
      const day = String(dateObj.getDate()).padStart(2, '0');
      const month = String(dateObj.getMonth() + 1).padStart(2, '0');
      const year = dateObj.getFullYear();
      noticeDateForPDF = `${day}-${month}-${year}`;
    } else {
      // Auto-fill with current date
      const now = new Date();
      const day = String(now.getDate()).padStart(2, '0');
      const month = String(now.getMonth() + 1).padStart(2, '0');
      const year = now.getFullYear();
      noticeDateForDB = `${year}-${month}-${day}`;
      noticeDateForPDF = `${day}-${month}-${year}`;
    }

    // Get case with user details
    const caseData = await Case.findOne({
      where: { id: case_id },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email', 'phone', 'address', 'user_type', 'company_name']
        }
      ]
    });

    if (!caseData) {
      return NextResponse.json(
        { success: false, message: 'Case not found' },
        { status: 404 }
      );
    }

    // Check access: user can only create notices for their cases, advocate for assigned cases
    if (user.role === 'user' && caseData.user_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only create notices for your cases.' },
        { status: 403 }
      );
    }
    if (user.role === 'advocate' && caseData.advocate_id !== user.id) {
      return NextResponse.json(
        { success: false, message: 'Access denied. You can only create notices for your assigned cases.' },
        { status: 403 }
      );
    }

    // Auto-determine notice_number if not provided
    let finalNoticeNumber = notice_number;
    if (!finalNoticeNumber) {
      // Count existing notices for this case (excluding deleted)
      const existingNoticesCount = await Notice.count({
        where: {
          case_id,
          deleted_at: null
        }
      });

      // Assign sequential number: next number = count + 1
      finalNoticeNumber = existingNoticesCount + 1;
    } else {
      // Validate notice_number if provided
      const noticeNum = parseInt(finalNoticeNumber);
      if (isNaN(noticeNum) || noticeNum < 1) {
        return NextResponse.json(
          { success: false, message: 'Invalid notice_number. Must be a positive integer.' },
          { status: 400 }
        );
      }
      finalNoticeNumber = noticeNum;
    }

    // Generate PDF
    const pdfBuffer = await generateNoticePDF({
      applicantName: caseData.user.name,
      applicantAddress: caseData.user.address || '',
      applicantEmail: caseData.user.email,
      applicantPhone: caseData.user.phone,
      respondentName: respondent_name,
      respondentAddress: respondent_address,
      respondentPincode: respondent_pincode,
      subject: subject,
      content: content,
      date: noticeDateForPDF,
      caseNumber: caseData.case_number,
      caseTitle: caseData.title,
      applicantCompanyName: caseData.user.user_type === 'corporate' ? caseData.user.company_name : undefined,
    });

    // Ensure S3 bucket exists
    const bucketExists = await s3Uploader.ensureBucketExists();
    if (!bucketExists) {
      return NextResponse.json(
        { success: false, message: 'Failed to access S3 bucket' },
        { status: 500 }
      );
    }

    // Upload PDF to S3
    const fileName = `notice_${Date.now()}_${case_id}.pdf`;

    const uploadResult = await s3Uploader.uploadFile({
      file: pdfBuffer,
      fileName: fileName,
      mimeType: 'application/pdf',
      folder: 'notices', // This will use the notices prefix
      caseId: case_id,
      userId: caseData.user_id,
    });

    if (!uploadResult.success || !uploadResult.key) {
      return NextResponse.json(
        { success: false, message: uploadResult.error || 'Failed to upload PDF to S3' },
        { status: 500 }
      );
    }

    // Create notice record (store only filename)
    const notice = await Notice.create({
      case_id,
      respondent_name,
      respondent_address,
      respondent_pincode,
      subject,
      content,
      date: noticeDateForDB,
      pdf_filename: fileName,
      recipient_email: recipient_email || null,
      email_sent: false,
      email_sent_count: 0,
      notice_number: finalNoticeNumber
    });

    // Fetch created notice with relations
    const createdNotice = await Notice.findOne({
      where: { id: notice.id },
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

    return NextResponse.json({
      success: true,
      message: 'Notice created successfully',
      data: createdNotice
    });
  } catch (error: any) {
    console.error('Error creating notice:', error);
    return NextResponse.json(
      { success: false, message: error.message || 'Failed to create notice' },
      { status: 500 }
    );
  }
}

