'use client';

import { useLayoutEffect } from 'react';
import { usePathname } from 'next/navigation';
import { isRtl, langFromPathname } from '@/lib/i18n';

/**
 * Syncs the <html> element's lang and dir with the active locale. The /ar
 * subtree already carries dir="rtl" and lang="ar" on its own wrapper (so the
 * first paint is correct without JS); this keeps the document element honest
 * for assistive tech, browser translation, and scrollbar placement.
 */
export function LocaleHtml() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const lang = langFromPathname(pathname);
    document.documentElement.lang = lang;
    document.documentElement.dir = isRtl(lang) ? 'rtl' : 'ltr';
  }, [pathname]);

  return null;
}
