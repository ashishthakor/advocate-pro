import { NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { adminMiddleware } from "@/middleware/admin";
import { NextRequest } from "next/server";
import { User } from "@/types";

export async function GET(req: NextRequest) {
  // Run admin middleware first
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse; // Not admin, return error
  }

  try {
    const [rows] = await pool.execute(
      'SELECT id, name, email, role, is_approved, created_at FROM users WHERE role="advocate" ORDER BY created_at DESC'
    );

    // Map raw rows → User[]
    const advocates: User[] = (rows as any[]).map((row) => ({
      id: row.id,
      name: row.name,
      email: row.email,
      role: "advocate",
      isApproved: row.is_approved === 1,
      createdAt: new Date(row.created_at),
    }));

    return NextResponse.json({ success: true, advocates });
  } catch (err) {
    console.error("Fetch advocates error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
