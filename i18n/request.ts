import { getRequestConfig } from 'next-intl/server';
import { cookies } from 'next/headers';

export default getRequestConfig(async () => {
  // Get locale from cookie, default to Norwegian
  const store = await cookies();
  const locale = store.get('NEXT_LOCALE')?.value || 'no';

  return {
    locale,
    messages: (await import(`../messages/${locale}.json`)).default,
  };
});
