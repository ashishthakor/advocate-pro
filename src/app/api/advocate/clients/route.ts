import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { ApiResponse } from "@/types";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    let query = `
      SELECT c.*, u.name as advocate_name 
      FROM clients c 
      LEFT JOIN users u ON c.advocate_id = u.id 
      WHERE 1=1
    `;
    let params: any[] = [];

    if (search) {
      query +=
        " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ?)";
      params.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== "all") {
      query += " AND c.status = ?";
      params.push(status);
    }

    query += " ORDER BY c.created_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const [clients] = await pool.execute(query, params);

    // Get total count
    let countQuery = "SELECT COUNT(*) as total FROM clients c WHERE 1=1";
    let countParams: any[] = [];

    if (search) {
      countQuery +=
        " AND (c.first_name LIKE ? OR c.last_name LIKE ? OR c.email LIKE ?)";
      countParams.push(`%${search}%`, `%${search}%`, `%${search}%`);
    }

    if (status !== "all") {
      countQuery += " AND c.status = ?";
      countParams.push(status);
    }

    const [countResult] = await pool.execute(countQuery, countParams);
    const total = (countResult as any)[0].total;

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Clients retrieved successfully",
      data: {
        clients,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      },
    });
  } catch (error: any) {
    console.error("Get clients error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      address,
      occupation,
      status = "active",
    } = body;

    // For now, use advocate_id = 1 (admin user)
    const advocate_id = 1;

    const [result] = await pool.execute(
      "INSERT INTO clients (advocate_id, first_name, last_name, email, phone, address, occupation, status) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        advocate_id,
        first_name,
        last_name,
        email,
        phone,
        address,
        occupation,
        status,
      ]
    );

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Client created successfully",
      data: { id: (result as any).insertId },
    });
  } catch (error: any) {
    console.error("Create client error:", error);
    return NextResponse.json<ApiResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
