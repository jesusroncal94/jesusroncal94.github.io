export const en = {
  'site.title': 'Jesús Roncal — AI & Backend Engineer',
  'site.description':
    'Senior Software Engineer, AI & Backend. I ship LLM systems that survive production: measured, grounded and cost-aware.',

  'nav.work': 'Work',
  'nav.openSource': 'Open source',
  'nav.experience': 'Experience',
  'nav.menu': 'Menu',
  'nav.language': 'Language',

  'cta.downloadCv': 'Download CV',
  'cta.emailMe': 'Email me',
  'cta.seeWork': 'See the work',
  'cta.readCase': 'Read the case',
  'cta.nextCase': 'Next case',
  'cta.copied': 'Copied',

  'contact.copiedStatus': 'Email address copied to the clipboard.',
  'contact.email': 'Email',

  'section.proof': 'Results in numbers',
  'section.work': 'Selected work',
  'section.openSource': 'Open source',
  'section.experience': 'Experience',
  'section.howIWork': 'How I work',
  'section.contact': 'Contact',

  'period.now': 'now',

  'metric.before': 'Before',
  'metric.after': 'After',
  'case.allWork': 'All work',
  'case.stack': 'Stack',

  'palette.label': 'Quick navigation',
  'palette.empty': 'Nothing matches that yet.',
  'palette.group.question': 'Question',
  'palette.group.case': 'Case',
  'palette.group.section': 'Section',
  'palette.group.repo': 'Repo',
  'palette.group.action': 'Action',

  'footer.builtWith': 'Built spec-first with SPDD',
  'footer.source': 'source',
  'footer.privacy': 'Privacy',

  'privacy.back': 'Home',
  'privacy.updated': 'Updated {date}',

  'cv.title': 'Curriculum vitae',
  'cv.summary': 'Summary',
  'cv.experience': 'Experience',
  'cv.education': 'Education',
  'cv.skills': 'Skills',
  'cv.languages': 'Languages',

  'og.role': 'AI & Backend Engineer',
  'og.homeAlt': 'Jesús Roncal, AI & Backend Engineer. I ship LLM systems that survive production.',
  'og.caseAlt': '{title}: {before} to {after}. A case study by Jesús Roncal.',

  'suggest.title': 'Also in English.',
  'suggest.alsoIn': 'This site is also available in {language}.',
  'suggest.action': 'Read in English',
  'suggest.pill': 'Read this site in English →',
  'suggest.close': 'Dismiss',
  'language.en': 'English',
  'language.es': 'Spanish',
  'language.it': 'Italian',
} as const;

export type UiKey = keyof typeof en;
