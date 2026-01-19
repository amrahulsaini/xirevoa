import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import SettingsClient from "./SettingsClient";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

interface ModelRow extends RowDataPacket {
  id: number;
  model_id: string;
  model_name: string;
  model_type: string;
  description: string;
  xp_cost: number;
  max_resolution: string;
  supports_thinking: boolean;
  is_active: boolean;
}

interface UserSettingsRow extends RowDataPacket {
  preferred_model: string;
  preferred_resolution: string;
  preferred_aspect_ratio: string;
}

async function getUserSettings(userId: number) {
  try {
    // Get user settings
    const [settingsRows] = await pool.query<UserSettingsRow[]>(
      'SELECT preferred_model, preferred_resolution, preferred_aspect_ratio FROM user_settings WHERE user_id = ?',
      [userId]
    );

    // If no settings exist, create default settings
    if (settingsRows.length === 0) {
      await pool.query(
        'INSERT INTO user_settings (user_id, preferred_model, preferred_resolution, preferred_aspect_ratio) VALUES (?, ?, ?, ?)',
        [userId, 'gemini-2.5-flash-image', '1K', '1:1']
      );
      return {
        preferred_model: 'gemini-2.5-flash-image',
        preferred_resolution: '1K',
        preferred_aspect_ratio: '1:1'
      };
    }

    return settingsRows[0];
  } catch (error) {
    console.error('Error fetching user settings:', error);
    return {
      preferred_model: 'gemini-2.5-flash-image',
      preferred_resolution: '1K',
      preferred_aspect_ratio: '1:1'
    };
  }
}

async function getModels() {
  try {
    const [rows] = await pool.query<ModelRow[]>(
      'SELECT * FROM ai_models ORDER BY display_order ASC'
    );
    return rows;
  } catch (error) {
    console.error('Error fetching models:', error);
    return [];
  }
}

export default async function SettingsPage() {
  const session = await getServerSession(authOptions);

  if (!session || !session.user) {
    redirect('/auth/login');
  }

  const userId = session.user.id;
  const userSettings = await getUserSettings(userId);
  const models = await getModels();

  return (
    <div className="min-h-screen bg-black">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      <div className="relative z-10">
        <Header />
        <div className="h-16 sm:h-20"></div>

        <div className="container mx-auto px-4 sm:px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <h1 className="text-3xl sm:text-4xl font-black text-white mb-2">Settings</h1>
            <p className="text-zinc-400 mb-8">Manage your AI image generation preferences</p>

            <SettingsClient 
              initialSettings={userSettings}
              models={models}
              userXP={(session.user as any).xpoints || 0}
            />
          </div>
        </div>

        <Footer />
      </div>
    </div>
  );
}
