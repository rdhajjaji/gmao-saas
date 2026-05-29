import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function PUT(req: Request, { params }: any) {
  const body = await req.json();

  const user = await prisma.user.update({
    where: { id: params.id },
    data: {
      name: body.name,
      email: body.email,
      role: body.role,
    },
  });

  return NextResponse.json(user);
}