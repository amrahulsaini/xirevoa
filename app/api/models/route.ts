import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface ModelRow extends RowDataPacket {
  model_id: string;
  model_name: string;
  xp_cost: number;
  is_active: number;
}

interface UserSettingsRow extends RowDataPacket {
  preferred_model: string;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    // Get all models
    const [modelRows] = await pool.query<ModelRow[]>(
      'SELECT model_id, model_name, xp_cost, is_active FROM ai_models ORDER BY xp_cost ASC'
    );

    const models = modelRows.map(m => ({
      model_id: m.model_id,
      model_name: m.model_name,
      xp_cost: m.xp_cost,
      is_active: Boolean(m.is_active),
    }));

    let userPreferredModel = 'gemini-2.0-flash-exp';

    // Get user's preferred model if logged in
    if (session?.user?.id) {
      const userId = Number(session.user.id);
      const [settingsRows] = await pool.query<UserSettingsRow[]>(
        'SELECT preferred_model FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (settingsRows.length > 0 && settingsRows[0].preferred_model) {
        userPreferredModel = settingsRows[0].preferred_model;
      }
    }

    return NextResponse.json({
      models,
      userPreferredModel,
    });
  } catch (error: any) {
    console.error('Error fetching models:', error);
    return NextResponse.json(
      { error: 'Failed to fetch models' },
      { status: 500 }
    );
  }
}
