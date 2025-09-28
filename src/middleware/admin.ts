import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth"; // your JWT verification function

export async function adminMiddleware(req: NextRequest) {
  try {
    const authHeader = req.headers.get("authorization");

    if (!authHeader) {
      return NextResponse.json(
        { success: false, message: "Unauthorized: No token provided" },
        { status: 401 }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const decoded = verifyToken(token);

    // Check if role is admin
    if (!decoded || decoded.role !== "admin") {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    // ✅ Allowed: return true (do not use NextResponse.next())
    return true;
  } catch (err) {
    return NextResponse.json(
      { success: false, message: "Invalid token" },
      { status: 401 }
    );
  }
}
