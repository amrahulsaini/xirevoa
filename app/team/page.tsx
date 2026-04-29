import Header from "../components/Header";
import Footer from "../components/Footer";
import Image from 'next/image';

export default function TeamPage() {
  const me = {
    name: 'Rahul Saini',
    role: 'Founder & Developer',
    bio: `I built Xirevoa using Next.js (App Router), TypeScript, MySQL, Redis, and various AI/image tools. I handled frontend, backend, and deployment.`,
    photo: 'https://media.licdn.com/dms/image/C5603AQE-placeholder',
    linkedin: 'https://www.linkedin.com/in/rahul-saini-27ba9b383/'
  };

  return (
    <div className="min-h-screen bg-black text-white">
      <Header />
      <div className="h-16 sm:h-20" />
      <main className="container mx-auto px-4 sm:px-6 py-12">
        <h1 className="text-3xl font-bold mb-4">Team</h1>
        <p className="text-zinc-400 mb-8">Meet the people behind Xirevoa.</p>

        <div className="max-w-3xl bg-zinc-900 border border-zinc-800 rounded-lg p-6 flex gap-6 items-center">
          <div className="w-28 h-28 rounded-full overflow-hidden bg-zinc-800 flex items-center justify-center">
            <Image src={me.photo} alt={me.name} width={112} height={112} className="object-cover" />
          </div>
          <div>
            <h2 className="text-xl font-bold">{me.name}</h2>
            <p className="text-zinc-400">{me.role}</p>
            <p className="mt-3 text-zinc-300">{me.bio}</p>
            <a href={me.linkedin} target="_blank" rel="noopener noreferrer" className="inline-block mt-4 text-yellow-400 font-bold">LinkedIn</a>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
