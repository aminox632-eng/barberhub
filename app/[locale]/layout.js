import './globals.css';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import Providers from '@/components/Providers';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { locales, rtlLocales, SITE_URL } from '@/lib/config';

export async function generateMetadata({ params: { locale } }) {
  const t = await getTranslations({ locale, namespace: 'meta' });
  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t('homeTitle'), template: '%s | BarberHub' },
    description: t('homeDesc'),
    alternates: { languages: Object.fromEntries(locales.map((l) => [l, `/${l}`])) },
    openGraph: { title: t('homeTitle'), description: t('homeDesc'), siteName: 'BarberHub', type: 'website' },
    twitter: { card: 'summary_large_image' },
  };
}

export const viewport = { themeColor: '#0A0A0A' };

export default async function LocaleLayout({ children, params: { locale } }) {
  if (!locales.includes(locale)) notFound();
  const messages = await getMessages();
  return (
    <html lang={locale} dir={rtlLocales.includes(locale) ? 'rtl' : 'ltr'}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,500;6..96,700&family=Manrope:wght@400;500;600;700&family=Cairo:wght@400;600;700&family=Noto+Sans+SC:wght@400;500;700&display=swap"
        />
      </head>
      <body className="min-h-screen">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <Providers>
            <Navbar />
            <main>{children}</main>
            <Footer />
          </Providers>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
