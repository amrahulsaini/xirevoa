import Header from "@/app/components/Header";
import Footer from "@/app/components/Footer";
import TemplateGenerator from "@/app/components/TemplateGenerator";
import TemplatesMasonry from "@/app/components/TemplatesMasonry";
import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import { notFound } from "next/navigation";

export const dynamic = 'force-dynamic';

interface TemplateData extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  ai_prompt: string | null;
  tags: string | null;
}

async function getTemplateBySlug(slug: string) {
  try {
    // List of outfit template IDs (includes jewelleries 62-70)
    const OUTFIT_TEMPLATE_IDS = [43, 44, 45, 46, 47, 48, 49, 50, 52, 53, 54, 55, 56, 57, 58, 59, 60, 62, 63, 64, 65, 66, 67, 68, 69, 70];
    
    // Check regular templates
    const [rows] = await pool.query<TemplateData[]>(
      'SELECT id, title, description, image_url, ai_prompt, tags FROM templates WHERE is_active = TRUE'
    );
    
    const template = rows.find(row => {
      const templateSlug = row.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
      return templateSlug === slug;
    });
    
    if (template) {
      return {
        id: template.id,
        title: template.title,
        description: template.description,
        image: template.image_url,
        aiPrompt: template.ai_prompt || '',
        tags: template.tags || '',
        isOutfit: OUTFIT_TEMPLATE_IDS.includes(template.id), // Check if this is an outfit template
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error fetching template:', error);
    return null;
  }
}

export default async function TemplatePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const template = await getTemplateBySlug(slug);

  if (!template) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-black overflow-x-hidden">
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

        {/* Template Generator Section */}
        <section className="w-full py-8">
          <div className="container mx-auto px-4 sm:px-6">
            <TemplateGenerator
              template={template}
              isOutfit={template.isOutfit}
              tags={template.tags}
            />
          </div>
        </section>

        {/* Under the generator: more templates (Pinterest style) */}
        <section className="w-full py-12">
          <div className="container mx-auto px-4 sm:px-6">
            <TemplatesMasonry currentTemplateId={template.id} tags={template.tags} />
          </div>
        </section>

        <Footer />
      </div>
    </div>
  );
}
