import { NextRequest, NextResponse } from 'next/server';
import { sequelize } from '../../../lib/database';
import { verifyTokenFromRequest } from '@/lib/auth';
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

    const userId = authResult.user.userId;
    const userRole = authResult.user.role;

    // Build where clause based on user role
    let whereClause = '';
    let replacements: any[] = [];

    if (userRole === 'user') {
      whereClause = 'WHERE c.user_id = ?';
      replacements.push(userId);
    } else if (userRole === 'advocate') {
      whereClause = 'WHERE c.advocate_id = ?';
      replacements.push(userId);
    }
    // Admin can see all cases, so no additional where clause

    // Get case statistics
    const statsQuery = `
      SELECT 
        COUNT(*) as total_cases,
        CAST(SUM(CASE WHEN c.status = 'waiting_for_action' THEN 1 ELSE 0 END) AS UNSIGNED) as waiting_for_action_cases,
        CAST(SUM(CASE WHEN c.status = 'neutrals_needs_to_be_assigned' THEN 1 ELSE 0 END) AS UNSIGNED) as neutrals_needs_to_be_assigned_cases,
        CAST(SUM(CASE WHEN c.status = 'consented' THEN 1 ELSE 0 END) AS UNSIGNED) as consented_cases,
        CAST(SUM(CASE WHEN c.status = 'closed_no_consent' THEN 1 ELSE 0 END) AS UNSIGNED) as closed_no_consent_cases,
        CAST(SUM(CASE WHEN c.status = 'close_no_settlement' THEN 1 ELSE 0 END) AS UNSIGNED) as close_no_settlement_cases,
        CAST(SUM(CASE WHEN c.status = 'temporary_non_starter' THEN 1 ELSE 0 END) AS UNSIGNED) as temporary_non_starter_cases,
        CAST(SUM(CASE WHEN c.status = 'settled' THEN 1 ELSE 0 END) AS UNSIGNED) as settled_cases,
        CAST(SUM(CASE WHEN c.status = 'hold' THEN 1 ELSE 0 END) AS UNSIGNED) as hold_cases,
        CAST(SUM(CASE WHEN c.status = 'withdrawn' THEN 1 ELSE 0 END) AS UNSIGNED) as withdrawn_cases
      FROM cases c
      ${whereClause}
    `;

    const statsResult = await sequelize.query(statsQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    const stats = statsResult[0] as any;

    // Get recent cases with user and advocate information
    const recentCasesQuery = `
      SELECT 
        c.id,
        c.case_number,
        c.title,
        c.description,
        c.status,
        c.priority,
        c.case_type,
        c.created_at,
        c.updated_at,
        c.user_id,
        c.advocate_id,
        c.court_name,
        c.judge_name,
        c.next_hearing_date,
        c.fees,
        c.fees_paid,
        c.start_date,
        c.end_date,
        c.requester_name,
        c.requester_email,
        c.requester_phone,
        c.requester_address,
        c.respondent_name,
        c.respondent_email,
        c.respondent_phone,
        c.respondent_address,
        c.relationship_between_parties,
        c.nature_of_dispute,
        c.brief_description_of_dispute,
        c.occurrence_date,
        c.prior_communication,
        c.prior_communication_other,
        c.sought_monetary_claim,
        c.sought_settlement,
        c.sought_other,
        c.attachments_json,
        u.name as user_name,
        u.email as user_email,
        a.name as advocate_name,
        a.email as advocate_email
      FROM cases c
      LEFT JOIN users u ON c.user_id = u.id
      LEFT JOIN users a ON c.advocate_id = a.id
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT 5
    `;

    const recentCasesResult = await sequelize.query(recentCasesQuery, {
      replacements,
      type: QueryTypes.SELECT,
    });

    return NextResponse.json({
      success: true,
      data: {
        totalCases: Number(stats.total_cases) || 0,
        activeCases: (Number(stats.waiting_for_action_cases) || 0) + (Number(stats.neutrals_needs_to_be_assigned_cases) || 0) + (Number(stats.consented_cases) || 0),
        closedCases: (Number(stats.closed_no_consent_cases) || 0) + (Number(stats.close_no_settlement_cases) || 0) + (Number(stats.settled_cases) || 0) + (Number(stats.withdrawn_cases) || 0),
        pendingCases: (Number(stats.temporary_non_starter_cases) || 0) + (Number(stats.hold_cases) || 0),
        recentCases: recentCasesResult,
        statusBreakdown: {
          waiting_for_action: Number(stats.waiting_for_action_cases) || 0,
          neutrals_needs_to_be_assigned: Number(stats.neutrals_needs_to_be_assigned_cases) || 0,
          consented: Number(stats.consented_cases) || 0,
          closed_no_consent: Number(stats.closed_no_consent_cases) || 0,
          close_no_settlement: Number(stats.close_no_settlement_cases) || 0,
          temporary_non_starter: Number(stats.temporary_non_starter_cases) || 0,
          settled: Number(stats.settled_cases) || 0,
          hold: Number(stats.hold_cases) || 0,
          withdrawn: Number(stats.withdrawn_cases) || 0,
        }
      },
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
}
