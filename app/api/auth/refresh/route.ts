import { verifyRefreshToken, signAccessToken } from "@/lib/jwt";
import { NextResponse, NextRequest } from "next/server";

export async function POST(req: NextRequest) {
  const token = req.cookies.get("refreshToken")?.value;

  if (!token) {
    return NextResponse.json({ error: "NO_REFRESH_TOKEN" }, { status: 401 });
  }

  try {
    const decoded: any = verifyRefreshToken(token);

    const newAccessToken = signAccessToken({
      userId: decoded.userId,
    });

    const res = NextResponse.json({ ok: true });

    res.cookies.set("accessToken", newAccessToken, {
      httpOnly: true,
      secure: true,
      sameSite: "strict",
      maxAge: 60 * 15,
    });

    return res;
  } catch {
    return NextResponse.json({ error: "TOKEN_EXPIRED" }, { status: 401 });
  }
}