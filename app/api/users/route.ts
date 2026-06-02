import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import bcrypt from "bcryptjs"; // 🔐 Sécurité mot de passe

// ==========================================
// 📥 GET ALL USERS
// ==========================================
export async function GET() {
  try {
    const users = await prisma.user.findMany({
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        email: true,
        code: true,
        role: true,
        active: true,
        createdAt: true,
        // ❌ On exclut le password pour ne jamais le renvoyer au front
      },
    });

    return NextResponse.json(users);
  } catch (err) {
    console.error("GET USERS ERROR:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la récupération" },
      { status: 500 }
    );
  }
}

// ==========================================
// ➕ CREATE USER
// ==========================================
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, code, password, role } = body;

    // 1️⃣ VALIDATION DES CHAMPS
    if (!email || !password || !code) {
      return NextResponse.json(
        { error: "Champs manquants" },
        { status: 400 }
      );
    }

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    // 2️⃣ VERIFICATION DOUBLONS (Optimisée en une seule requête DB)
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: cleanEmail },
          { code: cleanCode }
        ]
      }
    });

    if (existingUser) {
      if (existingUser.email === cleanEmail) {
        return NextResponse.json({ error: "Email existe déjà" }, { status: 400 });
      }
      if (existingUser.code === cleanCode) {
        return NextResponse.json({ error: "Code existe déjà" }, { status: 400 });
      }
    }

    // 3️⃣ HACHAGE DU MOT DE PASSE (Sécurité)
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4️⃣ CRÉATION
    const user = await prisma.user.create({
      data: {
        email: cleanEmail,
        code: cleanCode,
        password: hashedPassword, // Stockage sécurisé
        role: role || "TECH",
        active: true,
      },
    });

    // On retire le password de l'objet renvoyé pour des raisons de sécurité
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(userWithoutPassword, { status: 201 });

  } catch (err) {
  console.error("CREATE USER ERROR:", err); // ← Regardez ce log dans votre terminal
  
  // Détecte les erreurs Prisma connues
  if (err instanceof Error) {
    // Violation de contrainte unique (doublon race condition)
    if (err.message.includes("Unique constraint")) {
      return NextResponse.json(
        { error: "Email ou code déjà utilisé" },
        { status: 400 }
      );
    }
    // Champ inconnu ou manquant dans le schéma Prisma
    if (err.message.includes("Unknown arg") || err.message.includes("Invalid")) {
      return NextResponse.json(
        { error: `Erreur Prisma : ${err.message}` },
        { status: 400 }
      );
    }
  }

  return NextResponse.json(
    { error: "Erreur serveur lors de la création" },
    { status: 500 }
  );
}
}