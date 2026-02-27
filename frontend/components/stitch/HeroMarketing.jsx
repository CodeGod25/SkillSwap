// from stitch-export: Landing page hero section (see 3.html)
import Link from 'next/link';
import Image from 'next/image';

export default function HeroMarketing() {
  return (
    <section className="relative px-6 py-12 lg:px-20 lg:py-24 overflow-hidden bg-accent-warm dark:bg-slate-900/20">
      <div className="absolute inset-0 hero-pattern pointer-events-none" />
      <div className="relative z-10 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        <div className="flex flex-col gap-8 lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-sm font-bold text-primary border border-primary/20 w-fit">
            <span className="material-symbols-outlined text-sm">location_on</span>
            <span>Active in 45 local neighborhoods</span>
          </div>
          
          <div className="flex flex-col gap-4">
            <h1 className="text-5xl lg:text-7xl font-black leading-[1.1] tracking-tight text-slate-900 dark:text-white">
              Trade Time. <br />
              <span className="text-primary">Build Community.</span>
            </h1>
            <p className="text-lg lg:text-xl font-medium text-slate-600 dark:text-slate-300 max-w-lg leading-relaxed">
              1 hour of help = 1 time credit. Exchange your skills with neighbors and strengthen your local community through shared effort.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4">
            <Link href="/signup" className="flex h-14 items-center justify-center rounded-xl bg-primary px-8 text-lg font-bold text-background-dark shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform">
              <span>Join Your Community</span>
            </Link>
            <Link href="/demo" className="flex h-14 items-center justify-center rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-8 text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-all">
              <span>See How It Works</span>
            </Link>
          </div>
        </div>
        
        <div className="lg:w-1/2 w-full">
          <div className="relative aspect-square rounded-[2rem] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800">
            {/* Hero image - happy community members socializing */}
            <Image
              src="/4dollas.jpg"
              alt="Happy community members socializing and trading skills"
              fill
              className="object-cover"
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            {/* Overlay gradient for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            <div className="absolute bottom-6 left-6 right-6 p-4 bg-white/90 backdrop-blur-md rounded-2xl flex items-center gap-4 shadow-xl">
              <div className="flex -space-x-3 overflow-hidden">
                {[
                  { color: 'bg-green-500', icon: 'person' },
                  { color: 'bg-blue-500', icon: 'person' },
                  { color: 'bg-purple-500', icon: 'person' },
                  { color: 'bg-orange-500', icon: 'person' },
                ].map((user, i) => (
                  <div
                    key={i}
                    className={`inline-block h-10 w-10 rounded-full ring-2 ring-white ${user.color} flex items-center justify-center`}
                  >
                    <span className="material-symbols-outlined text-white text-sm">
                      {user.icon}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-sm font-bold text-slate-800">
                Sarah just earned <span className="text-primary">2 credits</span> for gardening!
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
