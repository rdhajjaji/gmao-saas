import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.loginLog.findMany({
    include: { user: true },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}