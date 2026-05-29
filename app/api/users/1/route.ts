import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const body = await req.json();

  const user = await prisma.user.create({
    data: {
      email: body.email,
      code: body.code,
      password: await bcrypt.hash(body.password, 10),
      role: body.role,
    },
  });

  return NextResponse.json(user);
}

export async function PATCH(req: Request, { params }: any) {
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: body,
  });

  return NextResponse.json(user);
}

export async function DELETE(_: Request, { params }: any) {
  await prisma.user.update({
    where: { id: params.id },
    data: { deletedAt: new Date(), active: false },
  });

  return NextResponse.json({ success: true });
}