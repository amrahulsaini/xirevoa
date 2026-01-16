import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  ai_prompt: string | null;
  coming_soon: boolean;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET - Fetch all templates
export async function GET() {
  try {
    const [rows] = await pool.query<Template[]>(
      'SELECT * FROM templates ORDER BY display_order ASC'
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

// POST - Create new template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, image_url, ai_prompt, coming_soon, display_order, is_active } = body;

    if (!title || !description || !image_url) {
      return NextResponse.json(
        { error: 'Title, description, and image_url are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO templates (title, description, image_url, ai_prompt, coming_soon, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [title, description, image_url, ai_prompt || null, coming_soon || false, display_order || 0, is_active !== false]
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Template created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create template' },
      { status: 500 }
    );
  }
}

// PUT - Update template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, title, description, image_url, ai_prompt, coming_soon, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE templates SET title = ?, description = ?, image_url = ?, ai_prompt = ?, coming_soon = ?, display_order = ?, is_active = ? WHERE id = ?',
      [title, description, image_url, ai_prompt || null, coming_soon || false, display_order || 0, is_active !== false, id]
    );

    return NextResponse.json({ message: 'Template updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Template ID is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM templates WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete template' },
      { status: 500 }
    );
  }
}
