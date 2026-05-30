import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

// 🔄 UPDATE USER
export async function PATCH(
  req: Request,
  context: any
) {
  try {

    // ✅ NEXT 15 FIX
    const params = await context.params;

    const id = params.id;

    const body = await req.json();

    const updated = await prisma.user.update({
      where: {
        id,
      },
      data: {
        active: body.active,
      },
    });

    return NextResponse.json(updated);

  } catch (error) {
    console.error("PATCH ERROR:", error);

    return NextResponse.json(
      { error: "Erreur update user" },
      { status: 500 }
    );
  }
}

// ❌ DELETE USER
export async function DELETE(req: Request, context: any) {
  try {
    const params = await context.params;
    const id = params.id;

    await prisma.user.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error("DELETE ERROR:", error);

    return NextResponse.json(
      { error: "DELETE failed" },
      { status: 500 }
    );
  }
}
