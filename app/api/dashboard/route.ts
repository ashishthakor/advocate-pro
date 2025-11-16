import { NextRequest, NextResponse } from 'next/server';
const { Case, User, RecentActivity } = require('@/models/init-models');
import { verifyTokenFromRequest } from '@/lib/auth';

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

    // Build where conditions based on user role
    const whereConditions: any = {};
    
    if (userRole === 'user') {
      whereConditions.user_id = userId;
    } else if (userRole === 'advocate') {
      whereConditions.advocate_id = userId;
    }
    // Admin can see all cases, so no additional where condition

    // Get case statistics using Sequelize ORM
    const totalCases = await Case.count({ where: whereConditions });
    
    const waitingForActionCases = await Case.count({ 
      where: { ...whereConditions, status: 'waiting_for_action' } 
    });
    const neutralsNeedsToBeAssignedCases = await Case.count({ 
      where: { ...whereConditions, status: 'neutrals_needs_to_be_assigned' } 
    });
    const consentedCases = await Case.count({ 
      where: { ...whereConditions, status: 'consented' } 
    });
    const closedNoConsentCases = await Case.count({ 
      where: { ...whereConditions, status: 'closed_no_consent' } 
    });
    const closeNoSettlementCases = await Case.count({ 
      where: { ...whereConditions, status: 'close_no_settlement' } 
    });
    const temporaryNonStarterCases = await Case.count({ 
      where: { ...whereConditions, status: 'temporary_non_starter' } 
    });
    const settledCases = await Case.count({ 
      where: { ...whereConditions, status: 'settled' } 
    });
    const holdCases = await Case.count({ 
      where: { ...whereConditions, status: 'hold' } 
    });
    const withdrawnCases = await Case.count({ 
      where: { ...whereConditions, status: 'withdrawn' } 
    });

    const stats = {
      total_cases: totalCases,
      waiting_for_action_cases: waitingForActionCases,
      neutrals_needs_to_be_assigned_cases: neutralsNeedsToBeAssignedCases,
      consented_cases: consentedCases,
      closed_no_consent_cases: closedNoConsentCases,
      close_no_settlement_cases: closeNoSettlementCases,
      temporary_non_starter_cases: temporaryNonStarterCases,
      settled_cases: settledCases,
      hold_cases: holdCases,
      withdrawn_cases: withdrawnCases
    };

    // Get recent cases with user and advocate information using Sequelize ORM
    const recentCases = await Case.findAll({
      where: whereConditions,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['name', 'email']
        },
        {
          model: User,
          as: 'advocate',
          attributes: ['name', 'email']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: 5
    });

    // Get recent activities - only show to admin users
    let recentActivities: any[] = [];
    if (userRole === 'admin') {
      recentActivities = await RecentActivity.findAll({
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['name', 'email'],
            required: false
          }
        ],
        order: [['created_at', 'DESC']],
        limit: 10
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        totalCases: Number(stats.total_cases) || 0,
        activeCases: (Number(stats.waiting_for_action_cases) || 0) + (Number(stats.neutrals_needs_to_be_assigned_cases) || 0) + (Number(stats.consented_cases) || 0),
        closedCases: (Number(stats.closed_no_consent_cases) || 0) + (Number(stats.close_no_settlement_cases) || 0) + (Number(stats.settled_cases) || 0) + (Number(stats.withdrawn_cases) || 0),
        pendingCases: (Number(stats.temporary_non_starter_cases) || 0) + (Number(stats.hold_cases) || 0),
        recentCases: recentCases,
        recentActivities: recentActivities,
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
