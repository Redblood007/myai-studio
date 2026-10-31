import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { openai } from "@/lib/openai";

async function ensureDefaultUser() {
  let user = await prisma.user.findFirst({
    where: { email: "default@myai.local" },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: "default@myai.local",
        name: "Default User",
      },
    });
  }

  return user;
}

export async function GET() {
  const user = await ensureDefaultUser();

  const chat = await prisma.chat.findFirst({
    where: {
      userId: user.id,
    },
    orderBy: {
      createdAt: "desc",
    },
    include: {
      messages: {
        orderBy: {
          createdAt: "asc",
        },
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
    const body = await req.json();
    const message = body.message;

    if (!message || typeof message !== "string") {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const user = await ensureDefaultUser();

    let chat = await prisma.chat.findFirst({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    if (!chat) {
      chat = await prisma.chat.create({
        data: {
          userId: user.id,
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
