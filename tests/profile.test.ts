import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { parseProfile } from '../src/lib/profile/parse';

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
