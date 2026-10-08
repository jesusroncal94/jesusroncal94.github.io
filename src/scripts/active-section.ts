import { currentSection } from '../lib/active-section';

const header = document.querySelector('header');
const links = [...document.querySelectorAll<HTMLAnchorElement>('[data-section-link]')].filter(
  (link) => link.pathname === location.pathname && link.hash.length > 1 && document.getElementById(link.hash.slice(1)),
);
const targets = [...new Set(links.map((link) => link.hash.slice(1)))].map((id) => document.getElementById(id)!);

if (header && targets.length) {
  let marked: string | undefined;
  let queued = false;

  const update = () => {
    queued = false;
    const line = header.getBoundingClientRect().bottom + 1;
    const id = currentSection(
      line,
      // A jump lands a section's top its scroll margin below the bar, so its box starts there.
      targets.map((target) => {
        const { top, bottom } = target.getBoundingClientRect();
        const margin = parseFloat(getComputedStyle(target).scrollMarginTop) || 0;
        return { id: target.id, top: top - margin, bottom: bottom - margin };
      }),
    );
    if (id === marked) return;
    marked = id;
    for (const link of links) {
      if (link.hash === `#${id}`) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    }
  };

  const schedule = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(update);
  };

  update();
  addEventListener('scroll', schedule, { passive: true });
  addEventListener('resize', schedule, { passive: true });
  addEventListener('hashchange', update);
}
