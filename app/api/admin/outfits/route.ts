import { NextRequest, NextResponse } from 'next/server';
import pool from '@/lib/db';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

interface OutfitTemplate extends RowDataPacket {
  id: number;
  name: string;
  description: string;
  outfit_image_url: string;
  category: string;
  ai_prompt: string;
  display_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// GET - Fetch all outfit templates
export async function GET() {
  try {
    const [rows] = await pool.query<OutfitTemplate[]>(
      'SELECT * FROM outfit_templates ORDER BY display_order ASC'
    );

    return NextResponse.json(rows);
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch outfit templates' },
      { status: 500 }
    );
  }
}

// POST - Create new outfit template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, outfit_image_url, category, ai_prompt, display_order, is_active } = body;

    if (!name || !description) {
      return NextResponse.json(
        { error: 'Name and description are required' },
        { status: 400 }
      );
    }

    const [result] = await pool.query<ResultSetHeader>(
      'INSERT INTO outfit_templates (name, description, outfit_image_url, category, ai_prompt, display_order, is_active) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [name, description, outfit_image_url || '', category || 'change-outfit', ai_prompt || null, display_order || 0, is_active !== false]
    );

    return NextResponse.json(
      { id: result.insertId, message: 'Outfit template created successfully' },
      { status: 201 }
    );
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to create outfit template' },
      { status: 500 }
    );
  }
}

// PUT - Update outfit template
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, description, outfit_image_url, category, ai_prompt, display_order, is_active } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'Outfit template ID is required' },
        { status: 400 }
      );
    }

    await pool.query(
      'UPDATE outfit_templates SET name = ?, description = ?, outfit_image_url = ?, category = ?, ai_prompt = ?, display_order = ?, is_active = ? WHERE id = ?',
      [name, description, outfit_image_url, category || 'change-outfit', ai_prompt || null, display_order || 0, is_active !== false, id]
    );

    return NextResponse.json({ message: 'Outfit template updated successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to update outfit template' },
      { status: 500 }
    );
  }
}

// DELETE - Delete outfit template
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'Outfit template ID is required' },
        { status: 400 }
      );
    }

    await pool.query('DELETE FROM outfit_templates WHERE id = ?', [id]);

    return NextResponse.json({ message: 'Outfit template deleted successfully' });
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json(
      { error: 'Failed to delete outfit template' },
      { status: 500 }
    );
  }
}
