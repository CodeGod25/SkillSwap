// Landing page with hero marketing section
import { useState, useEffect } from 'react';
import Head from 'next/head';
import TopNav from '../components/stitch/TopNav';
import HeroMarketing from '../components/stitch/HeroMarketing';
import api from '../lib/api';

export default function Home() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const checkAuth = async () => {
      try {
        const token = api.getToken();
        if (token) {
          const userData = await api.getMe();
          setUser(userData);
        }
      } catch (error) {
        // User not logged in, that's fine
      }
    };
    checkAuth();
  }, []);

  return (
    <>
      <Head>
        <title>SkillSwap - Trade Time, Build Community</title>
        <meta name="description" content="Exchange skills with neighbors and strengthen your local community" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="relative flex min-h-screen flex-col bg-background-light dark:bg-background-dark">
        <TopNav user={user} />
        
        <main className="flex-1">
          <HeroMarketing />
          
          {/* How it Works section */}
          <section className="px-6 py-20 lg:px-20 max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl lg:text-4xl font-bold mb-4">How SkillSwap Works</h2>
              <p className="text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
                Our platform makes it easy to give and receive help within your neighborhood without using money.
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: 'map',
                  title: 'Find Neighbors',
                  desc: 'Discover skilled people in your area using our interactive map. See their ratings, verified skills, and availability in real-time.',
                  color: 'bg-green-100 dark:bg-green-900/20 text-green-600',
                },
                {
                  icon: 'swap_horiz',
                  title: 'Exchange Skills',
                  desc: 'Trade services directly with neighbors or use time credits. 1 hour = 1 credit. Everyone\'s time is valued equally, fostering community.',
                  color: 'bg-blue-100 dark:bg-blue-900/20 text-blue-600',
                },
                {
                  icon: 'workspace_premium',
                  title: 'Verified Skills',
                  desc: 'Build trust through our skill verification system. Self-verify your experience and see others\' verified credentials before connecting.',
                  color: 'bg-purple-100 dark:bg-purple-900/20 text-purple-600',
                },
              ].map((step, i) => (
                <div key={i} className="flex flex-col items-center text-center p-6">
                  <div className={`p-4 rounded-2xl ${step.color} mb-4`}>
                    <span className="material-symbols-outlined text-4xl">{step.icon}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                  <p className="text-slate-600 dark:text-slate-400">{step.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Stats section */}
          <section className="px-6 py-20 lg:px-20 bg-accent-warm dark:bg-slate-900/20">
            <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <p className="text-5xl font-black text-primary mb-2">5,000+</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Neighbors Swapping</p>
              </div>
              <div>
                <p className="text-5xl font-black text-primary mb-2">12k</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Hours Exchanged</p>
              </div>
              <div>
                <p className="text-5xl font-black text-primary mb-2">45</p>
                <p className="text-slate-600 dark:text-slate-400 font-medium">Active Cities</p>
              </div>
            </div>
          </section>

          {/* CTA section */}
          <section className="px-6 py-24 lg:px-20">
            <div className="max-w-4xl mx-auto text-center bg-slate-900 dark:bg-slate-800 rounded-3xl p-12">
              <h2 className="text-4xl font-bold text-white mb-4">
                Ready to meet your neighbors?
              </h2>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Join the thousands of people building stronger, more resilient communities through skill sharing.
              </p>
              <a
                href="/signup"
                className="inline-flex items-center justify-center h-14 px-8 bg-primary text-slate-900 font-bold rounded-xl hover:scale-105 transition-transform"
              >
                Get Started for Free
              </a>
            </div>
          </section>
        </main>

        <footer className="border-t border-slate-200 dark:border-slate-800 py-8">
          <div className="max-w-7xl mx-auto px-6 lg:px-20 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-slate-500">© 2026 SkillSwap Inc. Made for the community.</p>
            <div className="flex gap-6 text-sm text-slate-600 dark:text-slate-400">
              <a href="#" className="hover:text-primary">Privacy Policy</a>
              <a href="#" className="hover:text-primary">Terms of Use</a>
              <a href="#" className="hover:text-primary">Community Guidelines</a>
            </div>
          </div>
        </footer>
      </div>
    </>
  );
}
