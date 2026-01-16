import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  ai_prompt: string | null;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const templateId = formData.get('templateId') as string;
    const customPrompt = formData.get('prompt') as string;

    if (!image || !templateId) {
      return NextResponse.json(
        { error: 'Image and template ID are required' },
        { status: 400 }
      );
    }

    // Fetch template AI prompt from database
    const [rows] = await pool.query<Template[]>(
      'SELECT id, title, ai_prompt FROM templates WHERE id = ?',
      [templateId]
    );

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'Template not found' },
        { status: 404 }
      );
    }

    const template = rows[0];
    const aiPrompt = customPrompt || template.ai_prompt || 'Generate an AI-enhanced image';

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    // Construct prompt - keep it simple
    const fullPrompt = `${aiPrompt}. Create a professional quality image based on this description.`;

    // Generate image with Google GenAI
    console.log('Sending request to Gemini with prompt:', fullPrompt);
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: fullPrompt,
    });

    console.log('Gemini response received');

    // Process the response
    if (!response.candidates || response.candidates.length === 0) {
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];
    
    if (!candidate.content || !candidate.content.parts) {
      return NextResponse.json(
        { error: 'Invalid response structure from AI model' },
        { status: 500 }
      );
    }

    for (const part of candidate.content.parts) {
      if (part.inlineData && part.inlineData.data) {
        const imageData = part.inlineData.data;
        const generatedBuffer = Buffer.from(imageData, 'base64');

        // Create generated images directory if it doesn't exist
        const publicDir = path.join(process.cwd(), 'public', 'generated');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        // Save generated image with unique filename
        const filename = `generated-${Date.now()}.png`;
        const filepath = path.join(publicDir, filename);
        fs.writeFileSync(filepath, generatedBuffer);
        
        console.log(`Image saved to: ${filepath}`);
        console.log(`File size: ${generatedBuffer.length} bytes`);

        return NextResponse.json({
          success: true,
          imageUrl: `/api/generated/${filename}`,
          message: 'Image generated successfully',
        });
      }
    }

    return NextResponse.json(
      { error: 'No image data in response' },
      { status: 500 }
    );
  } catch (error: any) {
    console.error('Generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate image' },
      { status: 500 }
    );
  }
}
