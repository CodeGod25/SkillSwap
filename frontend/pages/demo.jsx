import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import Link from 'next/link';
import TopNav from '../components/stitch/TopNav';
import api from '../lib/api';

export default function Demo() {
  const router = useRouter();
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
        <title>How SkillSwap Works - Video Demo</title>
        <meta name="description" content="Watch a demo video to learn how SkillSwap helps you exchange skills with neighbors" />
      </Head>

      <div className="min-h-screen bg-background-light dark:bg-background-dark">
        <TopNav user={user} />

        <main className="max-w-6xl mx-auto px-6 py-12">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl lg:text-5xl font-bold text-slate-900 dark:text-white mb-4">
              See How SkillSwap Works
            </h1>
            <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
              Watch this quick demo to learn how you can exchange skills and build community connections in your neighborhood
            </p>
          </div>

          {/* Video Player Container */}
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-700 mb-12">
            <div className="aspect-video bg-slate-900 flex items-center justify-center relative">
              {/* Actual Demo Video */}
              <video 
                controls 
                className="w-full h-full object-contain"
                poster="/4dollas.jpg"
              >
                <source src="/SkillSwap-Demo.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>

          {/* Key Features */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-primary">map</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Find Neighbors
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Discover skilled people in your area with our interactive map and search features
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-green-500">verified</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Verified Skills
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    See verified skills with experience levels from Beginner to Expert
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-blue-500">payments</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Time Credits
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Earn credits by helping others, use them to get help for yourself
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 rounded-xl p-6 border border-slate-200 dark:border-slate-700">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-outlined text-purple-500">swap_horiz</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                    Skill Exchange
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Trade your skills directly or use credits - flexible exchange options
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-primary/20 to-primary/5 rounded-2xl p-8 text-center border border-primary/20">
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-4">
              Ready to Get Started?
            </h2>
            <p className="text-slate-600 dark:text-slate-400 mb-6 max-w-2xl mx-auto">
              Join thousands of neighbors already exchanging skills and building stronger communities
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {user ? (
                <Link
                  href="/dashboard"
                  className="px-8 py-3 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-colors"
                >
                  Go to Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    href="/signup"
                    className="px-8 py-3 bg-primary hover:bg-primary/90 text-slate-900 font-bold rounded-xl transition-colors"
                  >
                    Sign Up Now
                  </Link>
                  <Link
                    href="/login"
                    className="px-8 py-3 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-900 dark:text-white font-bold rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
                  >
                    Log In
                  </Link>
                </>
              )}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
