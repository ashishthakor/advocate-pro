import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { verifyPassword, generateToken } from "@/lib/auth";
import { LoginRequest, AuthResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: LoginRequest = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Include is_approved in the SELECT query
    const [users] = await pool.execute(
      "SELECT id, name, email, password, role, is_approved, created_at FROM users WHERE email = ?",
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    const user = users[0] as any;

    // Only allow advocates (or admin, if needed)
    if (user.role !== "advocate" && user.role !== "admin") {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Check approval
    if (user.role === "advocate" && user.is_approved === 0) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Your account is not approved yet. Please contact admin.",
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json<AuthResponse>(
        { success: false, message: "Invalid email or password" },
        { status: 401 }
      );
    }

    // Generate token
    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    });

    return NextResponse.json<AuthResponse>({
      success: true,
      message: "Login successful",
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isApproved: user.is_approved === 1,
        createdAt: new Date(user.created_at),
      },
      token,
    });
  } catch (error) {
    console.error("Advocate login error:", error);
    return NextResponse.json<AuthResponse>(
      { success: false, message: "Internal server error" },
      { status: 500 }
    );
  }
}
