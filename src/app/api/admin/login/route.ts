import { NextRequest, NextResponse } from "next/server";
import {
  checkAndIncreaseLoginRateLimit,
  createAdminSessionCookie,
  getClientIdentifier,
  isAdminPasswordValid,
} from "@/lib/admin-auth";
import { ensureTrimmedString, safeParseJsonBody } from "@/lib/api-security";

type LoginRequestBody = {
  password?: unknown;
};

export async function POST(req: NextRequest) {
  // 速率限制：基于 IP + UA 的简单频率限制
  const ipHeader =
    req.headers.get("x-forwarded-for") ?? req.headers.get("x-real-ip");
  const ua = req.headers.get("user-agent");
  const clientId = getClientIdentifier(ipHeader, ua);

  const limit = checkAndIncreaseLoginRateLimit(clientId);

  if (!limit.allowed) {
    return NextResponse.json(
      {
        error: "Too many login attempts, please try again later.",
        retry_after: new Date(limit.resetAt).toISOString(),
      },
      {
        status: 429,
      },
    );
  }

  let rawBody: unknown;

  try {
    rawBody = await req.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 },
    );
  }

  const json = safeParseJsonBody<LoginRequestBody>(rawBody);

  if (!json) {
    return NextResponse.json(
      { error: "Invalid request payload" },
      { status: 400 },
    );
  }

  const password = ensureTrimmedString(json.password, 256);

  if (!isAdminPasswordValid(password)) {
    // 注意：不在日志中输出密码内容，仅记录通用失败信息
    console.warn("[api/admin/login] invalid password attempt");

    return NextResponse.json(
      { error: "Invalid credentials" },
      {
        status: 401,
      },
    );
  }

  const sessionCookie = createAdminSessionCookie();

  const res = NextResponse.json(
    {
      success: true,
    },
    {
      status: 200,
    },
  );

  res.cookies.set(
    sessionCookie.name,
    sessionCookie.value,
    sessionCookie.options,
  );

  return res;
}

