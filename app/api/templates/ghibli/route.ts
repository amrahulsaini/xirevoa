import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
}

export async function GET() {
  try {
    // Fetch Studio Ghibli templates (IDs: 84, 86, 87, 88, 89)
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url FROM templates WHERE id IN (84, 86, 87, 88, 89) AND is_active = TRUE ORDER BY display_order ASC'
    );

    const templates = rows.map((row: TemplateRow) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
    }));

    return NextResponse.json({ templates });
  } catch (error) {
    console.error('Error fetching Studio Ghibli templates:', error);
    return NextResponse.json({ templates: [] });
  }
}
