import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import type { RowDataPacket } from 'mysql2';

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { amount, reason } = await req.json();

    if (!amount || typeof amount !== 'number' || amount < 1) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
    }

    const connection = await pool.getConnection();

    try {
      // Get current XP
      const [rows] = await connection.query<RowDataPacket[]>(
        'SELECT xpoints FROM users WHERE email = ?',
        [session.user.email]
      );

      if (!rows || rows.length === 0) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 });
      }

      const currentXP = rows[0].xpoints || 0;

      if (currentXP < amount) {
        return NextResponse.json(
          { error: 'Insufficient XP', currentXP },
          { status: 400 }
        );
      }

      // Deduct XP
      await connection.query(
        'UPDATE users SET xpoints = xpoints - ? WHERE email = ?',
        [amount, session.user.email]
      );

      const newXP = currentXP - amount;

      return NextResponse.json({
        success: true,
        newXP,
        deducted: amount,
        reason: reason || 'XP deduction'
      });
    } finally {
      connection.release();
    }
  } catch (error) {
    console.error('Deduct XP error:', error);
    return NextResponse.json(
      { error: 'Failed to deduct XP' },
      { status: 500 }
    );
  }
}
