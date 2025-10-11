import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '@/lib/database';
import { verifyTokenFromRequest, hasRole } from '@/lib/auth';
import { QueryTypes } from 'sequelize';

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

    let whereClause = '';
    let replacements: any[] = [];

    // Build where clause based on user role
    if (authResult.user.role === 'user') {
      whereClause = 'WHERE c.user_id = ?';
      replacements.push(authResult.user.userId);
    } else if (authResult.user.role === 'advocate') {
      whereClause = 'WHERE c.advocate_id = ?';
      replacements.push(authResult.user.userId);
    }
    // Admin can see all cases, so no additional where clause

    // Add filters
    const filters = [];
    if (status) {
      filters.push('c.status = ?');
      replacements.push(status);
    }
    if (caseType) {
      filters.push('c.case_type = ?');
      replacements.push(caseType);
    }
    if (priority) {
      filters.push('c.priority = ?');
      replacements.push(priority);
    }
    if (search) {
      filters.push('(c.title LIKE ? OR c.description LIKE ? OR c.case_number LIKE ? OR u.name LIKE ? OR a.name LIKE ?)');
      replacements.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (filters.length > 0) {
      whereClause += whereClause ? ' AND ' + filters.join(' AND ') : 'WHERE ' + filters.join(' AND ');
    }

    // Get cases with user and advocate information
    const cases = await sequelize.query(`
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        a.name as advocate_name,
        a.email as advocate_email
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.advocate_id = a.id
      ${whereClause}
      ORDER BY c.${sortBy} ${sortOrder.toUpperCase()}
      LIMIT ? OFFSET ?
    `, {
      replacements: [...replacements, limit, offset],
      type: QueryTypes.SELECT
    });

    // Get total count
    const totalResult = await sequelize.query(`
      SELECT COUNT(*) as total
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.advocate_id = a.id
      ${whereClause}
    `, {
      replacements,
      type: QueryTypes.SELECT
    });

    const total = (totalResult[0] as any).total;
    const totalPages = Math.ceil(total / limit);

    return NextResponse.json({
      success: true,
      data: {
        cases,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: total,
          itemsPerPage: limit,
          hasNextPage: page < totalPages,
          hasPrevPage: page > 1
        }
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

    // Only users can create cases
    if (authResult.user.role !== 'user') {
      return NextResponse.json(
        { success: false, message: 'Only users can create cases' },
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

    // Insert new case
    await sequelize.query(`
      INSERT INTO cases (
        case_number, title, description, case_type, priority, user_id,
        court_name, judge_name, next_hearing_date, fees, fees_paid,
        start_date, end_date,
        requester_name, requester_email, requester_phone, requester_address,
        respondent_name, respondent_phone, respondent_email, respondent_address,
        relationship_between_parties, nature_of_dispute, brief_description_of_dispute, occurrence_date,
        prior_communication, prior_communication_other,
        sought_monetary_claim, sought_settlement, sought_other,
        attachments_json,
        created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
    `, {
      replacements: [
        caseNumber, 
        title, 
        description, 
        case_type || 'civil', 
        priority || 'medium', 
        authResult.user.userId,
        court_name || null, 
        judge_name || null, 
        next_hearing_date || null, 
        fees || 0.00, 
        fees_paid || 0.00,
        start_date || null, 
        end_date || null,
        requester_name || null, 
        requester_email || null, 
        requester_phone || null, 
        requester_address || null,
        respondent_name || null, 
        respondent_phone || null, 
        respondent_email || null, 
        respondent_address || null,
        relationship_between_parties || null, 
        nature_of_dispute || null, 
        brief_description_of_dispute || null, 
        occurrence_date || null,
        prior_communication || null, 
        prior_communication_other || null,
        !!sought_monetary_claim, 
        !!sought_settlement, 
        sought_other || null,
        attachments_json || null
      ],
      type: QueryTypes.INSERT
    });

    // Fetch the created case with joined user/advocate fields to match FE expectations
    const created = await sequelize.query(`
      SELECT 
        c.*,
        u.name as user_name,
        u.email as user_email,
        a.name as advocate_name,
        a.email as advocate_email
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.advocate_id = a.id
      WHERE c.case_number = ?
    `, {
      replacements: [caseNumber],
      type: QueryTypes.SELECT
    });

    return NextResponse.json({
      success: true,
      message: 'Case created successfully',
      data: created[0]
    });

  } catch (error) {
    console.error('Create case error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
