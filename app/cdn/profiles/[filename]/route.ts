import { NextRequest, NextResponse } from 'next/server';
import * as fs from 'fs';
import * as path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string }> }
) {
  try {
    const { filename } = await params;
    const filepath = path.join(process.cwd(), 'public', 'cdn', 'profiles', filename);

    console.log('Profile picture request - filename:', filename);
    console.log('Profile picture file path:', filepath);
    console.log('File exists:', fs.existsSync(filepath));

    // Check if file exists
    if (!fs.existsSync(filepath)) {
      console.error('Profile picture not found:', filepath);
      return NextResponse.json(
        { error: 'Profile picture not found' },
        { status: 404 }
      );
    }

    // Read the file
    const imageBuffer = fs.readFileSync(filepath);
    
    console.log('Profile picture loaded successfully, size:', imageBuffer.length, 'bytes');
    
    // Determine content type from extension
    const ext = path.extname(filename).toLowerCase();
    const contentTypeMap: { [key: string]: string } = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
    };
    const contentType = contentTypeMap[ext] || 'image/jpeg';

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error: any) {
    console.error('Error serving profile picture:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to serve profile picture' },
      { status: 500 }
    );
  }
}
