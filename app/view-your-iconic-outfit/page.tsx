import pool from '@/lib/db';
import Header from '@/app/components/Header';
import Footer from '@/app/components/Footer';
import CategoryCard from '@/app/components/CategoryCard';

export const dynamic = 'force-dynamic';

// Fetch outfit templates
async function getOutfitTemplates() {
  const connection = await pool.getConnection();
  
  try {
    const [templates] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (43, 44, 45, 46, 47, 48, 49, 50) ORDER BY FIELD(id, 43, 44, 45, 46, 47, 48, 49, 50)'
    );
    
    return templates.map((t: any) => ({
      id: t.id,
      title: t.title,
      slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      description: t.description,
      image: t.image_url,
      comingSoon: false,
    }));
  } catch (error) {
    console.error('Error fetching outfit templates:', error);
    return [];
  } finally {
    connection.release();
  }
}

// Fetch other categories for "Explore More" section
async function getOtherCategories() {
  const connection = await pool.getConnection();
  
  try {
    // Fetch templates for other categories
    const [hairstyles] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (23, 24, 25, 26, 27) ORDER BY FIELD(id, 23, 24, 25, 26, 27) LIMIT 5'
    );
    
    const [eighties] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (33, 34) ORDER BY FIELD(id, 33, 34) LIMIT 5'
    );
    
    const [cinematic] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (28, 16, 35, 36, 10) ORDER BY FIELD(id, 28, 16, 35, 36, 10) LIMIT 5'
    );
    
    const [instagram] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (1, 8, 2, 9, 7) ORDER BY FIELD(id, 1, 8, 2, 9, 7) LIMIT 5'
    );
    
    const [girlsHairstyles] = await connection.query<any[]>(
      'SELECT * FROM templates WHERE id IN (39, 40, 41, 42) ORDER BY FIELD(id, 39, 40, 41, 42) LIMIT 5'
    );
    
    return {
      hairstyles: hairstyles.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: t.description,
        image: t.image_url,
        comingSoon: false,
      })),
      eighties: eighties.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: t.description,
        image: t.image_url,
        comingSoon: false,
      })),
      cinematic: cinematic.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: t.description,
        image: t.image_url,
        comingSoon: false,
      })),
      instagram: instagram.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: t.description,
        image: t.image_url,
        comingSoon: false,
      })),
      girlsHairstyles: girlsHairstyles.map((t: any) => ({
        id: t.id,
        title: t.title,
        slug: t.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
        description: t.description,
        image: t.image_url,
        comingSoon: false,
      })),
    };
  } catch (error) {
    console.error('Error fetching other categories:', error);
    return {
      hairstyles: [],
      eighties: [],
      cinematic: [],
      instagram: [],
      girlsHairstyles: [],
    };
  } finally {
    connection.release();
  }
}

