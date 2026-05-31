import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";

import prisma from "@/lib/prisma";
// 📥 GET USERS
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
    });

    return NextResponse.json(users);

  } catch (err) {
    console.error(err);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

// ➕ CREATE USER
export async function POST(req: Request) {
  try {
    const body = await req.json();

    // VALIDATION
    if (
      !body.email ||
      !body.password ||
      !body.code
    ) {
      return NextResponse.json(
        { error: "Champs manquants" },
        { status: 400 }
      );
    }

    // CHECK EMAIL
    const existingEmail = await prisma.user.findUnique({
      where: {
        email: body.email,
      },
    });

    if (existingEmail) {
      return NextResponse.json(
        { error: "Email existe déjà" },
        { status: 400 }
      );
    }

    // CHECK CODE
    const existingCode = await prisma.user.findUnique({
      where: {
        code: body.code,
      },
    });

    if (existingCode) {
      return NextResponse.json(
        { error: "Code existe déjà" },
        { status: 400 }
      );
    }

    // CREATE
    const user = await prisma.user.create({
      data: {
        email: body.email,
        code: body.code,
        password: await bcrypt.hash(body.password, 10),
        role: body.role || "TECH",
        active: true,
      },
    });

    return NextResponse.json(user);

  } catch (err) {
    console.error("CREATE USER ERROR:", err);

    return NextResponse.json(
      { error: "Erreur serveur" },
      { status: 500 }
    );
  }
}

