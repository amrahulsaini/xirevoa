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
    // Return user not found page instead of 404
    return (
      <div className="min-h-screen bg-black">
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        </div>

        <div className="relative z-10">
          <Header />
          <div className="h-16 sm:h-20"></div>
          
          <div className="container mx-auto px-4 sm:px-6 py-16 text-center">
            <div className="max-w-md mx-auto bg-gradient-to-br from-zinc-900/80 to-black/80 backdrop-blur-xl rounded-3xl border border-zinc-800 p-12">
              <div className="text-6xl mb-4">👤</div>
              <h1 className="text-3xl font-black text-white mb-2">User Not Found</h1>
              <p className="text-zinc-400 mb-6">
                The user <span className="text-purple-400 font-bold">@{username}</span> doesn't exist.
              </p>
              <a
                href="/"
                className="inline-block bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-all hover:scale-105"
              >
                Go to Homepage
              </a>
            </div>
          </div>

          <Footer />
        </div>
      </div>
    );
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
