import { NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  coming_soon: boolean;
  display_order: number;
  is_active: boolean;
}

export async function GET() {
  try {
    const [rows] = await pool.query<Template[]>(
      'SELECT id, title, description, image_url as image, coming_soon as comingSoon FROM templates WHERE is_active = TRUE ORDER BY display_order ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch templates' },
      { status: 500 }
    );
  }
}
