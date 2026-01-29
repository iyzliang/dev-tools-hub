import { NextRequest, NextResponse } from "next/server";
import { hasValidAdminSessionFromCookie } from "@/lib/admin-auth";

export async function GET(req: NextRequest) {
  const cookie = req.cookies.get("dth_admin_session")?.value;

  if (!hasValidAdminSessionFromCookie(cookie)) {
    return NextResponse.json(
      { authenticated: false },
      {
        status: 401,
      },
    );
  }

  return NextResponse.json(
    {
      authenticated: true,
    },
    {
      status: 200,
    },
  );
}

