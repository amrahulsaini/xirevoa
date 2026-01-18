import CategoryCard from "../components/CategoryCard";
import Header from "../components/Header";
import Footer from "../components/Footer";
import AutoScrollBanner from "@/app/components/AutoScrollBanner";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";

export const dynamic = 'force-dynamic';

interface Template extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

interface Category {
  id: number;
  title: string;
  slug: string;
  description: string;
  image: string;
  tags: string;
  comingSoon?: boolean;
}

async function getEightyTemplates() {
  try {
    const [rows] = await pool.query<Template[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (33, 34) AND is_active = TRUE ORDER BY display_order ASC'
    );
    
    return rows.map((row) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      comingSoon: row.coming_soon,
    }));
  } catch (error) {
    console.error('Error fetching 80s templates:', error);
    return [];
  }
}

async function getOtherCategories(): Promise<{hairstyles: Category[], cinematic: Category[], instagram: Category[]}> {
  try {
    const [rows] = await pool.query<Template[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (23, 24, 25, 26, 27, 28, 16, 35, 36, 10, 1, 8, 2, 9, 7) AND is_active = TRUE ORDER BY display_order ASC'
    );
    
    const allTemplates = rows.map((row: Template) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      tags: row.tags || '',
      comingSoon: row.coming_soon,
    }));
    
    return {
      hairstyles: allTemplates.filter(t => [23, 24, 25, 26, 27].includes(t.id)),
      cinematic: allTemplates.filter(t => [28, 16, 35, 36, 10].includes(t.id)),
      instagram: allTemplates.filter(t => [1, 8, 2, 9, 7].includes(t.id)),
    };
  } catch (error) {
    console.error('Error fetching other categories:', error);
    return { hairstyles: [], cinematic: [], instagram: [] };
  }
}

export default async function EightyPage() {
  const templates = await getEightyTemplates();
  const { hairstyles, cinematic, instagram } = await getOtherCategories();

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
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              🕰️ See Yourself in Your 80s
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Transform yourself and see how you'll look in your future
            </p>
          </div>
          
          {/* Templates Grid */}
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
            {templates.map((template) => (
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

          {templates.length === 0 && (
            <div className="text-center py-20">
              <p className="text-zinc-400 text-lg">No templates available yet</p>
            </div>
          )}
        </section>

        {/* Other Categories */}
        {hairstyles.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">Choose Your Favourite Hairstyle</h2>
              <p className="text-zinc-400">Explore our amazing hairstyle options</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {hairstyles.map((template) => (
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
          </section>
        )}

        {cinematic.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">🎬 Cinematic Universe</h2>
              <p className="text-zinc-400">Epic movie scenes & iconic moments</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {cinematic.map((template) => (
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
          </section>
        )}

        {instagram.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">📸 Instagram Collage Stories</h2>
              <p className="text-zinc-400">Perfect layouts for social media</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {instagram.map((template) => (
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
          </section>
        )}

        <Footer />
      </div>
    </div>
  );
}
