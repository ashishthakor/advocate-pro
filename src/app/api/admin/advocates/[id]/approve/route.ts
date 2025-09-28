import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { adminMiddleware } from "@/middleware/admin";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const advocateId = parseInt(params.id);

  // Validate id
  if (isNaN(advocateId)) {
    return NextResponse.json(
      { success: false, message: "Invalid advocate ID" },
      { status: 400 }
    );
  }

  // ✅ Run admin auth check
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse;
  }

  try {
    const [result]: any = await pool.execute(
      'UPDATE users SET is_approved=1 WHERE id=? AND role="advocate"',
      [advocateId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Advocate not found or already approved" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Advocate approved" });
  } catch (err) {
    console.error("Approve advocate error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to approve advocate" },
      { status: 500 }
    );
  }
}
