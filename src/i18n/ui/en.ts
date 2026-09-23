export const en = {
  'site.title': 'Jesús Roncal — AI & Backend Engineer',
  'site.description':
    'Senior Software Engineer, AI & Backend. I ship LLM systems that survive production: measured, grounded and cost-aware.',

  'nav.work': 'Work',
  'nav.openSource': 'Open source',
  'nav.experience': 'Experience',
  'nav.menu': 'Menu',

  'cta.downloadCv': 'Download CV',
  'cta.emailMe': 'Email me',
  'cta.seeWork': 'See the work',
  'cta.readCase': 'Read the case',
  'cta.nextCase': 'Next case',
  'cta.copied': 'Copied',

  'section.proof': 'Results in numbers',
  'section.work': 'Selected work',
  'section.openSource': 'Open source',
  'section.experience': 'Experience',
  'section.howIWork': 'How I work',

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
} as const;

export type UiKey = keyof typeof en;
