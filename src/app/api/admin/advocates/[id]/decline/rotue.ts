import { NextRequest, NextResponse } from "next/server";
const { User } = require("models/init-models");
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
    const deletedRowsCount = await User.destroy({
      where: {
        id: advocateId,
        role: "advocate"
      }
    });

    if (deletedRowsCount === 0) {
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
