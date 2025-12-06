'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { locales, type Locale } from '@/i18n';
import { LOCALE_COOKIE } from '@/shared/lib/locale-detection';

export function LanguageSwitcher() {
  const t = useTranslations('common');
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();

  const switchLocale = (newLocale: Locale) => {
    if (newLocale === locale) return;

    // Set cookie to persist user's choice
    document.cookie = `${LOCALE_COOKIE}=${newLocale}; path=/; max-age=${60 * 60 * 24 * 365}`;

    // Replace locale in pathname
    const segments = pathname.split('/');
    segments[1] = newLocale;
    const newPath = segments.join('/');

    // Navigate to new locale path
    router.push(newPath);
    router.refresh();
  };

  return (
    <div className="inline-flex items-center bg-white/10 backdrop-blur-sm rounded-full p-1 gap-1" role="group" aria-label={t('switchLanguage')}>
      {locales.map((loc) => (
        <button
          key={loc}
          onClick={() => switchLocale(loc)}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
            locale === loc
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-white hover:text-white/90'
          }`}
          aria-label={`Switch to ${loc === 'en' ? 'English' : 'Russian'}`}
          aria-current={locale === loc ? 'true' : undefined}
        >
          {loc.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
