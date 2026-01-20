import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ hasViewed: false });
    }

    const { searchParams } = new URL(req.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return NextResponse.json({ error: 'Template ID required' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      const [rows]: any = await connection.query(
        'SELECT id FROM template_prompt_views WHERE user_id = ? AND template_id = ?',
        [session.user.id, templateId]
      );

      return NextResponse.json({
        hasViewed: rows.length > 0,
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Check prompt view error:', error);
    return NextResponse.json({ hasViewed: false });
  }
}
