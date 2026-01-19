import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Header from "../components/Header";
import Footer from "../components/Footer";
import GalleryClient from "../components/GalleryClient";

interface Generation extends RowDataPacket {
  id: number;
  template_id: number;
  template_title: string;
  original_image_url: string;
  generated_image_url: string;
  xp_cost: number;
  is_outfit: boolean;
  created_at: Date;
}

async function getGenerations(userId: string) {
  const connection = await pool.getConnection();
  try {
    const [generations] = await connection.query<Generation[]>(
      `SELECT 
        id, 
        template_id, 
        template_title, 
        original_image_url, 
        generated_image_url, 
        xp_cost, 
        is_outfit, 
        created_at 
      FROM generations 
      WHERE user_id = ? 
      ORDER BY created_at DESC`,
      [userId]
    );
    return generations;
  } finally {
    connection.release();
  }
}

export default async function GalleryPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect("/auth/login");
  }

  const generations = await getGenerations(session.user.id);

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-zinc-900 to-black">
      <Header />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pt-24">
        {/* Header Section */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-3">
                Your Gallery
              </h1>
              <p className="text-gray-400 text-lg">
                {generations.length} {generations.length === 1 ? 'creation' : 'creations'} total
              </p>
            </div>
            
            {/* Stats Cards */}
            <div className="hidden sm:flex items-center gap-4">
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3 text-center">
                <div className="text-2xl font-bold text-yellow-400">{generations.length}</div>
                <div className="text-xs text-gray-400">Total Images</div>
              </div>
              <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl px-6 py-3 text-center">
                <div className="text-2xl font-bold text-blue-400">{generations.reduce((sum, g) => sum + g.xp_cost, 0)}</div>
                <div className="text-xs text-gray-400">XP Spent</div>
              </div>
            </div>
          </div>

          {/* Mobile Stats */}
          <div className="sm:hidden flex items-center gap-3 mb-6">
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold text-yellow-400">{generations.length}</div>
              <div className="text-xs text-gray-400">Images</div>
            </div>
            <div className="flex-1 bg-zinc-900/50 border border-zinc-800 rounded-lg px-4 py-2 text-center">
              <div className="text-xl font-bold text-blue-400">{generations.reduce((sum, g) => sum + g.xp_cost, 0)}</div>
              <div className="text-xs text-gray-400">XP Spent</div>
            </div>
          </div>
        </div>

        {/* Gallery Grid */}
        <GalleryClient generations={generations} />
      </div>

      <Footer />
    </div>
  );
}
