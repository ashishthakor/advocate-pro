import { NextRequest, NextResponse } from "next/server";
import { pool } from "@/lib/database";
import { adminMiddleware } from "@/middleware/admin";

export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const advocateId = parseInt(params.id);

  if (isNaN(advocateId)) {
    return NextResponse.json(
      { success: false, message: "Invalid advocate ID" },
      { status: 400 }
    );
  }

  // ✅ Admin auth check
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse;
  }

  try {
    const [result]: any = await pool.execute(
      'DELETE FROM users WHERE id=? AND role="advocate"',
      [advocateId]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json(
        { success: false, message: "Advocate not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, message: "Advocate declined" });
  } catch (err) {
    console.error("Decline advocate error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to decline advocate" },
      { status: 500 }
    );
  }
}
