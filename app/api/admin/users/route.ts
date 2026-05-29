import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

// SIMPLE AUTH CHECK (à remplacer par JWT plus tard)
function isAdmin(req: Request) {
  const role = req.headers.get("x-role");
  return role === "ADMIN";
}

// GET - liste users
export async function GET(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        code: true,
        role: true,
        active: true,
        createdAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}

// POST - create user (admin only)
export async function POST(req: Request) {
  try {
    if (!isAdmin(req)) {
      return NextResponse.json({ message: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();

    const user = await prisma.user.create({
      data: {
        email: body.email,
        code: body.code,
        password: body.password, // à hasher plus tard
        role: body.role || "USER",
        active: true,
      },
    });

    return NextResponse.json(user);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ message: "Server error" }, { status: 500 });
  }
}