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

async function getGirlsHairstyleTemplates(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (39, 40, 41, 42) AND is_active = TRUE ORDER BY FIELD(id, 39, 40, 41, 42)'
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
    console.error('Error fetching girls hairstyle templates:', error);
    return [];
  }
}

async function getOtherCategories(): Promise<{hairstyles: Category[], jewelleries: Category[], eighties: Category[], cinematic: Category[], instagram: Category[]}> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (23, 24, 25, 26, 27, 62, 63, 64, 65, 66, 67, 33, 34, 28, 16, 35, 36, 10, 1, 8, 2, 9, 7) AND is_active = TRUE ORDER BY display_order ASC'
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
      jewelleries: allTemplates.filter(t => [62, 63, 64, 65, 66, 67].includes(t.id)),
      eighties: allTemplates.filter(t => [33, 34].includes(t.id)),
      cinematic: allTemplates.filter(t => [28, 16, 35, 36, 10].includes(t.id)),
      instagram: allTemplates.filter(t => [1, 8, 2, 9, 7].includes(t.id)),
    };
  } catch (error) {
    console.error('Error fetching other categories:', error);
    return { hairstyles: [], jewelleries: [], eighties: [], cinematic: [], instagram: [] };
  }
}

export default async function GirlsHairstylePage() {
  const girlsTemplates = await getGirlsHairstyleTemplates();
  const { hairstyles, jewelleries, eighties, cinematic, instagram } = await getOtherCategories();

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background with Pink/Purple theme */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse delay-1000" />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse delay-2000" />
      </div>

      {/* Content */}
      <div className="relative z-10">
        <Header />

        {/* Spacer for fixed header */}
        <div className="h-16 sm:h-20"></div>

        <section className="container mx-auto px-4 sm:px-6 pt-8 pb-4">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-block px-4 py-2 bg-gradient-to-r from-pink-500/20 to-purple-500/20 rounded-full mb-4 border border-pink-500/30">
              <span className="text-pink-300 text-sm font-semibold">✨ Exclusively for Girls</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white mb-4">
              💇‍♀️ <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Change Your Hairstyle</span>
            </h1>
            <p className="text-base sm:text-lg text-zinc-300 mb-2">
              Transform your look with stunning hairstyles while keeping your beautiful face resemblance
            </p>
            <p className="text-sm text-pink-300/80">
              🎨 Only background &amp; hairstyle changes • Your face stays perfectly you! 💖
            </p>
          </div>
        </section>

        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
            {girlsTemplates.map((template) => (
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

          {girlsTemplates.length === 0 && (
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

        {jewelleries.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">💎 Try Best Jewelleries</h2>
              <p className="text-zinc-400">Discover elegant necklaces, earrings & accessories that enhance your beauty</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {jewelleries.map((template) => (
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
