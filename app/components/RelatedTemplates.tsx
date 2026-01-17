import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import CategoryCard from "./CategoryCard";

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  description: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

async function getRelatedTemplates(currentTemplateId: number, tags: string) {
  try {
    const tagArray = tags.split(',').map(t => t.trim()).filter(t => t);
    
    if (tagArray.length === 0) {
      // If no tags, just get recent templates
      const [rows] = await pool.query<TemplateRow[]>(
        'SELECT id, title, description, image_url, tags, coming_soon FROM templates WHERE is_active = TRUE AND id != ? ORDER BY display_order ASC LIMIT 8',
        [currentTemplateId]
      );
      return rows;
    }
    
    // Build query to find templates with matching tags
    const likeConditions = tagArray.map(() => 'tags LIKE ?').join(' OR ');
    const likeParams = tagArray.map(tag => `%${tag}%`);
    
    const [rows] = await pool.query<TemplateRow[]>(
      `SELECT id, title, description, image_url, tags, coming_soon FROM templates 
       WHERE is_active = TRUE AND id != ? AND (${likeConditions}) 
       ORDER BY display_order ASC LIMIT 8`,
      [currentTemplateId, ...likeParams]
    );
    
    return rows;
  } catch (error) {
    console.error('Error fetching related templates:', error);
    return [];
  }
}

export default async function RelatedTemplates({
  currentTemplateId,
  tags,
}: {
  currentTemplateId: number;
  tags: string;
}) {
  const templates = await getRelatedTemplates(currentTemplateId, tags);

  if (templates.length === 0) {
    return null;
  }

  return (
    <div>
      <h2 className="text-2xl sm:text-3xl font-black text-white mb-6">
        Related Templates
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {templates.map((template) => {
          const slug = template.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
          return (
            <CategoryCard
              key={template.id}
              id={template.id}
              title={template.title}
              slug={slug}
              description={template.description}
              image={template.image_url}
              comingSoon={template.coming_soon}
            />
          );
        })}
      </div>
    </div>
  );
}
