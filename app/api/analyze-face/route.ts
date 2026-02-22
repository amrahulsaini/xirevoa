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

CRITICAL: All prompts must emphasize that ONLY the hairstyle should change. The person's face, facial features, skin tone, eye color, face shape, expression, clothing, accessories, background, and everything else MUST remain completely unchanged and identical to the original photo.

Format your response EXACTLY like this:

FACE_ANALYSIS: [Your analysis of their face shape and features in 2-3 sentences]

HAIRSTYLE_1:
NAME: [Hairstyle name]
DESCRIPTION: [Brief description]
REASON: [Why it suits them]
PROMPT: [Detailed prompt: "ONLY change the hairstyle to [detailed hairstyle description]. Keep the person's exact face, facial features, skin tone, eye color, face shape, expression, clothing, accessories, and background completely identical and unchanged. The new hairstyle should feature [specific details about cut, length, texture, styling]. Professional photography, 8K HD quality, photorealistic."]

HAIRSTYLE_2:
[Same format]

HAIRSTYLE_3:
[Same format]

Be creative and specific with hairstyle names and descriptions. Make the AI prompts detailed and photorealistic.

Additionally, provide 4 QUICK SUGGESTIONS for simple hairstyle transformations. Format like this:

QUICK_SUGGESTIONS:
1. TITLE: [Short title like "Make hair curly"] | EMOJI: [relevant emoji] | PROMPT: [Detailed AI prompt that emphasizes ONLY changing hairstyle, keeping everything else identical]
2. TITLE: [Short title] | EMOJI: [relevant emoji] | PROMPT: [Detailed AI prompt that emphasizes ONLY changing hairstyle]
3. TITLE: [Short title] | EMOJI: [relevant emoji] | PROMPT: [Detailed AI prompt that emphasizes ONLY changing hairstyle]
4. TITLE: [Short title] | EMOJI: [relevant emoji] | PROMPT: [Detailed AI prompt]`;

    console.log('=== FACE ANALYSIS START ===');
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
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

    // Parse the AI response (using [\s\S] instead of . with s flag for ES2017 compatibility)
    const faceAnalysisMatch = analysisText.match(/FACE_ANALYSIS:\s*([\s\S]+?)(?=\n\nHAIRSTYLE_|$)/);
    const faceAnalysis = faceAnalysisMatch ? faceAnalysisMatch[1].trim() : 'AI analysis completed';

    // Extract hairstyle recommendations (using [\s\S] instead of . with s flag)
    const hairstyleRegex = /HAIRSTYLE_\d+:\s*NAME:\s*(.+?)\s*DESCRIPTION:\s*(.+?)\s*REASON:\s*(.+?)\s*PROMPT:\s*([\s\S]+?)(?=\n\nHAIRSTYLE_|$)/g;
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

    // Extract quick suggestions
    const quickSuggestionsMatch = analysisText.match(/QUICK_SUGGESTIONS:\s*([\s\S]+?)(?=\n\n[A-Z_]+:|$)/);
    const quickSuggestions = [];
    
    if (quickSuggestionsMatch) {
      const suggestionsText = quickSuggestionsMatch[1];
      const suggestionRegex = /\d+\.\s*TITLE:\s*(.+?)\s*\|\s*EMOJI:\s*(.+?)\s*\|\s*PROMPT:\s*([\s\S]+?)(?=\n\d+\.|$)/g;
      let suggestionMatch;
      
      while ((suggestionMatch = suggestionRegex.exec(suggestionsText)) !== null) {
        quickSuggestions.push({
          title: suggestionMatch[1].trim(),
          icon: suggestionMatch[2].trim(),
          prompt: suggestionMatch[3].trim(),
        });
      }
    }

    // Ensure we have at least 3 recommendations
    if (recommendations.length < 3) {
      // Add fallback recommendations if AI didn't provide enough
      const fallbacks = [
        {
          name: "Modern Layered Cut",
          description: "Versatile layered hairstyle with natural movement",
          reason: "Complements most face shapes with its balanced proportions",
          aiPrompt: "ONLY change the hairstyle to a modern layered haircut featuring soft, face-framing layers. The layers should add volume and movement. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, accessories, and background completely identical and unchanged. Professional photography, 8K HD quality, photorealistic."
        },
        {
          name: "Soft Wavy Style",
          description: "Elegant waves that add dimension and texture",
          reason: "Softens features and adds a touch of glamour",
          aiPrompt: "ONLY change the hairstyle to soft, flowing waves. The waves should be natural-looking with gentle movement and shine. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, accessories, and background completely identical and unchanged. Professional photography, 8K HD quality, photorealistic."
        },
        {
          name: "Sleek Straight Look",
          description: "Polished straight hair with a glossy finish",
          reason: "Creates a sophisticated and timeless appearance",
          aiPrompt: "ONLY change the hairstyle to sleek, straight hair with a glossy, healthy shine. The hair should be perfectly smooth and polished. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, accessories, and background completely identical and unchanged. Professional photography, 8K HD quality, photorealistic."
        }
      ];

      while (recommendations.length < 3 && fallbacks.length > 0) {
        recommendations.push(fallbacks.shift()!);
      }
    }

    // Ensure we have fallback quick suggestions if AI didn't provide them
    if (quickSuggestions.length < 4) {
      const fallbackSuggestions = [
        { title: "Make hair curly", icon: "✨", prompt: "ONLY change the hairstyle to beautiful curly hair with natural curls. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, and background completely identical and unchanged. Professional photography, 8K quality, photorealistic." },
        { title: "Add highlights", icon: "💫", prompt: "ONLY add beautiful blonde highlights to the hair while keeping the natural base color. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, and background completely identical and unchanged. Professional salon quality, 8K, photorealistic." },
        { title: "Short pixie cut", icon: "✂️", prompt: "ONLY change the hairstyle to a trendy short pixie cut. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, and background completely identical and unchanged. Modern style, professional photography, 8K, photorealistic." },
        { title: "Long wavy style", icon: "🌊", prompt: "ONLY change the hairstyle to long, flowing wavy hair with natural texture. Keep the person's exact face, facial features, skin tone, eye color, expression, clothing, and background completely identical and unchanged. Professional photography, 8K quality, photorealistic." }
      ];

      while (quickSuggestions.length < 4 && fallbackSuggestions.length > 0) {
        quickSuggestions.push(fallbackSuggestions.shift()!);
      }
    }

    console.log('=== FACE ANALYSIS SUCCESS ===');
    console.log('Recommendations:', recommendations.length);
    console.log('Quick Suggestions:', quickSuggestions.length);

    return NextResponse.json({
      success: true,
      faceShape: faceAnalysis,
      recommendations: recommendations.slice(0, 3),
      quickSuggestions: quickSuggestions.slice(0, 4),
    });

  } catch (error: any) {
    console.error('Face analysis error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to analyze face' },
      { status: 500 }
    );
  }
}
