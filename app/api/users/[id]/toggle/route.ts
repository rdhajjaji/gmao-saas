import prisma  from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const body = await req.json();

    const { id } = await params;

    const user = await prisma.user.update({
      where: {
        id,
      },
      data: {
        active: body.active,
      },
    });

    return NextResponse.json(user);

  } catch (error) {
    console.error("PATCH USER ERROR:", error);

    return NextResponse.json(
      { error: "Erreur modification utilisateur" },
      { status: 500 }
    );
  }
}