import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET USER
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const user = await prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Utilisateur introuvable" },
        { status: 404 }
      );
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}
// UPDATE USER
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const email = body.email?.trim().toLowerCase();
    const code = body.code?.trim();

    // =========================
    // CHECK EMAIL UNIQUE
    // =========================
    if (email) {
      const emailExists = await prisma.user.findFirst({
        where: {
          email,
          NOT: { id },
        },
      });

      if (emailExists) {
        return NextResponse.json(
          { error: "Email déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // =========================
    // CHECK CODE UNIQUE
    // =========================
    if (code) {
      const codeExists = await prisma.user.findFirst({
        where: {
          code,
          NOT: { id },
        },
      });

      if (codeExists) {
        return NextResponse.json(
          { error: "Code déjà utilisé" },
          { status: 400 }
        );
      }
    }

    // =========================
    // UPDATE USER
    // =========================
    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        email,
        role: body.role,
        active: body.active,
        code,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur modification" },
      { status: 500 }
    );
  }
}


/*export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    const body = await request.json();

    const updatedUser = await prisma.user.update({
      where: {
        id,
      },
      data: {
        email: body.email,
        role: body.role,
        active: body.active,
        code: body.code,
      },
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur modification" },
      { status: 500 }
    );
  }
}*/

// DELETE USER
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;

    await prisma.user.delete({
      where: {
        id,
      },
    });

    return NextResponse.json({
      success: true,
    });
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      { error: "Erreur suppression" },
      { status: 500 }
    );
  }
}

// app/api/users/[id]/route.ts


/*export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      select: { id: true, code: true, email: true, role: true }, // jamais le mot de passe
    });

    if (!user) {
      return NextResponse.json({ error: "Utilisateur introuvable" }, { status: 404 });
    }

    return NextResponse.json(user);

  } catch (err) {
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 });
  }
}*/

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json(); // ← source de l'erreur si le body est vide côté client
    const { code, email, role, password } = body;

    const updateData: any = { code, email, role };

    if (password && password.trim() !== "") {
      updateData.password = await bcrypt.hash(password, 10);
    }

    const updated = await prisma.user.update({
      where: { id: params.id },
      data: updateData,
    });

    return NextResponse.json(updated); // ← TOUJOURS retourner un JSON

  } catch (err) {
    return NextResponse.json({ error: "Erreur lors de la mise à jour" }, { status: 500 });
  }
}