export default async function ViewYourIconicOutfitPage() {
  const outfitTemplates = await getOutfitTemplates();
  const otherCategories = await getOtherCategories();

  return (
    <div className="min-h-screen bg-black">
      <Header />
      
      <div className="container mx-auto px-4 sm:px-6 py-8 sm:py-12 pt-32">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="inline-block relative mb-6 animate-pulse">
            <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full blur-xl opacity-50"></div>
            <div className="relative px-8 py-3 bg-gradient-to-r from-purple-500 via-pink-500 to-purple-500 rounded-full border-2 border-white/20 shadow-2xl">
              <span className="text-white text-base sm:text-lg font-black tracking-wide drop-shadow-lg">
                ✨ EXCLUSIVELY FOR GIRLS ✨
              </span>
            </div>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-purple-400 bg-clip-text text-transparent mb-4">
            View Your Iconic Outfit
          </h1>
          <p className="text-zinc-400 text-lg max-w-2xl mx-auto">
            Choose an iconic outfit, upload your photo, and see yourself wearing it! ✨
          </p>
        </div>

        {/* Instructions Section */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-2xl p-6 border border-purple-500/30">
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-2xl">👗</span>
              How It Works
            </h2>
            <div className="grid sm:grid-cols-3 gap-4 text-sm">
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                <div className="text-3xl mb-2">1️⃣</div>
                <div className="font-bold text-purple-300 mb-1">Choose Outfit</div>
                <div className="text-zinc-400">Select your favorite iconic outfit below</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-pink-500/20">
                <div className="text-3xl mb-2">2️⃣</div>
                <div className="font-bold text-pink-300 mb-1">Upload Photo</div>
                <div className="text-zinc-400">Upload a clear photo of your face</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4 border border-purple-500/20">
                <div className="text-3xl mb-2">3️⃣</div>
                <div className="font-bold text-purple-300 mb-1">See Result</div>
                <div className="text-zinc-400">AI will show you wearing that outfit!</div>
              </div>
            </div>
          </div>
        </div>

        {/* Outfit Templates Grid */}
        {outfitTemplates.length > 0 ? (
          <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4 mb-16">
            {outfitTemplates.map((template) => (
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
        ) : (
          <div className="text-center py-20">
            <div className="text-8xl mb-6">👗</div>
            <h2 className="text-2xl font-bold text-white mb-4">Outfit Templates Coming Soon!</h2>
            <p className="text-zinc-400 mb-8 max-w-md mx-auto">
              You need to add outfit template images to the database with IDs 43-47. 
              These should show iconic outfits on models/mannequins.
            </p>
            <div className="bg-purple-900/20 border border-purple-500/30 rounded-xl p-6 max-w-2xl mx-auto text-left">
              <h3 className="font-bold text-purple-300 mb-3 text-lg">📝 To Add Outfit Templates:</h3>
              <ol className="space-y-2 text-sm text-zinc-300 list-decimal list-inside">
                <li>Find or create images of iconic outfits (full body shots work best)</li>
                <li>Upload images to your image hosting service</li>
                <li>Add to database with IDs 43, 44, 45, 46, 47 with appropriate titles and descriptions</li>
                <li>Example titles: "Elegant Evening Gown", "Casual Street Style", "Business Professional", etc.</li>
              </ol>
            </div>
          </div>
        )}

        {/* Explore More Categories */}
        {(otherCategories.girlsHairstyles.length > 0 || 
          otherCategories.hairstyles.length > 0 || 
          otherCategories.eighties.length > 0 || 
          otherCategories.cinematic.length > 0 || 
          otherCategories.instagram.length > 0) && (
          <div className="border-t border-zinc-800 pt-16 mt-16">
            <h2 className="text-2xl sm:text-3xl font-black text-white mb-8">Explore More Transformations</h2>
            
            <div className="space-y-12">
              {/* Girls Hairstyles */}
              {otherCategories.girlsHairstyles.length > 0 && (
                <div>
                  <a href="/change-your-hairstyle-girls" className="inline-block group mb-6">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-400 to-purple-400 bg-clip-text text-transparent group-hover:from-pink-300 group-hover:to-purple-300 transition-all">
                      💖 Change Your Hairstyle →
                    </h3>
                  </a>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {otherCategories.girlsHairstyles.map((template) => (
                      <div key={template.id} className="break-inside-avoid">
                        <CategoryCard {...template} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Hairstyles */}
              {otherCategories.hairstyles.length > 0 && (
                <div>
                  <a href="/hairstyles" className="inline-block group mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      💇‍♂️ Try Different Hairstyles →
                    </h3>
                  </a>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {otherCategories.hairstyles.map((template) => (
                      <div key={template.id} className="break-inside-avoid">
                        <CategoryCard {...template} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 80s */}
              {otherCategories.eighties.length > 0 && (
                <div>
                  <a href="/how-would-you-see-yourself-in-80s" className="inline-block group mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      🕰️ See Yourself in Your 80s →
                    </h3>
                  </a>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {otherCategories.eighties.map((template) => (
                      <div key={template.id} className="break-inside-avoid">
                        <CategoryCard {...template} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Cinematic */}
              {otherCategories.cinematic.length > 0 && (
                <div>
                  <a href="/cinematic-universe" className="inline-block group mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      🎬 Cinematic Universe →
                    </h3>
                  </a>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {otherCategories.cinematic.map((template) => (
                      <div key={template.id} className="break-inside-avoid">
                        <CategoryCard {...template} />
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Instagram */}
              {otherCategories.instagram.length > 0 && (
                <div>
                  <a href="/instagram-collage" className="inline-block group mb-6">
                    <h3 className="text-xl font-bold text-white group-hover:text-yellow-400 transition-colors">
                      📸 Instagram Collage →
                    </h3>
                  </a>
                  <div className="columns-2 md:columns-3 lg:columns-4 xl:columns-5 gap-4 space-y-4">
                    {otherCategories.instagram.map((template) => (
                      <div key={template.id} className="break-inside-avoid">
                        <CategoryCard {...template} />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
