import pool from "@/lib/db";
import { RowDataPacket } from "mysql2";
import Image from "next/image";
import Link from "next/link";

interface TemplateRow extends RowDataPacket {
  id: number;
  title: string;
  image_url: string;
  tags: string | null;
  coming_soon: boolean;
}

async function getTemplates(currentTemplateId: number) {
  try {
    const [rows] = await pool.query<TemplateRow[]>(
      "SELECT id, title, image_url, tags, coming_soon FROM templates WHERE is_active = TRUE AND id != ? ORDER BY display_order ASC",
      [currentTemplateId]
    );
    return rows;
  } catch (error) {
    console.error("Error fetching templates:", error);
    return [] as TemplateRow[];
  }
}

export default async function TemplatesMasonry({
  currentTemplateId,
  tags,
}: {
  currentTemplateId: number;
  tags?: string;
}) {
  const rows = await getTemplates(currentTemplateId);

  const tagArray = (tags || "")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);

  const templates = tagArray.length
    ? (() => {
        const related: TemplateRow[] = [];
        const others: TemplateRow[] = [];
        for (const row of rows) {
          const hasMatch = tagArray.some((tag) =>
            (row.tags || "").toLowerCase().includes(tag.toLowerCase())
          );
          if (hasMatch) related.push(row);
          else others.push(row);
        }
        return [...related, ...others];
      })()
    : rows;

  if (templates.length === 0) return null;

  return (
    <div className="w-full">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-bold text-white">More templates</h2>
      </div>

      <div className="columns-2 md:columns-3 xl:columns-4 2xl:columns-5 gap-4 [column-fill:_balance]">
        {templates.map((template) => {
          const slug = template.title
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/(^-|-$)/g, "");

          return (
            <div key={template.id} className="mb-4 break-inside-avoid">
              {template.coming_soon ? (
                <div className="block rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900 opacity-80 cursor-not-allowed">
                  <div className="relative w-full">
                    <Image
                      src={template.image_url}
                      alt={template.title}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    />
                    <div className="absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold bg-yellow-500 text-black">
                      SOON
                    </div>
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {template.title}
                    </p>
                  </div>
                </div>
              ) : (
                <Link
                  href={`/${slug}`}
                  className="block rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900"
                >
                  <div className="relative w-full">
                    <Image
                      src={template.image_url}
                      alt={template.title}
                      width={600}
                      height={800}
                      className="w-full h-auto object-cover"
                      sizes="(max-width: 768px) 50vw, (max-width: 1280px) 33vw, 20vw"
                    />
                  </div>
                  <div className="p-3">
                    <p className="text-sm font-semibold text-white line-clamp-2">
                      {template.title}
                    </p>
                  </div>
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
