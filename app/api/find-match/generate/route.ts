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

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Step 1: Analyze the user's face to get age, features
    const analyzeResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/analyze-face`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ image: base64Image }),
    });

    if (!analyzeResponse.ok) {
      throw new Error('Failed to analyze face');
    }

    const faceData = await analyzeResponse.json();
    const { age, gender: detectedGender, ethnicity, features } = faceData;

    // Step 2: Generate matching partner
    const partnerGender = gender === 'girl' ? 'boy' : 'girl';
    const partnerPrompt = `A ${age}-year-old ${partnerGender === 'boy' ? 'handsome young man' : 'beautiful young woman'}, ${ethnicity || 'asian'} ethnicity, professional portrait photo, looking at camera, perfect lighting, detailed face, high quality, realistic, age ${age}, suitable partner for a ${gender}`;

    const partnerResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: partnerPrompt,
        model: 'flux-realism',
        aspectRatio: '1:1',
      }),
    });

    if (!partnerResponse.ok) {
      throw new Error('Failed to generate partner image');
    }

    const partnerData = await partnerResponse.json();
    const partnerImageUrl = partnerData.imageUrl;

    // Step 3: Save user's image to public folder
    const uploadsDir = path.join(process.cwd(), 'public', 'generated', 'matches');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    const timestamp = Date.now();
    const userFilename = `user_${session.user.id}_${timestamp}.jpg`;
    const userFilepath = path.join(uploadsDir, userFilename);
    fs.writeFileSync(userFilepath, buffer);
    const userImageUrl = `/generated/matches/${userFilename}`;

    // Step 4: Generate couple photo using both images
    const couplePrompt = `A romantic couple photo, ${age}-year-old ${gender === 'girl' ? 'beautiful woman and handsome man' : 'handsome man and beautiful woman'}, standing close together, smiling, perfect lighting, professional photography, high quality, realistic, matching couple, ${ethnicity || 'asian'} ethnicity`;

    const coupleResponse = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: couplePrompt,
        model: 'flux-realism',
        aspectRatio: '1:1',
      }),
    });

    if (!coupleResponse.ok) {
      throw new Error('Failed to generate couple image');
    }

    const coupleData = await coupleResponse.json();
    const coupleImageUrl = coupleData.imageUrl;

    // Step 5: Save generation to database
    const connection = await pool.getConnection();
    try {
      await connection.query(
        'INSERT INTO generations (user_id, template_id, prompt, image_url, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [session.user.id, null, `Find Match: ${partnerPrompt}`, partnerImageUrl, 'flux-realism', 'completed']
      );

      await connection.query(
        'INSERT INTO generations (user_id, template_id, prompt, image_url, model, status) VALUES (?, ?, ?, ?, ?, ?)',
        [session.user.id, null, `Couple Photo: ${couplePrompt}`, coupleImageUrl, 'flux-realism', 'completed']
      );
    } finally {
      connection.release();
    }

    return NextResponse.json({
      userImageUrl,
      partnerImageUrl,
      coupleImageUrl,
      analysis: {
        age,
        gender: detectedGender,
        ethnicity,
      },
    });

  } catch (error: any) {
    console.error('Error in find-match generation:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate match' },
      { status: 500 }
    );
  }
}
