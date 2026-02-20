import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const gender = formData.get('gender') as string;

    if (!imageFile) {
      return NextResponse.json(
        { error: 'No image provided' },
        { status: 400 }
      );
    }

    // Save user's image to public folder
    const uploadsDir = path.join(process.cwd(), 'public', 'generated', 'matches');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const userFilename = `user_${session.user.id}_${timestamp}.jpg`;
    const userFilepath = path.join(uploadsDir, userFilename);
    fs.writeFileSync(userFilepath, buffer);
    const userImageUrl = `/generated/matches/${userFilename}`;

    // Determine template ID based on gender
    // Template 73: Generate boy companion (for girls)
    // Template 74: Generate girl companion (for boys)
    const templateId = gender === 'girl' ? 73 : 74;

    // Get template details
    const connection = await pool.getConnection();
    let template: any;
    
    try {
      const [templates]: any = await connection.query(
        'SELECT * FROM templates WHERE id = ?',
        [templateId]
      );
      
      if (templates.length === 0) {
        throw new Error('Template not found');
      }
      
      template = templates[0];
    } finally {
      connection.release();
    }

    // Convert user image to base64 for generation
    const base64Image = buffer.toString('base64');

    // Generate partner using template
    const partnerResponse = await fetch(`${process.env.REPLICATE_WEBHOOK_URL || 'http://localhost:3012'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        templateId: templateId,
        userImage: base64Image,
        aspectRatio: '1:1',
      }),
    });

    if (!partnerResponse.ok) {
      const errorData = await partnerResponse.json();
      throw new Error(errorData.error || 'Failed to generate partner image');
    }

    const partnerData = await partnerResponse.json();
    const partnerImageUrl = partnerData.imageUrl;

    // Generate couple photo using the opposite template's prompt with both
    const couplePrompt = `A romantic couple photo, young man and woman together, smiling at camera, standing close, perfect lighting, professional photography, high quality, realistic`;
    
    const coupleResponse = await fetch(`${process.env.REPLICATE_WEBHOOK_URL || 'http://localhost:3012'}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: couplePrompt,
        model: template.model || 'flux-realism',
        aspectRatio: '1:1',
        userImage: base64Image,
      }),
    });

    if (!coupleResponse.ok) {
      throw new Error('Failed to generate couple image');
    }

    const coupleData = await coupleResponse.json();
    const coupleImageUrl = coupleData.imageUrl;

    // Save generations to database
    const conn = await pool.getConnection();
    try {
      await conn.query(
        'INSERT INTO generations (user_id, template_id, prompt, image_url, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [session.user.id, templateId, template.prompt, partnerImageUrl, template.model, 'completed']
      );

      await conn.query(
        'INSERT INTO generations (user_id, template_id, prompt, image_url, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [session.user.id, null, couplePrompt, coupleImageUrl, template.model, 'completed']
      );
    } finally {
      conn.release();
    }

    return NextResponse.json({
      userImageUrl,
      partnerImageUrl,
      coupleImageUrl,
    });

  } catch (error: any) {
    console.error('Error in find-match generation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate match' },
      { status: 500 }
    );
  }
}
