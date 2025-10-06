# i18n Implementation Guide for Lukely

## ✅ Completed Setup

### Core Configuration
- ✅ `i18n/request.ts` - Cookie-based locale detection
- ✅ `next.config.ts` - next-intl plugin configured
- ✅ `app/layout.tsx` - NextIntlClientProvider wrapper
- ✅ `messages/no.json` - Complete Norwegian translations
- ✅ `messages/en.json` - Complete English translations

### Updated Components
- ✅ `lib/calendar-templates.ts` - Uses translation keys
- ✅ `lib/ai/quiz-orchestrator.ts` - Supports locale parameter
- ✅ `components/language-switcher.tsx` - Language switcher component
- ✅ `components/app-sidebar.tsx` - Translated navigation

## 📋 Remaining Tasks

### 1. Add Language Switcher to Headers

**File:** `components/header.tsx` (or similar header component)

```tsx
import { LanguageSwitcher } from '@/components/language-switcher';

// Add to header navigation
<div className="flex items-center gap-4">
  <LanguageSwitcher />
  {/* other header items */}
</div>
```

**Also add to:**
- `app/dashboard/layout.tsx` - Dashboard header
- `components/site-header.tsx` - Public site header (if exists)

### 2. Update Components with Translations

For each component, follow this pattern:

#### Client Components (with "use client")

```tsx
"use client";

import { useTranslations } from 'next-intl';

export function YourComponent() {
  const t = useTranslations('SectionName');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

#### Server Components (async)

```tsx
import { getTranslations } from 'next-intl/server';

export default async function YourPage() {
  const t = await getTranslations('SectionName');

  return (
    <div>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
    </div>
  );
}
```

### 3. Update Public Calendar Component

**File:** `components/public-calendar.tsx`

Replace hardcoded strings with translations:

```tsx
"use client";

import { useTranslations } from 'next-intl';

export default function PublicCalendar({ calendar }: { calendar: Calendar }) {
  const t = useTranslations('PublicCalendar');
  const tDoor = useTranslations('PublicCalendar.door');
  const tForm = useTranslations('PublicCalendar.form');
  const tConsent = useTranslations('PublicCalendar.consent');
  const tErrors = useTranslations('PublicCalendar.errors');

  // Replace all strings like:
  // "Denne luken er ikke åpnet ennå!" -> t('door.locked')
  // "Delta og vinn!" -> tForm('participate')
  // "E-post er påkrevd" -> tErrors('emailRequired')
}
```

### 4. Update Auth Pages

**Files:**
- `components/auth/sign-in.tsx`
- `components/auth/sign-up.tsx`

```tsx
"use client";

import { useTranslations } from 'next-intl';

export function SignIn() {
  const t = useTranslations('Auth.signIn');
  const tLegal = useTranslations('Auth.legal');

  return (
    <>
      <h1>{t('title')}</h1>
      <p>{t('description')}</p>
      {/* etc */}
    </>
  );
}
```

### 5. Update Marketing Pages

**Files to update:**
- `components/hero-section.tsx`
- `components/pricing.tsx`
- `components/features-1.tsx`
- `components/how-it-works-3.tsx`
- `components/faqs-2.tsx`
- `components/testimonials-8.tsx`
- `components/footer.tsx`

```tsx
"use client";

import { useTranslations } from 'next-intl';

