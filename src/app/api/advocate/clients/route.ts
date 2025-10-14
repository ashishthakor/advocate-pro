import { NextRequest, NextResponse } from "next/server";
import { Op } from "sequelize";
import { ApiResponse } from "@/types";
const { User } = require("models/init-models");

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const search = searchParams.get("search") || "";
    const status = searchParams.get("status") || "all";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "10");
    const offset = (page - 1) * limit;

    // Build where conditions for users with role "user"
    const whereConditions: any = { role: "user" };
    
    if (search) {
      whereConditions[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ];
    }

    // Get users (clients) with pagination using Sequelize ORM
    const { count, rows: clients } = await User.findAndCountAll({
      where: whereConditions,
      attributes: ['id', 'name', 'email', 'phone', 'address', 'created_at'],
      order: [['created_at', 'DESC']],
      limit: limit,
      offset: offset
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Clients retrieved successfully",
      data: {
        clients,
        pagination: {
          page,
          limit,
          total: count,
          totalPages: Math.ceil(count / limit),
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
      name,
      email,
      phone,
      address,
      password = "default123" // Default password for clients
    } = body;

    // Create client as a user with role "user" using Sequelize ORM
    const client = await User.create({
      name,
      email,
      password, // In real app, this should be hashed
      role: "user",
      phone,
      address
    });

    return NextResponse.json<ApiResponse>({
      success: true,
      message: "Client created successfully",
      data: { id: client.id },
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
