import { NextRequest, NextResponse } from "next/server";
import { getSessionUserId } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";

export async function GET() {
  const userId = await getSessionUserId();

  if (!userId) {
    return NextResponse.json({ messages: [] }, { status: 401 });
  }

  const chat = await prisma.chat.findFirst({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      messages: {
        orderBy: { createdAt: "asc" },
      },
    },
  });

  return NextResponse.json({
    messages:
      chat?.messages.map((msg) => ({
        id: msg.id,
        role: msg.role,
        content: msg.content,
      })) || [],
  });
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getSessionUserId();
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    let chat = await prisma.chat.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId,
          title: "New Chat",
        },
      });
    }

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: message,
      },
    });

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful personal AI assistant. Be concise, practical, and intelligent.",
        },
        { role: "user", content: message },
      ],
      temperature: 0.7,
    });

    const reply =
      completion.choices[0]?.message?.content ||
      "Sorry, I couldn't generate a response.";

    await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: reply,
      },
    });

    return NextResponse.json({ reply });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { error: error.message || "Something went wrong" },
      { status: 500 }
    );
  }
}