export default function HeroSection() {
  const t = useTranslations('Marketing.hero');

  return (
    <section>
      <h1>{t('title')}</h1>
      <p>{t('subtitle')}</p>
      <button>{t('cta')}</button>
    </section>
  );
}
```

### 6. Update Dashboard Pages

**Key files:**
- `app/dashboard/calendars/new/new-calendar-form.tsx`
- `components/calendar-settings.tsx`
- `components/calendar-quick-branding.tsx`
- `components/calendar-form-steps/*.tsx`
- `components/winner-selection.tsx`

```tsx
"use client";

import { useTranslations } from 'next-intl';

export default function CalendarSettings() {
  const t = useTranslations('Calendar.settings');
  const tBasic = useTranslations('Calendar.settings.basic');
  const tBranding = useTranslations('Calendar.settings.branding');

  // Replace strings with t() calls
}
```

### 7. Update Calendar Template Usage

Wherever calendar templates are displayed, use `useTranslations` to get the translated title/description:

```tsx
"use client";

import { useTranslations } from 'next-intl';
import { CALENDAR_TEMPLATES } from '@/lib/calendar-templates';

export function TemplateSelector() {
  const t = useTranslations();

  return (
    <>
      {Object.values(CALENDAR_TEMPLATES).map((template) => (
        <div key={template.type}>
          <h3>{t(template.titleKey)}</h3>
          <p>{t(template.descriptionKey)}</p>
        </div>
      ))}
    </>
  );
}
```

### 8. Update Date Formatting

Replace `date-fns/locale` with next-intl formatting:

**Old approach:**
```tsx
import { format } from 'date-fns';
import { nb } from 'date-fns/locale';

format(date, "d. MMM", { locale: nb })
```

**New approach:**
```tsx
import { useFormatter } from 'next-intl';

function Component() {
  const format = useFormatter();

  return (
    <time>
      {format.dateTime(date, {
        day: 'numeric',
        month: 'short'
      })}
    </time>
  );
}
```

For server components:
```tsx
import { getFormatter } from 'next-intl/server';

async function Component() {
  const format = await getFormatter();
  // same usage
}
```

### 9. Update Config Files

**File:** `lib/config.ts`

```tsx
// Instead of hardcoded siteConfig, use translations
import { getTranslations } from 'next-intl/server';

export async function getSiteConfig() {
  const t = await getTranslations('Config.siteConfig');

  return {
    name: t('name'),
    description: t('description'),
    keywords: t('keywords').split(','), // or use array in JSON
    // ...
  };
}
```

## 🔧 Helper Utilities

### Toast Messages with Translations

```tsx
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';

function Component() {
  const t = useTranslations('Calendar.messages');

  const handleSave = async () => {
    try {
      // ... save logic
      toast.success(t('updated'));
    } catch (error) {
      toast.error(t('errorUpdate'));
    }
  };
}
```

### Dynamic Translations with Parameters

For translations with dynamic values (like `{number}`, `{email}`):

```tsx
const t = useTranslations('Winner');

// Translation: "Luke {number}"
<h3>{t('title', { number: doorNumber })}</h3>

// Translation: "Vinner valgt: {email}! 🎉"
toast.success(t('messages.winnerSelected', { email: winner.email }));
```

## 🧪 Testing

### Test Language Switching

1. Start dev server: `pnpm dev`
2. Open app in browser
3. Click language switcher
4. Verify all text changes to selected language
5. Verify cookie is set: `NEXT_LOCALE=en` or `NEXT_LOCALE=no`
6. Refresh page - language should persist

### Test AI Quiz Generation

Test both languages:
```tsx
// Norwegian quiz
await generateDoorQuiz({
  doorNumber: 1,
  theme: "CHRISTMAS",
  locale: "no"
});

// English quiz
await generateDoorQuiz({
  doorNumber: 1,
  theme: "CHRISTMAS",
  locale: "en"
});
```

## 📝 Common Patterns

### Nested Translation Keys

```tsx
const t = useTranslations('Calendar.form.basic');

// Access: Calendar.form.basic.title
<label>{t('title')}</label>

// Access: Calendar.form.basic.calendarTitlePlaceholder
<input placeholder={t('calendarTitlePlaceholder')} />
```

### Conditional Translations

```tsx
const t = useTranslations('Common.status');

<Badge>{t(status.toLowerCase())}</Badge>
// Translates: draft -> "Kladd" or "Draft"
```

### Array Translations

```tsx
const t = useTranslations('Marketing.pricing');

// For features array:
{JSON.parse(t.raw('features')).map((feature: string, i: number) => (
  <li key={i}>{feature}</li>
))}
```

Or better, use numbered keys:
```json
{
  "features": {
    "0": "Feature 1",
    "1": "Feature 2"
  }
}
```

```tsx
{Array.from({ length: 6 }).map((_, i) => (
  <li key={i}>{t(`features.${i}`)}</li>
))}
```

## 🎯 Priority Order for Updates

1. **High Priority** (user-facing):
   - ✅ Public calendar component
   - ✅ Auth pages
   - ✅ Marketing pages (hero, pricing)

2. **Medium Priority**:
   - ✅ Dashboard pages
   - ✅ Calendar creation flow
   - ✅ Settings pages

3. **Low Priority**:
   - ✅ Empty states
   - ✅ Error messages
   - ✅ Helper text

## 🐛 Troubleshooting

### "Messages are not provided" error
- Ensure `NextIntlClientProvider` is wrapping your app in root layout
- Check that messages are loaded in `i18n/request.ts`

### Translations not updating
- Clear cookies and restart dev server
- Verify cookie `NEXT_LOCALE` is set correctly

### TypeScript errors on `t()`
- Add type safety by generating types from JSON (optional):
  ```bash
  npx next-intl-cli@latest extract
  ```

## 📚 Resources

- [next-intl Documentation](https://next-intl-docs.vercel.app/)
- [next-intl Examples](https://github.com/amannn/next-intl/tree/main/examples)
- [Translation key best practices](https://next-intl-docs.vercel.app/docs/usage/messages)

---

## Summary

**Completed:**
- ✅ Core i18n setup
- ✅ Translation files (Norwegian & English)
- ✅ Language switcher component
- ✅ Calendar templates i18n
- ✅ AI quiz multi-language support
- ✅ Sidebar navigation i18n

**Remaining:**
- 🔲 Update ~40 components with translations
- 🔲 Add language switcher to headers
- 🔲 Update date formatting
- 🔲 Test all pages in both languages

**Estimated time:** 4-6 hours for all remaining components

Follow the patterns above and reference the translation JSON files for all available keys!
