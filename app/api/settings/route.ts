import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { preferred_model, preferred_resolution, preferred_aspect_ratio } = await request.json();

    // Validate inputs
    if (!preferred_model || !preferred_resolution || !preferred_aspect_ratio) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update or insert user settings
    await pool.query(
      `INSERT INTO user_settings (user_id, preferred_model, preferred_resolution, preferred_aspect_ratio) 
       VALUES (?, ?, ?, ?) 
       ON DUPLICATE KEY UPDATE 
       preferred_model = VALUES(preferred_model),
       preferred_resolution = VALUES(preferred_resolution),
       preferred_aspect_ratio = VALUES(preferred_aspect_ratio)`,
      [userId, preferred_model, preferred_resolution, preferred_aspect_ratio]
    );

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
    });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to update settings' },
      { status: 500 }
    );
  }
}
