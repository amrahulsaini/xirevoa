import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

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

    // Analyze face and recommend hairstyles using Gemini
    const analysisPrompt = `You are an expert hairstylist and beauty consultant. Analyze this person's face carefully and provide personalized hairstyle recommendations.

First, analyze their face shape (oval, round, square, rectangular, heart, or diamond) and facial features.

Then, recommend 3 SPECIFIC hairstyles that would look amazing on them. For each hairstyle, you must provide:
1. A creative hairstyle NAME (e.g., "Textured Layered Bob", "Soft Wavy Lob", "Side-Swept Pixie")
2. A brief DESCRIPTION (1 sentence about the style)
3. WHY it suits their face shape and features (be specific)
4. A detailed AI PROMPT to generate this hairstyle on their photo

Format your response EXACTLY like this:

FACE_ANALYSIS: [Your analysis of their face shape and features in 2-3 sentences]

HAIRSTYLE_1:
NAME: [Hairstyle name]
DESCRIPTION: [Brief description]
REASON: [Why it suits them]
PROMPT: [Detailed prompt: "Create a photorealistic portrait of the person with [detailed hairstyle description]. Maintain their exact facial features, skin tone, and natural beauty. The hairstyle should feature [specific details about cut, length, texture, styling]. Natural lighting, professional photography, 8K HD quality."]

HAIRSTYLE_2:
[Same format]

HAIRSTYLE_3:
[Same format]

Be creative and specific with hairstyle names and descriptions. Make the AI prompts detailed and photorealistic.`;

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

    // Parse the AI response
    const faceAnalysisMatch = analysisText.match(/FACE_ANALYSIS:\s*(.+?)(?=\n\nHAIRSTYLE_|$)/s);
    const faceAnalysis = faceAnalysisMatch ? faceAnalysisMatch[1].trim() : 'AI analysis completed';

    // Extract hairstyle recommendations
    const hairstyleRegex = /HAIRSTYLE_\d+:\s*NAME:\s*(.+?)\s*DESCRIPTION:\s*(.+?)\s*REASON:\s*(.+?)\s*PROMPT:\s*(.+?)(?=\n\nHAIRSTYLE_|$)/gs;
    const recommendations = [];
    let match;

    while ((match = hairstyleRegex.exec(analysisText)) !== null) {
      recommendations.push({
        name: match[1].trim(),
        description: match[2].trim(),
        reason: match[3].trim(),
        aiPrompt: match[4].trim(),
      });
    }

    // Ensure we have at least 3 recommendations
    if (recommendations.length < 3) {
      // Add fallback recommendations if AI didn't provide enough
      const fallbacks = [
        {
          name: "Modern Layered Cut",
          description: "Versatile layered hairstyle with natural movement",
          reason: "Complements most face shapes with its balanced proportions",
          aiPrompt: "Create a photorealistic portrait of the person with a modern layered haircut featuring soft, face-framing layers. The layers should add volume and movement. Maintain exact facial features, skin tone, and natural beauty. Natural lighting, professional styling, 8K HD quality."
        },
        {
          name: "Soft Wavy Style",
          description: "Elegant waves that add dimension and texture",
          reason: "Softens features and adds a touch of glamour",
          aiPrompt: "Create a photorealistic portrait of the person with soft, flowing waves. The waves should be natural-looking with gentle movement and shine. Maintain exact facial features, skin tone, and natural beauty. Soft lighting, elegant styling, 8K HD quality."
        },
        {
          name: "Sleek Straight Look",
          description: "Polished straight hair with a glossy finish",
          reason: "Creates a sophisticated and timeless appearance",
          aiPrompt: "Create a photorealistic portrait of the person with sleek, straight hair with a glossy, healthy shine. The hair should be perfectly smooth and polished. Maintain exact facial features, skin tone, and natural beauty. Studio lighting, high-end finish, 8K HD quality."
        }
      ];

      while (recommendations.length < 3 && fallbacks.length > 0) {
        recommendations.push(fallbacks.shift()!);
      }
    }

    console.log('=== FACE ANALYSIS SUCCESS ===');
    console.log('Recommendations:', recommendations.length);

    return NextResponse.json({
      success: true,
      faceShape: faceAnalysis,
      recommendations: recommendations.slice(0, 3),
    });

  } catch (error: any) {
    console.error('Face analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze face' },
      { status: 500 }
    );
  }
}
