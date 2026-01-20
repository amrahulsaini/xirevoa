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
      // Check user's XP balance
      const [userRows]: any = await connection.query(
        "SELECT xpoints FROM users WHERE id = ?",
        [session.user.id]
      );

      const currentXP = userRows[0]?.xpoints || 0;

      if (currentXP < 1) {
        return NextResponse.json(
          { error: "Insufficient XP. You need 1 XP to view the prompt." },
          { status: 400 }
        );
      }

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

      // Deduct 1 XP
      await connection.query(
        "UPDATE users SET xpoints = xpoints - 1 WHERE id = ?",
        [session.user.id]
      );

      const newBalance = currentXP - 1;

      return NextResponse.json({
        success: true,
        prompt,
        xpDeducted: 1,
        newBalance,
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
