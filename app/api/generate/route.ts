import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  ai_prompt: string | null;
  image_url: string;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const templateId = formData.get('templateId') as string;
    const customPrompt = formData.get('prompt') as string;
    const isOutfit = formData.get('isOutfit') === 'true';

    console.log('=== GENERATE REQUEST START ===');
    console.log('Template ID:', templateId);
    console.log('Is Outfit:', isOutfit);
    console.log('Custom Prompt:', customPrompt);
    console.log('Image name:', image?.name);
    console.log('Image type:', image?.type);

    if (!image || !templateId) {
      return NextResponse.json(
        { error: 'Image and template ID are required' },
        { status: 400 }
      );
    }

    let aiPrompt = 'Generate an AI-enhanced image';
    let templateImagePath: string | null = null;

    if (isOutfit) {
      // Fetch outfit template from regular templates table
      const [rows] = await pool.query<Template[]>(
        'SELECT id, title, ai_prompt, image_url FROM templates WHERE id = ?',
        [templateId]
      );

      if (rows.length === 0) {
        return NextResponse.json(
          { error: 'Outfit template not found' },
          { status: 404 }
        );
      }

      const template = rows[0];
      aiPrompt = customPrompt || template.ai_prompt || 'Take the face from the user uploaded image and seamlessly place it onto the person wearing the outfit in the second image. Match the lighting, skin tone, and angle to make it look natural and realistic. Preserve all facial features from the user image while maintaining the outfit and pose from the template image.';
      templateImagePath = rows[0].image_url;
      
      console.log('Using outfit template:', template.title);
      console.log('Template image URL:', templateImagePath);
      console.log('AI Prompt from database:', template.ai_prompt);
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
    if (isOutfit && templateImagePath) {
      try {
        // Read template image from public directory or fetch from URL
        let templateBase64: string;
        
        if (templateImagePath.startsWith('http://') || templateImagePath.startsWith('https://')) {
          // Fetch from URL
          console.log('Fetching template image from URL:', templateImagePath);
          const response = await fetch(templateImagePath);
          const arrayBuffer = await response.arrayBuffer();
          const templateBuffer = Buffer.from(arrayBuffer);
          templateBase64 = templateBuffer.toString('base64');
        } else {
          // Read from public directory
          const templatePath = path.join(process.cwd(), 'public', templateImagePath.replace('/api/', ''));
          console.log('Reading template image from path:', templatePath);
          const templateImageBuffer = fs.readFileSync(templatePath);
          templateBase64 = templateImageBuffer.toString('base64');
        }
        
        // For face swap: Explicitly label each image
        contentParts.push(
          { text: `You are an expert image editor. Create a photorealistic composite image by merging the face from the FIRST image with the body/outfit from the SECOND image.

FIRST IMAGE (coming next): This is the user's face. Extract this person's face, head, and facial features.` },
          {
            inlineData: {
              mimeType: image.type,
              data: base64Image,
            },
          },
          { text: `SECOND IMAGE (coming next): This is the outfit reference. Keep the body, outfit, pose, and background from this image.` },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: templateBase64,
            },
          },
          { text: `Now generate ONE final merged image where the face from the FIRST image is seamlessly placed onto the body in the SECOND image. Match skin tone, lighting, and shadows perfectly. Make it look like a natural single photograph.` }
        );

        console.log('Including both images for face swap - User face + Template outfit image');
        console.log('=== 2-IMAGE MODE ===');
        console.log('User image size (base64):', base64Image.length, 'characters');
        console.log('Template image size (base64):', templateBase64.length, 'characters');
        console.log('Template image path:', templateImagePath);
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

    // Generate image with Google GenAI using contentParts
    console.log('=== SENDING TO GEMINI ===');
    console.log('Model: gemini-2.5-flash-image');
    console.log('Is Outfit Mode:', isOutfit);
    console.log('Number of content parts:', contentParts.length);
    console.log('Number of images:', contentParts.filter((p: any) => p.inlineData).length);

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: createUserContent(contentParts),
    });

    console.log('=== GEMINI RESPONSE RECEIVED ===');
    console.log('Candidates count:', response.candidates?.length || 0);
    if (response.candidates?.[0]) {
      console.log('First candidate parts:', response.candidates[0].content?.parts?.length || 0);
    }

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

        const publicDir = path.join(process.cwd(), 'public', 'generated');
        if (!fs.existsSync(publicDir)) {
          fs.mkdirSync(publicDir, { recursive: true });
        }

        const filename = `generated-${Date.now()}.png`;
        const filepath = path.join(publicDir, filename);
        fs.writeFileSync(filepath, generatedBuffer);

        console.log(`Image saved to: ${filepath}`);
        console.log(`File size: ${generatedBuffer.length} bytes`);
        console.log('=== GENERATION SUCCESS ===');

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
