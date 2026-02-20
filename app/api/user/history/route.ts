import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface GenerationRow extends RowDataPacket {
  id: number;
  image_url: string;
  prompt: string;
  created_at: Date;
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Fetch all generations for this user
    const [rows] = await pool.query<GenerationRow[]>(
      `SELECT id, image_url, prompt, created_at 
       FROM generations 
       WHERE user_id = ? AND status = 'completed' AND image_url IS NOT NULL
       ORDER BY created_at DESC 
       LIMIT 50`,
      [userId]
    );

    const generations: any[] = rows.map(row => ({
      id: row.id,
      url: row.image_url,
      template: row.prompt || 'Generated Image',
      createdAt: row.created_at,
    }));

    return NextResponse.json({
      uploads: [],
      generations,
    });
  } catch (error) {
    console.error('Error fetching user history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch history' },
      { status: 500 }
    );
  }
}
