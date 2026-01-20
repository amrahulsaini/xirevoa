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

    const { generationId, templateId, isPreGeneration } = await req.json();

    if (!generationId && !templateId) {
      return NextResponse.json({ error: "Generation ID or Template ID required" }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      let prompt = '';
      let actualTemplateId = templateId;

      if (generationId) {
        // Post-generation: Get prompt from generation record
        const [generations]: any = await connection.query(
          "SELECT prompt_used, user_id, template_id FROM generations WHERE id = ?",
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

        prompt = generations[0].prompt_used;
        actualTemplateId = generations[0].template_id;

        if (!prompt) {
          return NextResponse.json(
            { error: "No prompt available for this generation" },
            { status: 404 }
          );
        }

        // Mark template as viewed (free after generation)
        await connection.query(
          'INSERT IGNORE INTO template_prompt_views (user_id, template_id) VALUES (?, ?)',
          [session.user.id, actualTemplateId]
        );

        return NextResponse.json({
          success: true,
          prompt,
          isFree: true,
        });
      } else if (isPreGeneration && templateId) {
        // Pre-generation: Check if user has viewed this template before
        const [viewRows]: any = await connection.query(
          'SELECT id FROM template_prompt_views WHERE user_id = ? AND template_id = ?',
          [session.user.id, templateId]
        );

        const hasViewedBefore = viewRows.length > 0;

        // Get template prompt
        const [templates]: any = await connection.query(
          'SELECT ai_prompt FROM templates WHERE id = ?',
          [templateId]
        );

        if (templates.length === 0) {
          return NextResponse.json({ error: 'Template not found' }, { status: 404 });
        }

        prompt = templates[0].ai_prompt;

        if (!hasViewedBefore) {
          // First time viewing - charge 1 XP
          const [userRows]: any = await connection.query(
            'SELECT xpoints FROM users WHERE id = ?',
            [session.user.id]
          );

          const currentXP = userRows[0]?.xpoints || 0;

          if (currentXP < 1) {
            return NextResponse.json(
              { error: 'Insufficient XP. You need 1 XP to view the prompt for the first time.' },
              { status: 400 }
            );
          }

          // Deduct 1 XP
          await connection.query(
            'UPDATE users SET xpoints = xpoints - 1 WHERE id = ?',
            [session.user.id]
          );

          // Mark as viewed
          await connection.query(
            'INSERT INTO template_prompt_views (user_id, template_id) VALUES (?, ?)',
            [session.user.id, templateId]
          );

          return NextResponse.json({
            success: true,
            prompt,
            isFree: false,
            xpDeducted: 1,
          });
        } else {
          // Already viewed before - free
          return NextResponse.json({
            success: true,
            prompt,
            isFree: true,
          });
        }
      }

      return NextResponse.json({ error: 'Invalid request' }, { status: 400 });
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
