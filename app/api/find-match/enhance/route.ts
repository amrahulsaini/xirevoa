import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const { imageUrl, prompt, target } = await request.json();

    if (!imageUrl || !prompt) {
      return NextResponse.json(
        { error: 'Image URL and prompt required' },
        { status: 400 }
      );
    }

    // Download the original image
    let imageBase64: string;
    
    if (imageUrl.startsWith('http')) {
      const imageResponse = await fetch(imageUrl);
      const arrayBuffer = await imageResponse.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      imageBase64 = buffer.toString('base64');
    } else {
      // Local file
      const fs = require('fs');
      const path = require('path');
      const filepath = path.join(process.cwd(), 'public', imageUrl);
      const buffer = fs.readFileSync(filepath);
      imageBase64 = buffer.toString('base64');
    }

    // Generate enhanced version using img2img
    const enhanceResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: `${prompt}, enhance photo quality, professional photography, high detail, perfect lighting`,
        model: 'flux-realism',
        aspectRatio: '1:1',
        init_image: imageBase64,
        strength: 0.3, // Low strength to preserve original
      }),
    });

    if (!enhanceResponse.ok) {
      throw new Error('Failed to enhance image');
    }

    const enhanceData = await enhanceResponse.json();
    const enhancedImageUrl = enhanceData.imageUrl;

    // Save to database
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'INSERT INTO generations (user_id, template_id, prompt, image_url, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [session.user.id, null, `Enhancement: ${prompt}`, enhancedImageUrl, 'flux-realism', 'completed']
      );
    } finally {
      connection.release();
    }

    return NextResponse.json({
      enhancedImageUrl,
      target,
    });

  } catch (error: any) {
    console.error('Error in image enhancement:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to enhance image' },
      { status: 500 }
    );
  }
}
