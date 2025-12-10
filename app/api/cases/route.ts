import { NextRequest, NextResponse } from 'next/server';
const { Case, User } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';
import { logCaseCreated } from '@/lib/activity-logger';
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

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const status = searchParams.get('status');
    const caseType = searchParams.get('case_type');
    const priority = searchParams.get('priority');
    const search = searchParams.get('search');
    const assignment = searchParams.get('assignment'); // 'assigned' or 'unassigned'
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'DESC';
    const offset = (page - 1) * limit;

    // Validate pagination parameters
    const validSortColumns = ['id', 'case_number', 'title', 'status', 'priority', 'case_type', 'created_at', 'updated_at'];
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

    // Build where conditions for Sequelize based on user role
    const whereConditions: any = {};
    
    if (authResult.user.role === 'user') {
      whereConditions.user_id = authResult.user.userId;
    } else if (authResult.user.role === 'advocate') {
      whereConditions.advocate_id = authResult.user.userId;
    }
    // Admin can see all cases, so no additional where condition

    // Add filters
    if (status) {
      whereConditions.status = status;
    }
    if (caseType) {
      whereConditions.case_type = caseType;
    }
    if (priority) {
      whereConditions.priority = priority;
    }
    if (assignment === 'assigned') {
      whereConditions.advocate_id = { [Op.ne]: null };
    } else if (assignment === 'unassigned') {
      whereConditions.advocate_id = null;
    }
    if (search) {
      whereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { case_number: { [Op.like]: `%${search}%` } }
      ];
    }

    // For advocate role with search, also search in user/client fields
    let includeConditions: any[] = [
      {
        model: User,
        as: 'user',
        attributes: [], // Don't include nested user object
        required: false
      },
      {
        model: User,
        as: 'advocate',
        attributes: [], // Don't include nested advocate object
        required: false // LEFT JOIN for advocate (can be null)
      }
    ];

    // If advocate is searching, add user field search conditions
    if (search && authResult.user.role === 'advocate') {
      includeConditions[0].where = {
        [Op.or]: [
          { name: { [Op.like]: `%${search}%` } },
          { email: { [Op.like]: `%${search}%` } },
          { phone: { [Op.like]: `%${search}%` } }
        ]
      };
      includeConditions[0].required = true; // INNER JOIN to filter by user fields
    }

    // Get cases with user and advocate information using Sequelize ORM
    // Use attributes with col to directly select joined columns as flat fields
    const cases = await Case.findAll({
      where: whereConditions,
      attributes: {
        include: [
          [col('user.name'), 'user_name'],
          [col('user.email'), 'user_email'],
          [col('user.phone'), 'user_phone'],
          [col('user.address'), 'user_address'],
          [col('user.user_type'), 'user_type'],
          [col('user.company_name'), 'user_company_name'],
          [col('advocate.name'), 'advocate_name'],
          [col('advocate.email'), 'advocate_email'],
          [col('advocate.phone'), 'advocate_phone']
        ]
      },
      include: includeConditions,
      order: [[sortBy, sortOrder.toUpperCase()]],
      limit: limit,
      offset: offset,
      raw: false // We need toJSON to work properly
    });

    // Build base where conditions for statistics (without status filter, but with other filters)
    const baseWhereConditions: any = {};
    
    if (authResult.user.role === 'user') {
      baseWhereConditions.user_id = authResult.user.userId;
    } else if (authResult.user.role === 'advocate') {
      baseWhereConditions.advocate_id = authResult.user.userId;
    }
    // Admin can see all cases, so no additional where condition
    
    if (caseType) {
      baseWhereConditions.case_type = caseType;
    }
    if (priority) {
      baseWhereConditions.priority = priority;
    }
    if (assignment === 'assigned') {
      baseWhereConditions.advocate_id = { [Op.ne]: null };
    } else if (assignment === 'unassigned') {
      baseWhereConditions.advocate_id = null;
    }
    if (search) {
      baseWhereConditions[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } },
        { case_number: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get total count
    const total = await Case.count({ 
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: []
        },
        {
          model: User,
          as: 'advocate',
          attributes: []
        }
      ]
    });
    
    const totalPages = Math.ceil(total / limit);

    // Get statistics (only for admin role, and only when not filtering by status)
    let statistics = null;
    if (authResult.user.role === 'admin' && !status) {
      const includeForStats = [
        {
          model: User,
          as: 'user',
          attributes: []
        },
        {
          model: User,
          as: 'advocate',
          attributes: [],
          required: false
        }
      ];

      // Count all statuses to ensure total matches
      const waitingForAction = await Case.count({
        where: { ...baseWhereConditions, status: 'waiting_for_action' },
        include: includeForStats
      });
      
      const neutralsNeedsAssignment = await Case.count({
        where: { ...baseWhereConditions, status: 'neutrals_needs_to_be_assigned' },
        include: includeForStats
      });
      
      const consented = await Case.count({
        where: { ...baseWhereConditions, status: 'consented' },
        include: includeForStats
      });
      
      const hold = await Case.count({
        where: { ...baseWhereConditions, status: 'hold' },
        include: includeForStats
      });
      
      const temporaryNonStarter = await Case.count({
        where: { ...baseWhereConditions, status: 'temporary_non_starter' },
        include: includeForStats
      });
      
      const completedCases = await Case.count({
        where: {
          ...baseWhereConditions,
          status: { [Op.in]: ['settled', 'closed_no_consent', 'close_no_settlement', 'withdrawn'] }
        },
        include: includeForStats
      });

      const totalFromStats = await Case.count({ where: baseWhereConditions, include: includeForStats });

      statistics = {
        total: totalFromStats,
        waiting_for_action: waitingForAction,
        neutrals_needs_to_be_assigned: neutralsNeedsAssignment,
        consented: consented,
        hold: hold,
        temporary_non_starter: temporaryNonStarter,
        completed: completedCases
      };
    }

    // Cases already have flat fields from attributes col, just convert to JSON
    const transformedCases = cases.map((case_: any) => {
      const caseData = case_.toJSON ? case_.toJSON() : case_;
      return {
        ...caseData,
        // Ensure advocate_id is properly set (could be null)
        advocate_id: caseData.advocate_id || null,
        // Ensure flat fields are set (they should already be there from col())
        user_name: caseData.user_name || null,
        user_email: caseData.user_email || null,
        user_phone: caseData.user_phone || null,
        user_address: caseData.user_address || null,
        user_type: caseData.user_type || null,
        user_company_name: caseData.user_company_name || null,
        advocate_name: caseData.advocate_name || null,
        advocate_email: caseData.advocate_email || null,
        advocate_phone: caseData.advocate_phone || null,
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        cases: transformedCases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        },
        ...(statistics && { statistics })
      }
    });

  } catch (error) {
    console.error('Get cases error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
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

    // Only users and admins can create cases
    if (authResult.user.role !== 'user' && authResult.user.role !== 'admin') {
      return NextResponse.json(
        { success: false, message: 'Only users and admins can create cases' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      title,
      description,
      case_type,
      priority,
      court_name,
      judge_name,
      next_hearing_date,
      fees,
      fees_paid,
      start_date,
      end_date,
      user_id, // Allow admin to specify user_id
      advocate_id, // Allow admin to specify advocate_id
      // Requester
      requester_name,
      requester_email,
      requester_phone,
      requester_address,
      // Respondent
      respondent_name,
      respondent_phone,
      respondent_email,
      respondent_address,
      // Dispute
      relationship_between_parties,
      nature_of_dispute,
      brief_description_of_dispute,
      occurrence_date,
      // Prior comms
      prior_communication,
      prior_communication_other,
      // Relief sought
      sought_monetary_claim,
      sought_settlement,
      sought_other,
      // Attachments
      attachments_json,
    } = body || {};

    if (!title || !description) {
      return NextResponse.json(
        { success: false, message: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Generate case number
    const caseNumber = `CASE-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

    // Create new case using Sequelize ORM
    const newCase = await Case.create({
      case_number: caseNumber,
      title,
      description,
      case_type: case_type || 'civil',
      priority: priority || 'medium',
      user_id: (authResult.user.role === 'admin' && user_id) ? user_id : authResult.user.userId,
      advocate_id: (authResult.user.role === 'admin' && advocate_id) ? advocate_id : null,
      court_name: court_name || null,
      judge_name: judge_name || null,
      next_hearing_date: next_hearing_date || null,
      fees: fees || 0.00,
      fees_paid: fees_paid || 0.00,
      start_date: start_date || null,
      end_date: end_date || null,
      requester_name: requester_name || null,
      requester_email: requester_email || null,
      requester_phone: requester_phone || null,
      requester_address: requester_address || null,
      respondent_name: respondent_name || null,
      respondent_phone: respondent_phone || null,
      respondent_email: respondent_email || null,
      respondent_address: respondent_address || null,
      relationship_between_parties: relationship_between_parties || null,
      nature_of_dispute: nature_of_dispute || null,
      brief_description_of_dispute: brief_description_of_dispute || null,
      occurrence_date: occurrence_date || null,
      prior_communication: prior_communication || null,
      prior_communication_other: prior_communication_other || null,
      sought_monetary_claim: !!sought_monetary_claim,
      sought_settlement: !!sought_settlement,
      sought_other: sought_other || null,
      attachments_json: attachments_json || null
    });

    // Fetch the created case with joined user/advocate fields using Sequelize ORM
    // Use attributes with col to directly select joined columns as flat fields
    const createdCase = await Case.findOne({
      where: { case_number: caseNumber },
      attributes: {
        include: [
          [col('user.name'), 'user_name'],
          [col('user.email'), 'user_email'],
          [col('advocate.name'), 'advocate_name'],
          [col('advocate.email'), 'advocate_email']
        ]
      },
      include: [
        {
          model: User,
          as: 'user',
          attributes: [] // Don't include nested user object
        },
        {
          model: User,
          as: 'advocate',
          attributes: [], // Don't include nested advocate object
          required: false // LEFT JOIN for advocate (can be null)
        }
      ]
    });

    // Case already has flat fields from attributes col, just convert to JSON
    const caseData = createdCase?.toJSON ? createdCase.toJSON() : createdCase;
    const transformedCase = {
      ...caseData,
      advocate_id: caseData?.advocate_id || null,
    };

    // Log activity
    await logCaseCreated(transformedCase, authResult.user.userId);

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: transformedCase
    });

  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
