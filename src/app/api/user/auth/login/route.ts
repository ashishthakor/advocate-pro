import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginRequest, AuthResponse, User } from "@/types";

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

    // Find user
    const [users] = await pool.execute(
      "SELECT id, name, email, password, role, is_approved, created_at FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Invalid email or password",
        },
        { status: 401 }
      );
    }

    const user = users[0] as any;

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
    const mappedUser: User = {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isApproved: user.is_approved === 1, // ✅ camelCase now
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
