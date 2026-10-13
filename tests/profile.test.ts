import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { mergeCv, parseCv, parseProfile } from '../src/lib/profile/parse';

const fixture = readFileSync(new URL('./fixtures/profile.md', import.meta.url), 'utf8');

describe('public profile export', () => {
  it('keeps the allow-listed facts', () => {
    expect(parseProfile(fixture)).toEqual({
      name: 'Jesus Enrique Roncal Huatta',
      headline: 'Senior Software Engineer | AI & Backend',
      city: 'Milan, Italy',
      contact: {
        email: 'jesusroncal94@gmail.com',
        linkedin: 'https://www.linkedin.com/in/example',
        github: 'https://github.com/jesusroncal94',
      },
      roles: [
        {
          id: 'intercorp-management-innova-latam',
          title: 'AI Engineer',
          organisation: 'Intercorp Management / Innova LATAM',
          location: 'Peru - Remote',
          start: '2024-09',
          end: null,
        },
        {
          id: 'indra-pretty-technical',
          title: 'Backend Developer - Freelance (concurrent, part-time)',
          organisation: 'Indra (Peru) | Pretty Technical (Netherlands)',
          location: null,
          start: '2021',
          end: '2022',
        },
      ],
      education: [
        {
          degree: 'Bachelor of Systems Engineering',
          institution: 'National Technological University of South Lima, Lima, Peru',
          year: 2019,
        },
      ],
      skills: [
        { group: 'Languages', items: ['Python', 'Go', 'Java'] },
        {
          group: 'Cloud & Infrastructure',
          items: ['AWS (ECS, EC2, S3)', 'Docker', 'CI/CD (GitHub Actions)', 'Terraform and Kubernetes (working knowledge)'],
        },
      ],
      languages: [
        { name: 'Spanish', level: 'Native (C2)' },
        { name: 'Italian', level: 'Elementary (A2)' },
      ],
    });
  });

  it('leaves every private detail behind', () => {
    const output = JSON.stringify(parseProfile(fixture));

    expect(output).not.toMatch(/\+\d[\d\s]{7,}/);
    expect(output).not.toMatch(/\d[\d,.]*\s*(USD|EUR)|\$\s*\d/);
    expect(output).not.toMatch(/salary|private note|deal-breaker|whatsapp/i);
  });
});

const cvFixture = readFileSync(new URL('./fixtures/cv-base.md', import.meta.url), 'utf8');

describe('CV export', () => {
  it('reads the summary and the role bullets, without bold markers', () => {
    expect(parseCv(cvFixture)).toEqual({
      summary: 'Senior software engineer with 8+ years across backend systems. Ships services on AWS and GCP.',
      roles: [
        {
          id: 'intercorp-management-innova-latam',
          bullets: ['Own the production LLM system on Gemini 2.5 Pro, at ~$0.08 per session.', 'Designed an eval-driven prompt pipeline.'],
        },
        { id: 'indra-pretty-technical', bullets: ['Built APIs serving predictive ML models.'] },
      ],
    });
  });

  it('joins the profile role by role', () => {
    const merged = mergeCv(parseProfile(fixture), parseCv(cvFixture));
    expect(merged.summary).toMatch(/^Senior software engineer/);
    expect(merged.roles.map(({ bullets }) => bullets?.length)).toEqual([2, 1]);
  });

  it('refuses a role that is in one file and not the other', () => {
    const fewer = cvFixture.replace(/### Backend Developer - Freelance[\s\S]*?(?=## Education)/, '');
    expect(() => mergeCv(parseProfile(fixture), parseCv(fewer))).toThrow(/differ from the profile/);
  });

  it('leaves the contact section and every private detail behind', () => {
    const output = JSON.stringify(mergeCv(parseProfile(fixture), parseCv(cvFixture)));

    expect(output).not.toMatch(/\+00|123 456|987 654|someone@example|whatsapp|private note|tailor/i);
  });

  it('refuses a phone number or an email in the CV text', () => {
    expect(() => parseCv(cvFixture.replace('Designed an eval-driven', 'Call +00 123 456 789; designed an eval-driven'))).toThrow(/Private detail/);
    expect(() => parseCv(cvFixture.replace('Designed an eval-driven', 'Call 555 010 0199; designed an eval-driven'))).toThrow(/Private detail/);
    expect(() => parseCv(cvFixture.replace('Designed an eval-driven', 'Write to someone@example.com; designed an eval-driven'))).toThrow(/Private detail/);
  });
});
