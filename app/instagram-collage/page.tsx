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

async function getInstagramTemplates(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (1, 8, 2, 9, 7) AND is_active = TRUE ORDER BY FIELD(id, 1, 8, 2, 9, 7)'
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
    console.error('Error fetching instagram templates:', error);
    return [];
  }
}

async function getOtherCategories(): Promise<{hairstyles: Category[], eighties: Category[], cinematic: Category[]}> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (23, 24, 25, 26, 27, 33, 34, 28, 16, 35, 36, 10) AND is_active = TRUE ORDER BY display_order ASC'
    );
    
    const allTemplates = rows.map((row: TemplateRow) => ({
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
      eighties: allTemplates.filter(t => [33, 34].includes(t.id)),
      cinematic: allTemplates.filter(t => [28, 16, 35, 36, 10].includes(t.id)),
    };
  } catch (error) {
    console.error('Error fetching other categories:', error);
    return { hairstyles: [], eighties: [], cinematic: [] };
  }
}

export default async function InstagramCollagePage() {
  const instagramTemplates = await getInstagramTemplates();
  const { hairstyles, eighties, cinematic } = await getOtherCategories();

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

        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="max-w-3xl">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              📸 <span className="text-yellow-400">Instagram Collage Stories</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-400">
              Create stunning collage layouts perfect for Instagram stories and social media posts. Multiple photo styles in one frame!
            </p>
          </div>
      
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-3 space-y-3">
            {instagramTemplates.map((template) => (
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

          {instagramTemplates.length === 0 && (
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

        {eighties.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">See How You'd Look in Your 80s</h2>
              <p className="text-zinc-400">Transform into your future self</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {eighties.map((template) => (
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

        <Footer />
      </div>
    </div>
  );
}
