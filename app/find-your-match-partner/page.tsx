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

async function getCompanionTemplates(): Promise<Category[]> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE id IN (90, 91) AND is_active = TRUE ORDER BY display_order ASC'
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
    console.error('Error fetching companion templates:', error);
    return [];
  }
}

async function getOtherCategories(): Promise<{hairstyles: Category[], ghibli: Category[], cinematic: Category[], outfits: Category[]}> {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE is_active = TRUE ORDER BY display_order ASC'
    );

    const templates = rows.map((row: TemplateRow) => ({
      id: row.id,
      title: row.title,
      slug: row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: row.description,
      image: row.image_url,
      tags: row.tags || '',
      comingSoon: row.coming_soon,
    }));

    return {
      hairstyles: templates.filter(t => [23, 24, 25, 26, 27].includes(t.id)),
      ghibli: templates.filter(t => [84, 86, 87, 88, 89].includes(t.id)),
      cinematic: templates.filter(t => [28, 16, 35, 36, 10].includes(t.id)),
      outfits: templates.filter(t => [43, 44, 45, 46, 47, 48, 49, 50].includes(t.id)),
    };
  } catch (error) {
    console.error('Error fetching other categories:', error);
    return { hairstyles: [], ghibli: [], cinematic: [], outfits: [] };
  }
}

export default async function FindYourMatchPartnerPage() {
  const templates = await getCompanionTemplates();
  const otherCategories = await getOtherCategories();

  return (
    <div className="min-h-screen bg-black">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -top-48 -left-48 animate-pulse" />
        <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl top-1/2 -right-48 animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute w-96 h-96 bg-pink-500/10 rounded-full blur-3xl -bottom-48 left-1/2 animate-pulse" style={{ animationDelay: '2s' }} />
      </div>

      <div className="relative z-10">
        <Header />
        <div className="h-16 sm:h-20"></div>

        {/* Hero Section */}
        <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full mb-4 shadow-lg shadow-pink-500/50">
              <span className="text-sm font-black text-white">💑 REALISTIC AI COMPANIONS 💑</span>
            </div>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black mb-4">
              <span className="bg-gradient-to-r from-pink-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Create Your Perfect AI Companion
              </span>
            </h1>
            <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
              Generate realistic AI companions tailored to your preferences with our advanced AI technology ❤️✨
            </p>
          </div>
          
          {/* Templates Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {templates.map((template) => (
              <a 
                key={template.id} 
                href={`/gen/${template.slug}`}
                className="group block"
              >
                <div className="relative overflow-hidden rounded-2xl border-2 border-pink-500/30 hover:border-pink-500 transition-all hover:shadow-xl hover:shadow-pink-500/30 hover:scale-105">
                  <div className="relative aspect-[3/4]">
                    <img 
                      src={template.image} 
                      alt={template.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-2xl font-bold group-hover:text-pink-400 transition-colors">
                      {template.title}
                    </h3>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* Other Categories */}
        {otherCategories.hairstyles.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">💇‍♂️ Try Different Hairstyles</h2>
              <p className="text-zinc-400">Explore our amazing hairstyle options</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {otherCategories.hairstyles.map((template) => (
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

        {otherCategories.ghibli.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">🌿 Studio Ghibli Magic</h2>
              <p className="text-zinc-400">Transform into magical Ghibli characters</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {otherCategories.ghibli.map((template) => (
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

        {otherCategories.cinematic.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">🎬 Cinematic Universe</h2>
              <p className="text-zinc-400">Step into epic cinematic worlds</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {otherCategories.cinematic.map((template) => (
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

        {otherCategories.outfits.length > 0 && (
          <section className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 border-t border-zinc-800">
            <div className="mb-6">
              <h2 className="text-2xl sm:text-3xl font-black text-white mb-2">👔 Iconic Outfits</h2>
              <p className="text-zinc-400">Try on legendary fashion styles</p>
            </div>
            <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
              {otherCategories.outfits.map((template) => (
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
