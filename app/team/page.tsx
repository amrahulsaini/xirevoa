import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from "next/image";

export default function TeamPage() {
  const me = {
    name: "Rahul Saini",
    role: "Founder & Developer",
    bio: "I built Xirevoa end to end and handled the product direction, frontend, backend, and deployment. The stack includes Next.js App Router, TypeScript, MySQL, Redis, Tailwind CSS, and AI/image generation workflows. I also focused on shipping a clean UI, practical performance, and reusable templates for users.",
    photo: "/1769863581643.jpg",
    linkedin: "https://www.linkedin.com/in/rahul-saini-27ba9b383/",
  };

  const technologies = [
    "Next.js",
    "React",
    "TypeScript",
    "Tailwind CSS",
    "MySQL",
    "Redis",
    "Node.js",
    "AI image APIs",
    "VPS / deployment tooling",
  ];

  const responsibilities = [
    "Built the frontend pages, reusable sections, and visual layout system.",
    "Implemented backend data flow, authentication, and template rendering logic.",
    "Managed deployment, product structure, and the overall user experience.",
  ];

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="h-16 sm:h-20" />

      <main className="container mx-auto px-4 sm:px-6 py-12">
        <div className="max-w-4xl mb-10">
          <p className="text-yellow-400 uppercase tracking-[0.3em] text-xs font-semibold mb-3">Team</p>
          <h1 className="text-3xl sm:text-5xl font-black mb-4">About me</h1>
          <p className="text-zinc-400 text-base sm:text-lg leading-7">
            Xirevoa is a solo-built product, so this page is focused on the founder, the work, and the technologies behind it.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-[320px_1fr] items-start max-w-5xl">
          <div className="rounded-3xl border border-zinc-800 bg-zinc-950/70 p-5 shadow-xl shadow-black/20">
            <div className="relative aspect-square overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900">
              <Image src={me.photo} alt={me.name} fill className="object-cover" priority unoptimized />
            </div>
            <div className="mt-5">
              <h2 className="text-2xl font-bold">{me.name}</h2>
              <p className="text-zinc-400 mt-1">{me.role}</p>
              <a
                href={me.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex mt-4 text-yellow-400 font-semibold hover:text-yellow-300 transition-colors"
              >
                LinkedIn Profile
              </a>
            </div>
          </div>

          <div className="space-y-6 rounded-3xl border border-zinc-800 bg-zinc-950/70 p-6 shadow-xl shadow-black/20">
            <section>
              <h3 className="text-lg font-bold mb-3">About me</h3>
              <p className="text-zinc-300 leading-7">{me.bio}</p>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">Technologies used</h3>
              <div className="flex flex-wrap gap-2">
                {technologies.map((tech) => (
                  <span key={tech} className="rounded-full border border-zinc-700 bg-zinc-900 px-3 py-1 text-sm text-zinc-300">
                    {tech}
                  </span>
                ))}
              </div>
            </section>

            <section>
              <h3 className="text-lg font-bold mb-3">What I handled</h3>
              <ul className="space-y-2 text-zinc-300 leading-7">
                {responsibilities.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
