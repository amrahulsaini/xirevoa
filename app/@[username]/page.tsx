import { notFound } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import ProfileClient from '@/app/components/ProfileClient';
import pool from '@/lib/db';
import { RowDataPacket } from 'mysql2';

export const dynamic = 'force-dynamic';

interface UserData extends RowDataPacket {
  id: string;
  username: string;
  email: string;
  xpoints: number;
  profile_picture: string | null;
  created_at: Date;
}

interface GenerationStats extends RowDataPacket {
  total_generations: number;
}

async function getUserByUsername(username: string) {
  try {
    const [users] = await pool.query<UserData[]>(
      'SELECT id, username, email, xpoints, profile_picture, created_at FROM users WHERE username = ?',
      [username]
    );

    if (users.length === 0) {
      return null;
    }

    const user = users[0];

    // Get generation count
    const [stats] = await pool.query<GenerationStats[]>(
      'SELECT COUNT(*) as total_generations FROM generations WHERE user_id = ?',
      [user.id]
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      xpoints: user.xpoints,
      profilePicture: user.profile_picture,
      createdAt: user.created_at,
      totalGenerations: stats[0]?.total_generations || 0,
    };
  } catch (error) {
    console.error('Error fetching user:', error);
    return null;
  }
}

export default async function ProfilePage({ params }: { params: { username: string } }) {
  const session = await getServerSession(authOptions);
  const username = params.username;

  const userData = await getUserByUsername(username);

  if (!userData) {
    notFound();
  }

  const isOwnProfile = session?.user?.username === username;

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />
        
        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        <ProfileClient 
          user={userData}
          isOwnProfile={isOwnProfile}
        />

        <Footer />
      </div>
    </div>
  );
}
