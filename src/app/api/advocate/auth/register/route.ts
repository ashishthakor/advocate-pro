import { NextRequest, NextResponse } from "next/server";
const { User } = require("models/init-models");
import { hashPassword, generateToken } from "@/lib/auth";
import { RegisterRequest, AuthResponse } from "@/types";

export async function POST(request: NextRequest) {
  try {
    const body: RegisterRequest = await request.json();
    const { name, email, password } = body;

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "All fields are required",
        },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "Password must be at least 6 characters long",
        },
        { status: 400 }
      );
    }

    // Check if user already exists using Sequelize ORM
    const existingUser = await User.findOne({
      where: { email: email }
    });

    if (existingUser) {
      return NextResponse.json<AuthResponse>(
        {
          success: false,
          message: "User with this email already exists",
        },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create advocate with is_approved = 0 using Sequelize ORM
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "advocate",
      is_approved: 0
    });

    // Create user profile using Sequelize ORM
    // await Profile.create({
    //   user_id: user.id
    // });

    // **Do NOT generate token yet** — advocate cannot login until approved
    return NextResponse.json<AuthResponse>(
      {
        success: true,
        message:
          "Registered successfully. You can login once admin approves your account.",
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json<AuthResponse>(
      {
        success: false,
        message: "Internal server error",
      },
      { status: 500 }
    );
  }
}
