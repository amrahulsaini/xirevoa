import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface GenerationRow extends RowDataPacket {
  id: number;
  original_image_url: string;
  generated_image_url: string;
  template_title: string;
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
      `SELECT id, original_image_url, generated_image_url, template_title, created_at 
       FROM generations 
       WHERE user_id = ?
       ORDER BY created_at DESC 
       LIMIT 100`,
      [userId]
    );

    // Extract unique uploads (original images)
    const uploadsSet = new Set<string>();
    rows.forEach(row => {
      if (row.original_image_url) {
        uploadsSet.add(row.original_image_url);
      }
    });
    const uploads = Array.from(uploadsSet);

    // Map generations
    const generations: any[] = rows
      .filter(row => row.generated_image_url)
      .map(row => ({
        id: row.id,
        url: row.generated_image_url,
        template: row.template_title || 'Generated Image',
        createdAt: row.created_at,
      }));

      }));

    return NextResponse.json({
      uploads,
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
