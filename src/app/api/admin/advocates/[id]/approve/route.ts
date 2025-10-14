import { NextRequest, NextResponse } from "next/server";
const { User } = require("models/init-models");
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
    const [updatedRowsCount] = await User.update(
      { is_approved: 1 },
      { 
        where: { 
          id: advocateId,
          role: "advocate" 
        } 
      }
    );

    if (updatedRowsCount === 0) {
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
