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

interface OutfitTemplate extends RowDataPacket {
  id: number;
  name: string;
  ai_prompt: string | null;
  outfit_image_url: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const templateId = formData.get('templateId') as string;
    const customPrompt = formData.get('prompt') as string;
    const isOutfit = formData.get('isOutfit') === 'true';

    if (!image || !templateId) {
      return NextResponse.json(
        { error: 'Image and template ID are required' },
        { status: 400 }
      );
    }

    let aiPrompt = 'Generate an AI-enhanced image';
    let outfitImagePath: string | null = null;

    if (isOutfit) {
      // Fetch outfit template
      const [rows] = await pool.query<OutfitTemplate[]>(
        'SELECT id, name, ai_prompt, outfit_image_url FROM outfit_templates WHERE id = ?',
        [templateId]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Outfit template not found' },
          { status: 404 }
        );
      }

      const outfit = rows[0];
      aiPrompt = customPrompt || outfit.ai_prompt || 'Take the face from the user uploaded image and seamlessly place it onto the person wearing the outfit in the second image. Match the lighting, skin tone, and angle to make it look natural and realistic. Preserve all facial features from the user image while maintaining the outfit and pose from the template image.';
      outfitImagePath = outfit.outfit_image_url;
      
      console.log('Using outfit template:', outfit.name);
      console.log('AI Prompt from database:', outfit.ai_prompt);
      console.log('Custom prompt provided:', customPrompt);
      console.log('Final prompt being used:', aiPrompt);
    } else {
      // Fetch regular template
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
      aiPrompt = customPrompt || template.ai_prompt || 'Generate an AI-enhanced image';
      
      console.log('Using regular template:', template.title);
      console.log('AI Prompt from database:', template.ai_prompt);
      console.log('Custom prompt provided:', customPrompt);
      console.log('Final prompt being used:', aiPrompt);
    }

    // Initialize Google GenAI
    const ai = new GoogleGenAI({
      apiKey: process.env.GOOGLE_AI_API_KEY,
    });

    // Convert uploaded image to base64
    const bytes = await image.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const base64Image = buffer.toString('base64');

    // Build content parts
    const contentParts: any[] = [];

    // If outfit template, structure differently for face swap
    if (isOutfit && outfitImagePath) {
      try {
        // Read outfit image from public directory
        const outfitPath = path.join(process.cwd(), 'public', outfitImagePath.replace('/api/', ''));
        const outfitImageBuffer = fs.readFileSync(outfitPath);
        const outfitBase64 = outfitImageBuffer.toString('base64');
        
        // For face swap: First show user face, then outfit image
        contentParts.push(
          { text: `You are an expert image editor. I need you to create a single composite image by merging these two images:

IMAGE 1 (User photo): Extract only the face, head, and facial features from this image.
IMAGE 2 (Outfit reference): This shows the target outfit, pose, and body.

YOUR TASK: Create a photorealistic image where:
- The face from Image 1 is placed onto the body in Image 2
- Match skin tone, lighting, and shadows perfectly
- Keep the exact outfit, pose, background from Image 2
- The final result should look like one natural photograph of the person from Image 1 wearing the outfit from Image 2
- Make the face placement seamless with no visible edges or mismatches

Generate only the final merged image, not a comparison or side-by-side.` },
          {
            inlineData: {
              mimeType: image.type,
              data: base64Image,
            },
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: outfitBase64,
            },
          }
        );

        console.log('Including both images for face swap - User face + Outfit template');
      } catch (error) {
        console.error('Error reading outfit image:', error);
        // Fallback to single image
        contentParts.push(
          { text: aiPrompt },
          {
            inlineData: {
              mimeType: image.type,
              data: base64Image,
            },
          }
        );
      }
    } else {
      // Regular template - single image
      contentParts.push(
        { text: aiPrompt },
        {
          inlineData: {
            mimeType: image.type,
            data: base64Image,
          },
        }
      );
    }

    // Generate image with Google GenAI
    console.log('Sending request to Gemini');
    console.log('Number of images:', contentParts.filter(p => p.inlineData).length);
    
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: [
        {
          parts: contentParts,
        },
      ],
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
