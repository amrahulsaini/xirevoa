import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import pool from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { RowDataPacket } from 'mysql2';

const HAIRSTYLE_PROMPTS: Record<number, string> = {
  101: "Transform this person's hairstyle into a CLASSIC POMPADOUR. Create a voluminous, swept-back style with height on top, short sides, and a polished finish. Keep the person's face, features, and skin tone exactly the same. Generate a professional, high-quality portrait showing the complete head and hair.",
  102: "Transform this person's hairstyle into a MODERN QUIFF. Create a textured, voluminous front section swept upward and back, with shorter sides. Keep the person's face, features, and skin tone exactly the same. Generate a stylish, contemporary portrait showing the complete head and hair.",
  103: "Transform this person's hairstyle into a TEXTURED CROP. Create a short, choppy style with texture on top and shorter sides. Low-maintenance and modern. Keep the person's face, features, and skin tone exactly the same. Generate a trendy portrait showing the complete head and hair.",
  104: "Transform this person's hairstyle into a CLASSIC SIDE PART. Create a clean, professional style with a defined side part, neatly combed, and shorter sides. Keep the person's face, features, and skin tone exactly the same. Generate a polished portrait showing the complete head and hair.",
  105: "Transform this person's hairstyle into a SLICK BACK style. Create a smooth, combed-back look with shine, longer on top, and shorter sides. Elegant and refined. Keep the person's face, features, and skin tone exactly the same. Generate a sophisticated portrait showing the complete head and hair.",
  106: "Transform this person's hairstyle into a BUZZ CUT. Create a very short, uniform length all over the head (about 1/4 inch). Clean, bold, minimalist. Keep the person's face, features, and skin tone exactly the same. Generate a sharp portrait showing the complete head and hair.",
  107: "Transform this person's hairstyle into a CREW CUT. Create a short, tapered style with slightly more length on top (about 1 inch), fading down the sides. Military-inspired. Keep the person's face, features, and skin tone exactly the same. Generate a clean portrait showing the complete head and hair.",
  108: "Transform this person's hairstyle into a FRENCH CROP. Create a short style with a cropped fringe/bangs, textured top, and short sides. Stylish and modern. Keep the person's face, features, and skin tone exactly the same. Generate a fashionable portrait showing the complete head and hair.",
};

const HAIRSTYLE_NAMES: Record<number, string> = {
  101: "Classic Pompadour",
  102: "Modern Quiff",
  103: "Textured Crop",
  104: "Side Part",
  105: "Slick Back",
  106: "Buzz Cut",
  107: "Crew Cut",
  108: "French Crop",
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const hairstyleId = parseInt(formData.get('hairstyleId') as string);

    if (!image || !hairstyleId) {
      return NextResponse.json(
        { error: 'Image and hairstyle ID are required' },
        { status: 400 }
      );
    }

    if (!HAIRSTYLE_PROMPTS[hairstyleId]) {
      return NextResponse.json(
        { error: 'Invalid hairstyle ID' },
        { status: 400 }
      );
    }

    // Check XP balance
    const connection = await pool.getConnection();
    const XP_COST = 3;
    
    try {
      const [users] = await connection.query<RowDataPacket[]>(
        'SELECT xpoints FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      const currentXP = users[0].xpoints;
      
      if (currentXP < XP_COST) {
        return NextResponse.json(
          { error: `Insufficient XPoints. You need ${XP_COST} XP but only have ${currentXP} XP.` },
          { status: 403 }
        );
      }

      // Deduct XP
      await connection.query(
        'UPDATE users SET xpoints = xpoints - ? WHERE id = ?',
        [XP_COST, userId]
      );

      console.log(`Deducted ${XP_COST} XP from user ${userId}. New balance: ${currentXP - XP_COST}`);
    } finally {
      connection.release();
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    const prompt = HAIRSTYLE_PROMPTS[hairstyleId];
    const hairstyleName = HAIRSTYLE_NAMES[hairstyleId];

    console.log('=== HAIRSTYLE GENERATION START ===');
    console.log('Hairstyle:', hairstyleName);
    console.log('User ID:', userId);

    // Generate hairstyle with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: image.type,
                data: base64Image,
              },
            },
          ],
          role: 'user',
        },
      ],
    });

    console.log('=== GEMINI RESPONSE RECEIVED ===');

    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];

    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      return NextResponse.json(
        { error: `Generation blocked: ${candidate.finishReason}` },
        { status: 500 }
      );
    }

    const part = candidate.content?.parts?.[0];
    if (!part?.inlineData?.data) {
      return NextResponse.json(
        { error: 'No image data in response' },
        { status: 500 }
      );
    }

    const imageData = part.inlineData.data;
    const generatedBuffer = Buffer.from(imageData, 'base64');

    // Save generated image
    const publicDir = path.join(process.cwd(), 'public', 'generated');
    if (!fs.existsSync(publicDir)) {
      fs.mkdirSync(publicDir, { recursive: true });
    }

    const filename = `generated-${Date.now()}.png`;
    const filepath = path.join(publicDir, filename);
    fs.writeFileSync(filepath, generatedBuffer);
    const generatedImageUrl = `/api/generated/${filename}`;

    console.log(`Image saved: ${filepath}`);
    console.log(`File size: ${generatedBuffer.length} bytes`);

    // Save original image
    const originalFilename = `original-${Date.now()}.${image.type.split('/')[1] || 'jpg'}`;
    const originalFilepath = path.join(publicDir, originalFilename);
    fs.writeFileSync(originalFilepath, buffer);
    const originalImageUrl = `/api/generated/${originalFilename}`;

    // Save to database
    const saveConnection = await pool.getConnection();
    try {
      const [insertResult]: any = await saveConnection.query(
        `INSERT INTO generations 
        (user_id, template_id, template_title, original_image_url, generated_image_url, xp_cost, is_outfit, prompt_used, model_used) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [userId, hairstyleId, hairstyleName, originalImageUrl, generatedImageUrl, XP_COST, false, prompt, 'Gemini 2.0 Flash']
      );

      console.log('Generation saved to database with ID:', insertResult.insertId);
    } finally {
      saveConnection.release();
    }

    console.log('=== HAIRSTYLE GENERATION SUCCESS ===');

    return NextResponse.json({
      success: true,
      imageUrl: generatedImageUrl,
      hairstyleName,
    });

  } catch (error: any) {
    console.error('Hairstyle generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate hairstyle' },
      { status: 500 }
    );
  }
}
