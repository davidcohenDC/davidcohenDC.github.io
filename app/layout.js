import { Cabin } from 'next/font/google';

import { GoogleAnalytics, GoogleTagManager } from '@next/third-parties/google';

import { BASE_URL } from '@/lib/constants';

import Footer from '@/components/footer';
import Navbar from '@/components/navbar';
import PageTransition from '@/components/page-transition';

import './globals.css';

/* ────────────────────────────────────── */
/*  Fonts & viewport                      */
/* ────────────────────────────────────── */
const cabin = Cabin({
  subsets: ['latin'],
  display: 'swap'
});

export const viewport = {
  colorScheme: 'only dark',
  themeColor: '#1A1F2A'
};

/* ────────────────────────────────────── */
/*  Metadata                              */
/* ────────────────────────────────────── */
export async function generateMetadata() {
  return {
    referrer: 'origin',
    pageType: 'Portfolio',
    other: {
      'page-type': 'Portfolio',
      copyright: 'David Cohen',
      audience: 'Everyone',
      'itemProp:name': 'David Cohen | Research Engineer',
      'itemProp:description':
        'Research engineer and University of Bologna M.Sc. candidate working across applied ML, robotics, distributed systems, and software architecture.'
    },
    metadataBase: new URL(BASE_URL),

    /* ——— <title> ——— */
    title: {
      default: 'David Cohen | Research Engineer',
      template: '%s | David Cohen'
    },

    /* ——— <meta name="description"> ——— */
    description:
      'Research engineer and University of Bologna M.Sc. candidate with four years of professional back-end experience and a co-first-authored Neural Networks article.',
    applicationName: 'David Cohen',

    /* ——— Keywords ——— */
    keywords: [
      'david cohen',
      'research engineer',
      'applied research',
      'machine learning',
      'reinforcement learning',
      'robotics',
      'distributed systems',
      'software architecture',
      'natural language processing',
      'scala',
      'java',
      'python'
    ],

    /* ——— Authorship ——— */
    authors: [{ name: 'David Cohen', url: BASE_URL }],
    creator: 'David Cohen',
    publisher: 'David Cohen',

    /* ——— Open Graph ——— */
    openGraph: {
      title: 'David Cohen | Research Engineer',
      description:
        'Research engineer and M.Sc. candidate working across applied ML, robotics, distributed systems, and software architecture.',
      authors: ['David Cohen'],
      url: BASE_URL,
      siteName: 'David Cohen',
      locale: 'en_US',
      type: 'website'
    },

    /* ——— Twitter Cards ——— */
    twitter: {
      card: 'summary_large_image',
      title: 'David Cohen | Research Engineer',
      description:
        'Research engineer and M.Sc. candidate working across applied ML, robotics, distributed systems, and software architecture.'
    },

    /* ——— Icons & PWA ——— */
    icons: {
      icon: '/favicon.ico'
    },
    manifest: `${BASE_URL}/manifest.json`,

    /* ——— Crawling ——— */
    robots: {
      index: true,
      follow: true,
      nocache: false,
      googleBot: {
        index: true,
        follow: true,
        noimageindex: false
      }
    },

    /* ——— Languages ——— */
    languages: {
      'en-US': '/en-US'
    }
  };
}

/* ────────────────────────────────────── */
/*  Root layout                           */
/* ────────────────────────────────────── */
export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${cabin.className} h-full scroll-smooth`}>
      {/* Google Tag Manager */}
      <GoogleTagManager gtmId={process.env.NEXT_PUBLIC_GA_TRACKING_ID} />
      <body className="antialiased">
        <Navbar />

        {/* animated page-switch */}
        <PageTransition>
          <main className="relative isolate overflow-hidden">
            <div className="mx-auto min-h-svh w-full max-w-[50rem] px-5 py-3 pt-16 md:px-10 lg:px-0">
              {children}
            </div>
          </main>
        </PageTransition>

        <Footer />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_TRACKING_ID} />
      </body>
    </html>
  );
}
