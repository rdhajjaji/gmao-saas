import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  const logs = await prisma.loginLog.findMany({
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(logs);
}