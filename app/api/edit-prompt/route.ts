import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { GoogleGenAI, createUserContent } from '@google/genai';
import { RowDataPacket, ResultSetHeader } from 'mysql2';

const genAI = new GoogleGenAI({});
const EDIT_COST = 3; // Editing costs 3 XP

interface UserSettingsRow extends RowDataPacket {
  preferred_model: string;
}

interface ModelRow extends RowDataPacket {
  model_name: string;
  xp_cost: number;
  is_active: number;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = Number(session.user.id);
    const formData = await request.formData();
    const imageFile = formData.get('image') as File;
    const customPrompt = formData.get('customPrompt') as string;
    const selectedModel = formData.get('selectedModel') as string | null;

    if (!imageFile || !customPrompt) {
      return NextResponse.json({ error: 'Missing image or prompt' }, { status: 400 });
    }

    // Check user's current XP
    const [userRows] = await pool.query<RowDataPacket[]>(
      'SELECT xpoints FROM users WHERE id = ?',
      [userId]
    );

    if (!userRows.length) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const currentXP = userRows[0].xpoints;
    if (currentXP < EDIT_COST) {
      return NextResponse.json({ 
        error: 'Insufficient XP', 
        required: EDIT_COST, 
        current: currentXP 
      }, { status: 402 });
    }

    // Use selectedModel if provided, otherwise get user's preferred model
    let preferredModel = selectedModel || 'gemini-2.0-flash-exp';
    let modelName = 'Gemini 2.0 Flash';

    if (!selectedModel) {
      const [settingsRows] = await pool.query<UserSettingsRow[]>(
        'SELECT preferred_model FROM user_settings WHERE user_id = ?',
        [userId]
      );

      if (settingsRows.length > 0 && settingsRows[0].preferred_model) {
        preferredModel = settingsRows[0].preferred_model;
      }
    }

    // Get model details
    const [modelRows] = await pool.query<ModelRow[]>(
      'SELECT model_name, xp_cost, is_active FROM ai_models WHERE model_id = ?',
      [preferredModel]
    );

    if (modelRows.length > 0) {
      if (!modelRows[0].is_active) {
        // Fall back to default if model is inactive
        preferredModel = 'gemini-2.0-flash-exp';
        modelName = 'Gemini 2.0 Flash';
      } else {
        modelName = modelRows[0].model_name;
      }
    }

    // Convert image to base64
    const bytes = await imageFile.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Call Gemini API with the image and refinement prompt
    const contentParts = [
      { 
        text: `You are an expert image editor. The user wants to refine this image with the following request: "${customPrompt}". Please generate an improved version of this image that incorporates the user's refinement request. Keep the core elements and composition similar to the original, but apply the requested changes thoughtfully.`
      },
      {
        inlineData: {
          data: base64Image,
          mimeType: imageFile.type,
        },
      },
    ];

    const response = await genAI.models.generateContent({
      model: preferredModel,
      contents: createUserContent(contentParts),
    });

    const imageData = response.candidates?.[0]?.content?.parts?.[0];
    
    if (!imageData || !imageData.inlineData || !imageData.inlineData.data) {
      throw new Error('No image generated');
    }

    const generatedBase64 = imageData.inlineData.data;
    const imageBuffer = Buffer.from(generatedBase64, 'base64');

    // Save to database
    const timestamp = Date.now();
    const filename = `${userId}_${timestamp}.png`;
    const fs = require('fs').promises;
    const path = require('path');
    const filepath = path.join(process.cwd(), 'public', 'generated', filename);
    
    await fs.writeFile(filepath, imageBuffer);

    const imageUrl = `/generated/${filename}`;

    // Insert generation record
    await pool.query<ResultSetHeader>(
      'INSERT INTO generations (user_id, template_id, image_url, prompt, model_used, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [userId, null, imageUrl, customPrompt, modelName]
    );

    // Deduct XP
    await pool.query(
      'UPDATE users SET xpoints = xpoints - ? WHERE id = ?',
      [EDIT_COST, userId]
    );

    return NextResponse.json({ 
      success: true, 
      imageUrl,
      modelUsed: modelName,
      xpSpent: EDIT_COST
    });

  } catch (error: any) {
    console.error('Error editing image:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to edit image' 
    }, { status: 500 });
  }
}
