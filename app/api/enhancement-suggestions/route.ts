import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI({});

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { imageUrl } = await request.json();

    if (!imageUrl) {
      return NextResponse.json({ error: 'Missing imageUrl' }, { status: 400 });
    }

    // Fetch the image and convert to base64
    let base64Image: string;
    let mimeType = 'image/png';

    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await fetch(imageUrl);
      const arrayBuffer = await response.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      base64Image = buffer.toString('base64');
      mimeType = response.headers.get('content-type') || 'image/png';
    } else {
      // Local file path
      const fs = require('fs').promises;
      const path = require('path');
      const filepath = path.join(process.cwd(), 'public', imageUrl);
      const imageBuffer = await fs.readFile(filepath);
      base64Image = imageBuffer.toString('base64');
    }

    const contents = [
      {
        inlineData: {
          mimeType: mimeType,
          data: base64Image,
        },
      },
      { 
        text: "You are an expert image editor. Analyze this generated image and suggest 3-4 specific, creative ways the user could enhance or refine it. Each suggestion should be a single concise sentence (10-15 words) that describes a clear visual improvement. Focus on: lighting changes, style modifications, background alterations, color adjustments, or artistic enhancements. Return ONLY a JSON array of strings, nothing else. Example: [\"Add dramatic sunset lighting with warm orange tones\", \"Change background to futuristic cityscape at night\", \"Make colors more vibrant and saturated\", \"Add soft bokeh blur to the background\"]" 
      },
    ];

    const response = await genAI.models.generateContent({
      model: "gemini-2.0-flash-exp",
      contents: contents,
    });

    const textResponse = response.text || '';
    
    // Parse the JSON response
    let suggestions: string[] = [];
    try {
      // Remove markdown code blocks if present
      const cleanText = textResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      suggestions = JSON.parse(cleanText);
      
      // Ensure we have 3-4 suggestions
      if (Array.isArray(suggestions)) {
        suggestions = suggestions.slice(0, 4);
      }
    } catch (parseError) {
      console.error('Failed to parse suggestions:', parseError);
      // Fallback suggestions
      suggestions = [
        "Add cinematic lighting with dramatic shadows",
        "Enhance colors for a more vibrant look",
        "Change background to match the theme better",
        "Apply artistic filter for unique style"
      ];
    }

    return NextResponse.json({ suggestions });

  } catch (error: any) {
    console.error('Error generating suggestions:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to generate suggestions' 
    }, { status: 500 });
  }
}
