import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import pool from '@/lib/db';
import * as fs from 'fs';
import * as path from 'path';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'You must be logged in to upload a profile picture' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('profilePicture') as File;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 5MB limit' },
        { status: 400 }
      );
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Generate unique filename
    const fileExtension = path.extname(file.name);
    const filename = `${session.user.id}-${Date.now()}${fileExtension}`;
    const filepath = path.join(uploadsDir, filename);

    // Save file
    fs.writeFileSync(filepath, buffer);

    const profilePictureUrl = `/uploads/profiles/${filename}`;

    // Update database
    const connection = await pool.getConnection();
    try {
      // Delete old profile picture if it exists
      const [users]: any = await connection.query(
        'SELECT profile_picture FROM users WHERE id = ?',
        [session.user.id]
      );

      if (users.length > 0 && users[0].profile_picture) {
        const oldFilePath = path.join(process.cwd(), 'public', users[0].profile_picture);
        if (fs.existsSync(oldFilePath)) {
          fs.unlinkSync(oldFilePath);
        }
      }

      // Update with new profile picture
      await connection.query(
        'UPDATE users SET profile_picture = ? WHERE id = ?',
        [profilePictureUrl, session.user.id]
      );
    } finally {
      connection.release();
    }

    return NextResponse.json({
      success: true,
      profilePictureUrl,
      message: 'Profile picture updated successfully'
    });
  } catch (error) {
    console.error('Profile picture upload error:', error);
    return NextResponse.json(
      { error: 'Failed to upload profile picture' },
      { status: 500 }
    );
  }
}
