import { NextResponse } from "next/server";
import { adminMiddleware } from "@/middleware/admin";
import { NextRequest } from "next/server";
import { User as UserType } from "@/types";
const { User } = require("models/init-models");

export async function GET(req: NextRequest) {
  // Run admin middleware first
  const middlewareResponse = await adminMiddleware(req);
  if (middlewareResponse instanceof NextResponse) {
    return middlewareResponse; // Not admin, return error
  }

  try {
    const advocates = await User.findAll({
      where: { role: "advocate" },
      attributes: ['id', 'name', 'email', 'role', 'is_approved', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    // Map Sequelize models → UserType[]
    const mappedAdvocates: UserType[] = advocates.map((user: any) => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: "advocate",
      isApproved: user.is_approved === 1,
      createdAt: new Date(user.created_at),
    }));

    return NextResponse.json({ success: true, advocates: mappedAdvocates });
  } catch (err) {
    console.error("Fetch advocates error:", err);
    return NextResponse.json(
      { success: false, message: "Failed to fetch advocates" },
      { status: 500 }
    );
  }
}
