import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenAI, createPartFromUri, createUserContent } from '@google/genai';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  ai_prompt: string | null;
  image_url: string;
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to generate images' },
        { status: 401 }
      );
    }

    // Get user's preferred model and check XP balance
    const userId = session.user.id;
    
    // Get form data first
    const formData = await request.formData();
    const image = formData.get('image') as File;
    const templateId = formData.get('templateId') as string;
    const isOutfit = formData.get('isOutfit') === 'true';
    const selectedModel = formData.get('selectedModel') as string | null;
    const customPrompt = formData.get('customPrompt') as string | null;
    
    const connection = await pool.getConnection();
    
    let preferredModel = 'gemini-2.0-flash-exp';
    let XP_COST = 3;
    let modelName = 'Gemini 2.0 Flash';
    
    try {
      // Get user settings and XP in one query
      const [users] = await connection.query<RowDataPacket[]>(
        'SELECT xpoints FROM users WHERE id = ?',
        [userId]
      );

      if (users.length === 0) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Use selectedModel from form, or fall back to user's preferred model
      if (selectedModel) {
        preferredModel = selectedModel;
      } else {
        const [settingsRows] = await connection.query<RowDataPacket[]>(
          'SELECT preferred_model FROM user_settings WHERE user_id = ?',
          [userId]
        );
        preferredModel = settingsRows.length > 0 ? settingsRows[0].preferred_model : 'gemini-2.0-flash-exp';
      }

      // Get model XP cost
      const [modelRows] = await connection.query<RowDataPacket[]>(
        'SELECT xp_cost, model_name, is_active FROM ai_models WHERE model_id = ?',
        [preferredModel]
      );

      if (modelRows.length === 0 || !modelRows[0].is_active) {
        return NextResponse.json(
          { error: 'Selected model is not available' },
          { status: 400 }
        );
      }

      const currentXP = users[0].xpoints;
      XP_COST = modelRows[0].xp_cost;
      modelName = modelRows[0].model_name;

      if (currentXP < XP_COST) {
        return NextResponse.json(
          { error: `Insufficient XPoints. You need ${XP_COST} XP but only have ${currentXP} XP.` },
          { status: 403 }
        );
      }

      // Deduct XP
      await connection.query(
        'UPDATE users SET xpoints = xpoints - ? WHERE id = ?',
        [XP_COST, userId]
      );

      console.log(`Deducted ${XP_COST} XP from user ${userId} for ${modelName}. New balance: ${currentXP - XP_COST}`);
    } finally {
      connection.release();
    }

    console.log('=== GENERATE REQUEST START ===');
    console.log('Template ID:', templateId);
    console.log('Is Outfit:', isOutfit);
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
      // Use custom prompt if provided, otherwise use database prompt
      aiPrompt = customPrompt || template.ai_prompt || 'Create a photorealistic image showing the person from the first image wearing similar clothing and styling as shown in the second reference image. Match skin tones and lighting naturally.';
      templateImagePath = rows[0].image_url;
      
      console.log('Using outfit template:', template.title);
      console.log('Template image URL:', templateImagePath);
      console.log('AI Prompt from database:', template.ai_prompt);
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
      // Use custom prompt if provided, otherwise use database prompt
      aiPrompt = customPrompt || template.ai_prompt || 'Generate an AI-enhanced image';
      
      console.log('Using regular template:', template.title);
      console.log('AI Prompt from database:', template.ai_prompt);
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
        
        // For face swap: Simple structure - prompt then both images
        contentParts.push(
          { text: aiPrompt },
          {
            inlineData: {
              mimeType: image.type,
              data: base64Image,
            },
          },
          {
            inlineData: {
              mimeType: 'image/jpeg',
              data: templateBase64,
            },
          }
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
    console.log('Model:', preferredModel);
    console.log('Model Name:', modelName);
    console.log('XP Cost:', XP_COST);
    console.log('Is Outfit Mode:', isOutfit);
    console.log('Number of content parts:', contentParts.length);
    console.log('Number of images:', contentParts.filter((p: any) => p.inlineData).length);

    const response = await ai.models.generateContent({
      model: preferredModel,
      contents: createUserContent(contentParts),
    });

    console.log('=== GEMINI RESPONSE RECEIVED ===');
    console.log('Candidates count:', response.candidates?.length || 0);
    if (response.candidates?.[0]) {
      console.log('First candidate parts:', response.candidates[0].content?.parts?.length || 0);
      console.log('Full candidate:', JSON.stringify(response.candidates[0], null, 2));
    }

    if (!response.candidates || response.candidates.length === 0) {
      console.error('No candidates in response');
      return NextResponse.json(
        { error: 'No response from AI model' },
        { status: 500 }
      );
    }

    const candidate = response.candidates[0];
    
    // Check if there's a finishReason indicating why generation stopped
    if (candidate.finishReason && candidate.finishReason !== 'STOP') {
      console.error('Generation stopped with reason:', candidate.finishReason);
      console.error('Safety ratings:', JSON.stringify(candidate.safetyRatings, null, 2));
      return NextResponse.json(
        { error: `Generation blocked: ${candidate.finishReason}. The content may have been flagged by safety filters.` },
        { status: 500 }
      );
    }
    
    if (!candidate.content || !candidate.content.parts || candidate.content.parts.length === 0) {
      console.error('No content parts in response');
      console.error('Candidate content:', JSON.stringify(candidate.content, null, 2));
      return NextResponse.json(
        { error: 'Invalid response structure from AI model. Check server logs for details.' },
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

        const generatedImageUrl = `/api/generated/${filename}`;

        console.log(`Image saved to: ${filepath}`);
        console.log(`File size: ${generatedBuffer.length} bytes`);

        // Save the user's original uploaded image too
        const originalFilename = `original-${Date.now()}.${image.type.split('/')[1] || 'jpg'}`;
        const originalFilepath = path.join(publicDir, originalFilename);
        fs.writeFileSync(originalFilepath, buffer);
        const originalImageUrl = `/api/generated/${originalFilename}`;
        console.log(`Original image saved to: ${originalFilepath}`);

        // Save generation record to database
        let generationId: number | null = null;
        const saveConnection = await pool.getConnection();
        try {
          // Get template title
          const [templates] = await saveConnection.query<Template[]>(
            'SELECT title FROM templates WHERE id = ?',
            [templateId]
          );
          
          const templateTitle = templates.length > 0 ? templates[0].title : 'Unknown Template';

          // Save generation record with actual original image URL
          const [insertResult]: any = await saveConnection.query(
            `INSERT INTO generations 
            (user_id, template_id, template_title, original_image_url, generated_image_url, xp_cost, is_outfit, prompt_used, model_used) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [userId, templateId, templateTitle, originalImageUrl, generatedImageUrl, XP_COST, isOutfit, aiPrompt, modelName]
          );

          generationId = insertResult.insertId;
          console.log('Generation record saved to database with ID:', generationId);
        } catch (dbError) {
          console.error('Failed to save generation record:', dbError);
          // Don't fail the request if DB save fails
        } finally {
          saveConnection.release();
        }

        console.log('=== GENERATION SUCCESS ===');

        return NextResponse.json({
          success: true,
          imageUrl: generatedImageUrl,
          modelUsed: modelName,
          generationId: generationId,
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
