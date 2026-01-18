import CategoryCard from "@/app/components/CategoryCard";
import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string;
  comingSoon?: boolean;
}

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

async function getCinematicTemplates(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (28, 16, 35, 36, 10) AND is_active = TRUE ORDER BY FIELD(id, 28, 16, 35, 36, 10)'
    );
    
    return rows.map((row: TemplateRow) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      tags: row.tags || '',
      comingSoon: row.coming_soon,
    }));
  } catch (error) {
    console.error('Error fetching cinematic templates:', error);
    return [];
  }
}

export default async function CinematicUniversePage() {
  const cinematicTemplates = await getCinematicTemplates();

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              🎬 <span className="text-yellow-400">Cinematic Universe</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400">
              Step into epic movie scenes and iconic cinematic moments. Transform yourself into legendary characters from the big screen.
            </p>
          </div>
        </section>

        {/* Templates Grid */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
            {cinematicTemplates.map((template) => (
              <div key={template.id} className="break-inside-avoid">
                <CategoryCard
                  id={template.id}
                  title={template.title}
                  slug={template.slug}
                  description={template.description}
                  image={template.image}
                  comingSoon={template.comingSoon}
                />
              </div>
            ))}
          </div>

          {cinematicTemplates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-lg">No templates available yet</p>
            </div>
          )}
        </section>

        <Footer />
      </div>
    </div>
  );
}
