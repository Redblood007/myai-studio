import { NextResponse } from "next/server";
import { deleteSessionCookie, getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  return NextResponse.json({ user });
}

export async function POST() {
  await deleteSessionCookie();
  return NextResponse.json({ success: true });
}
