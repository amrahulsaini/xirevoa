import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

const TEMPLATE_FACE_SHAPES: Record<number, string[]> = {
  23: ["oval", "square", "rectangular"],
  24: ["round", "oval", "heart"],
  25: ["square", "round", "oval"],
  26: ["oval", "rectangular", "diamond"],
  27: ["oval", "square", "heart"],
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

    const formData = await request.formData();
    const image = formData.get('image') as File;

    if (!image) {
      return NextResponse.json(
        { error: 'Image is required' },
        { status: 400 }
      );
    }

    // Fetch hairstyle templates from database
    const [templates] = await pool.query<RowDataPacket[]>(
      'SELECT id, title, description FROM templates WHERE id IN (23, 24, 25, 26, 27) AND is_active = TRUE ORDER BY display_order ASC'
    );

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    // Convert image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Analyze face shape using Gemini
    const analysisPrompt = `Analyze this person's face shape. Determine if the face is:
- Oval (balanced proportions, slightly longer than wide)
- Round (similar width and length, soft angles)
- Square (strong jawline, similar width throughout)
- Rectangular/Oblong (longer face with straight sides)
- Heart (wider forehead, narrow chin)
- Diamond (narrow forehead and chin, wider cheekbones)

Respond with ONLY the face shape name (lowercase), followed by a brief 2-sentence explanation of why this shape suits certain hairstyles. Format: "SHAPE: explanation here"`;

    console.log('=== FACE ANALYSIS START ===');
    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash-exp',
      contents: [
        {
          parts: [
            { text: analysisPrompt },
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

    const analysisText = response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    console.log('Analysis result:', analysisText);

    // Extract face shape from response
    const faceShapeMatch = analysisText.match(/^(oval|round|square|rectangular|oblong|heart|diamond)/i);
    const detectedShape = faceShapeMatch ? faceShapeMatch[1].toLowerCase() : 'oval';
    
    // Normalize "oblong" to "rectangular"
    const normalizedShape = detectedShape === 'oblong' ? 'rectangular' : detectedShape;

    // Find matching hairstyles from database
    const matchingTemplates = templates.filter((t: any) => {
      const shapes = TEMPLATE_FACE_SHAPES[t.id] || [];
      return shapes.includes(normalizedShape);
    });

    // Take top 3 recommendations
    const recommendations = matchingTemplates.slice(0, 3).map((t: any) => ({
      name: t.title,
      description: t.description,
      templateId: t.id,
      reason: `Perfect for ${normalizedShape} face shapes - enhances your natural features`
    }));

    // If less than 3, add remaining templates
    if (recommendations.length < 3) {
      const remaining = templates
        .filter((t: any) => !matchingTemplates.find((m: any) => m.id === t.id))
        .slice(0, 3 - recommendations.length);
      
      remaining.forEach((t: any) => {
        recommendations.push({
          name: t.title,
          description: t.description,
          templateId: t.id,
          reason: `Great alternative style for your features`
        });
      });
    }

    console.log('=== FACE ANALYSIS SUCCESS ===');
    console.log('Detected shape:', normalizedShape);
    console.log('Recommendations:', recommendations.length);

    return NextResponse.json({
      success: true,
      faceShape: analysisText,
      detectedShape: normalizedShape,
      recommendations,
    });

  } catch (error: any) {
    console.error('Face analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze face' },
      { status: 500 }
    );
  }
}
