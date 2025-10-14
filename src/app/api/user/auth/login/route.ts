import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginRequest, AuthResponse, User as UserType } from "@/types";
const { User } = require("models/init-models");

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    // Validate input
    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Email and password are required",
        },
        { status: 400 }
      );
    }

    // Find user using Sequelize ORM
    const user = await User.findOne({
      where: { email: email },
      attributes: ['id', 'name', 'email', 'password', 'role', 'is_approved', 'created_at']
    });

    if (!user) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    // Check approval (only advocates need approval)
    if (user.role === "advocate" && user.is_approved === 0) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Waiting for administrative approval.",
        },
        { status: 403 }
      );
    }

    // Map DB row → TypeScript User
    const mappedUser: UserType = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.is_approved === 1,
      createdAt: new Date(user.created_at),
    };

    // Generate token with role + approval
    const token = generateToken(mappedUser);

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: mappedUser,
      token,
    });
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
