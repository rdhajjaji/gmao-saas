import { NextResponse } from "next/server";
import  prisma  from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const code = body.code?.trim();
    const password = body.password?.trim();

    console.log("LOGIN TRY:", code);

    const allUsers = await prisma.user.findMany();

    console.log("ALL USERS:", allUsers);

    // Comparaison propre sans tabulations
    const user = allUsers.find(
      (u: { code: string }) => u.code.trim() === code
    );

    console.log("USER FOUND:", user);

    if (!user) {
      return NextResponse.json(
        {
          message: "User not found",
        },
        { status: 401 }
      );
    }

    // TEMPORAIRE :
    // mot de passe non hashé dans ta DB
    const valid =
      user.password.trim() === password;

    console.log("PASSWORD VALID:", valid);

    if (!valid) {
      return NextResponse.json(
        {
          message: "Invalid credentials",
        },
        { status: 401 }
      );
    }

    return NextResponse.json({
      success: true,
      token: "token-" + Date.now(),
      role: user.role,
      user: {
        id: user.id,
        code: user.code.trim(),
      },
    });

  } catch (err) {
    console.error("LOGIN API ERROR:", err);

    return NextResponse.json(
      {
        message: "Server error",
      },
      { status: 500 }
    );
  }
}