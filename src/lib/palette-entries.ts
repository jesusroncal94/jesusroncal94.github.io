import profile from '../../data/public-profile.json';
import { localePath, type Locale } from '../i18n/locales';
import { useTranslations } from '../i18n/translate';
import { caseSlug, getCases } from './cases';
import type { PaletteEntry } from './palette';
import { getSite } from './site';

export async function buildPaletteEntries(locale: Locale): Promise<PaletteEntry[]> {
  const t = useTranslations(locale);
  const site = await getSite(locale);
  const cases = await getCases(locale);
  const home = localePath(locale);
  const casePath = (slug: string) => localePath(locale, `work/${slug}`);

  const questions = site.palette.questions.map(({ label, case: slug }, index) => ({
    id: `question-${index}`,
    group: 'question' as const,
    label,
    keywords: [],
    href: casePath(slug),
  }));

  const caseEntries = cases.map((entry) => ({
    id: `case-${caseSlug(entry)}`,
    group: 'case' as const,
    label: entry.data.title,
    keywords: [...entry.data.keywords, ...entry.data.stack, entry.data.organisation, entry.data.product ?? ''],
    href: casePath(caseSlug(entry)),
  }));

  const sections = [
    { id: 'work', label: site.work.eyebrow },
    { id: 'open-source', label: site.openSource.eyebrow },
    { id: 'experience', label: site.experience.eyebrow },
    { id: 'how-i-work', label: site.principles.eyebrow },
  ].map(({ id, label }) => ({ id: `section-${id}`, group: 'section' as const, label, keywords: [], href: `${home}#${id}` }));

  const repos = site.openSource.repos.map(({ name, title, stack, url }) => ({
    id: `repo-${name.split(' ')[0]}`,
    group: 'repo' as const,
    label: name,
    keywords: [title, ...stack],
    href: url,
    external: true,
  }));

  const actions: PaletteEntry[] = [
    { id: 'action-cv', group: 'action', label: t('cta.downloadCv'), keywords: ['resume', 'pdf'], href: '/cv/jesus-roncal-cv-en.pdf' },
    { id: 'action-email', group: 'action', label: t('cta.emailMe'), keywords: ['contact', 'hire'], href: `mailto:${profile.contact.email}` },
  ];

  return [...questions, ...caseEntries, ...sections, ...repos, ...actions].map((entry) => ({
    ...entry,
    groupLabel: t(`palette.group.${entry.group}`),
  }));
}
