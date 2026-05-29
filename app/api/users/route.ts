import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function GET() {
  const users = await prisma.user.findMany({
    include: { logs: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(users);
}

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      name: body.name,
      password: await bcrypt.hash(body.password, 10),
      role: body.role || "USER",
    },
  });

  return NextResponse.json(user);
}