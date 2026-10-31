import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const fileName = file.name;
    const fileType = file.type || "application/octet-stream";
    const fileSize = file.size || 0;

    await prisma.document.create({
      data: {
        name: fileName,
        type: fileType,
        size: fileSize,
        content: `Uploaded file: ${fileName}\nType: ${fileType}\nSize: ${fileSize} bytes`,
      },
    });

    return NextResponse.json({
      success: true,
      fileName,
      message: "File uploaded successfully.",
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Upload failed" },
      { status: 500 }
    );
  }
}
