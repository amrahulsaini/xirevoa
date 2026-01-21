import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

const HARDCODED_HAIRSTYLES = [
  {
    id: 101,
    name: "Classic Pompadour",
    description: "Timeless volume and sophistication",
    faceShapes: ["oval", "square", "rectangular"]
  },
  {
    id: 102,
    name: "Modern Quiff",
    description: "Contemporary style with height",
    faceShapes: ["round", "oval", "heart"]
  },
  {
    id: 103,
    name: "Textured Crop",
    description: "Low-maintenance and trendy",
    faceShapes: ["square", "round", "oval"]
  },
  {
    id: 104,
    name: "Side Part",
    description: "Professional and clean",
    faceShapes: ["oval", "rectangular", "diamond"]
  },
  {
    id: 105,
    name: "Slick Back",
    description: "Elegant and refined",
    faceShapes: ["oval", "square", "rectangular"]
  },
  {
    id: 106,
    name: "Buzz Cut",
    description: "Bold and minimalist",
    faceShapes: ["oval", "square", "diamond"]
  },
  {
    id: 107,
    name: "Crew Cut",
    description: "Military-inspired classic",
    faceShapes: ["square", "oval", "rectangular"]
  },
  {
    id: 108,
    name: "French Crop",
    description: "Stylish with short fringe",
    faceShapes: ["round", "heart", "oval"]
  }
];

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

    // Find matching hairstyles
    const matchingHairstyles = HARDCODED_HAIRSTYLES.filter(style =>
      style.faceShapes.includes(normalizedShape)
    );

    // Take top 3 recommendations
    const recommendations = matchingHairstyles.slice(0, 3).map(style => ({
      name: style.name,
      description: style.description,
      templateId: style.id,
      reason: `Perfect for ${normalizedShape} face shapes - enhances your natural features`
    }));

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
