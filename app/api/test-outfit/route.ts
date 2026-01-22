import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  const logs: string[] = [];
  
  try {
    logs.push('=== TEST OUTFIT GENERATION START ===');
    logs.push(`Timestamp: ${new Date().toISOString()}`);
    
    const formData = await request.formData();
    const outfitImage = formData.get('outfitImage') as File;
    const faceImage = formData.get('faceImage') as File;

    if (!outfitImage || !faceImage) {
      logs.push('❌ Missing images');
      return NextResponse.json(
        { error: 'Both images required', logs: logs.join('\n') },
        { status: 400 }
      );
    }

    logs.push(`Outfit image: ${outfitImage.name} (${outfitImage.type}, ${outfitImage.size} bytes)`);
    logs.push(`Face image: ${faceImage.name} (${faceImage.type}, ${faceImage.size} bytes)`);

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });
    logs.push('✅ GoogleGenAI initialized');

    // Convert outfit image to base64
    const outfitBytes = await outfitImage.arrayBuffer();
    const outfitBuffer = Buffer.from(outfitBytes);
    const base64Outfit = outfitBuffer.toString('base64');
    logs.push(`Outfit base64 length: ${base64Outfit.length} chars`);

    // Convert face image to base64
    const faceBytes = await faceImage.arrayBuffer();
    const faceBuffer = Buffer.from(faceBytes);
    const base64Face = faceBuffer.toString('base64');
    logs.push(`Face base64 length: ${base64Face.length} chars`);

    // Create prompt array EXACTLY as Google's example
    const prompt = [
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Outfit,
        },
      },
      {
        inlineData: {
          mimeType: "image/jpeg",
          data: base64Face,
        },
      },
      { 
        text: `Create a professional e-commerce fashion photo. Take the outfit/clothing from the FIRST image and place it on the person shown in the SECOND image.

Generate a realistic, full-body portrait showing the person from the second image wearing the outfit from the first image. The person's face, skin tone, and body type should remain exactly the same. Only the clothing should change.

Ensure proper fit, natural lighting, and realistic shadows. Generate a complete, high-quality image showing the full transformation.` 
      },
    ];

    logs.push('📝 Prompt structure:');
    logs.push('  1. Outfit image (inline data)');
    logs.push('  2. Face/person image (inline data)');
    logs.push('  3. Text instruction');
    logs.push('');
    logs.push('🚀 Sending to Gemini 2.5 Flash Image...');

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-image",
      contents: prompt,
    });

    logs.push('✅ Response received from Gemini');
    logs.push(`Candidates: ${response.candidates?.length || 0}`);

    if (!response.candidates || response.candidates.length === 0) {
      logs.push('❌ No candidates in response');
      return NextResponse.json(
        { error: 'No response from AI', logs: logs.join('\n') },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];
    logs.push(`Finish reason: ${candidate.finishReason}`);
    logs.push(`Content parts: ${candidate.content?.parts?.length || 0}`);

    if (!candidate.content || !candidate.content.parts) {
      logs.push('❌ No content or parts in candidate');
      return NextResponse.json(
        { error: 'Invalid response structure', logs: logs.join('\n') },
        { status: 500 }
      );
    }

    for (const part of candidate.content.parts) {
      if (part.text) {
        logs.push(`📝 Text part: ${part.text}`);
      } else if (part.inlineData) {
        const imageData = part.inlineData.data;
        const generatedBuffer = Buffer.from(imageData, 'base64');
        
        logs.push(`🖼️ Image part received`);
        logs.push(`Generated image size: ${generatedBuffer.length} bytes (${(generatedBuffer.length / 1024 / 1024).toFixed(2)} MB)`);

        // Check if it's the same as input
        if (imageData === base64Outfit) {
          logs.push('⚠️ WARNING: Generated image matches OUTFIT input (unchanged)');
        } else if (imageData === base64Face) {
          logs.push('⚠️ WARNING: Generated image matches FACE input (unchanged)');
        } else {
          logs.push('✅ Generated image is DIFFERENT from both inputs');
        }

        // Save image
        const publicDir = path.join(process.cwd(), 'public', 'generated');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const filename = `test-${Date.now()}.png`;
        const filepath = path.join(publicDir, filename);
        fs.writeFileSync(filepath, generatedBuffer);
        
        logs.push(`💾 Saved to: ${filepath}`);
        logs.push('=== TEST GENERATION SUCCESS ===');

        return NextResponse.json({
          success: true,
          imageUrl: `/api/generated/${filename}`,
          logs: logs.join('\n'),
        });
      }
    }

    logs.push('❌ No image data in response parts');
    return NextResponse.json(
      { error: 'No image in response', logs: logs.join('\n') },
      { status: 500 }
    );

  } catch (error: any) {
    logs.push('');
    logs.push('❌ ERROR:');
    logs.push(error.message);
    logs.push(error.stack);
    
    return NextResponse.json(
      { error: error.message, logs: logs.join('\n') },
      { status: 500 }
    );
  }
}
