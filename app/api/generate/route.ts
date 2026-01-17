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
              data: outfitBase64,
            },
          },
          { text: `Now generate ONE final merged image where the face from the FIRST image is seamlessly placed onto the body in the SECOND image. Match skin tone, lighting, and shadows perfectly. Make it look like a natural single photograph.` }
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

    // Convert uploaded image to base64
    console.log('Sending request to Gemini');
    console.log('Number of images:', contentParts.filter(p => p.inlineData).length);
    

    // Build multi-part contents (uses the same pattern you shared: upload + createPartFromUri + inlineData)
    let contents: any;

    if (isOutfit && outfitImagePath) {
      // Outfit mode: we upload the outfit template image and attach the user's face as inline data.
      // This makes the ordering/meaning unambiguous.
      const outfitDiskPath = path.join(
        process.cwd(),
        'public',
        outfitImagePath
          .replace('/api/cdn/', 'cdn/')
          .replace('/api/generated/', 'generated/')
      );

      let uploadedOutfit: { uri: string; mimeType: string } | null = null;
      try {
        const ext = path.extname(outfitDiskPath).toLowerCase();
        const mimeType =
          ext === '.png'
            ? 'image/png'
            : ext === '.webp'
              ? 'image/webp'
              : 'image/jpeg';

        const uploadedFile = await ai.files.upload({
          file: outfitDiskPath,
          config: { mimeType },
        });

        uploadedOutfit = { uri: uploadedFile.uri, mimeType: uploadedFile.mimeType };
      } catch (error) {
        console.error('Error uploading outfit image to GenAI Files API:', error);
      }

      // If upload failed, fall back to inline for outfit image.
      if (!uploadedOutfit) {
        const outfitBuf = fs.readFileSync(outfitDiskPath);
        const outfitBase64 = outfitBuf.toString('base64');
        contents = createUserContent([
          'FIRST IMAGE (User): face photo (use this face).',
          { inlineData: { mimeType: image.type, data: base64Image } },
          'SECOND IMAGE (Template): outfit/body reference (keep this outfit, pose, background).',
          { inlineData: { mimeType: 'image/jpeg', data: outfitBase64 } },
          `INSTRUCTION: ${aiPrompt}`,
        ]);
      } else {
        contents = createUserContent([
          'FIRST IMAGE (User): face photo (use this face).',
          { inlineData: { mimeType: image.type, data: base64Image } },
          'SECOND IMAGE (Template): outfit/body reference (keep this outfit, pose, background).',
          createPartFromUri(uploadedOutfit.uri, uploadedOutfit.mimeType),
          `INSTRUCTION: ${aiPrompt}`,
        ]);
      }

      console.log('Outfit mode: sending 2 images (user + outfit)');
    } else {
      // Regular templates: single user image + prompt
      contents = createUserContent([
        aiPrompt,
        { inlineData: { mimeType: image.type, data: base64Image } },
      ]);
    }

    // Generate image with Google GenAI
    console.log('Sending request to Gemini');

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents,
    });
