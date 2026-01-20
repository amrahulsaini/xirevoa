import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { generationId } = await req.json();

    if (!generationId) {
      return NextResponse.json({ error: "Generation ID required" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get the generation and its prompt
      const [generations]: any = await connection.query(
        "SELECT prompt_used, user_id FROM generations WHERE id = ?",
        [generationId]
      );

      if (generations.length === 0) {
        return NextResponse.json(
          { error: "Generation not found" },
          { status: 404 }
        );
      }

      // Verify ownership
      if (generations[0].user_id !== session.user.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 403 }
        );
      }

      const prompt = generations[0].prompt_used;

      if (!prompt) {
        return NextResponse.json(
          { error: "No prompt available for this generation" },
          { status: 404 }
        );
      }

      // No XP deduction - viewing is now FREE after generation
      return NextResponse.json({
        success: true,
        prompt,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error("View prompt error:", error);
    return NextResponse.json(
      { error: "Failed to view prompt" },
      { status: 500 }
    );
  }
}
