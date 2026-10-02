import { OWNER_MARK, track } from '../lib/track';

applyOwnerMark(new URLSearchParams(location.search).get(OWNER_MARK.key));
track('$pageview');
watchCaseResult();

function applyOwnerMark(setting: string | null) {
  try {
    if (setting === OWNER_MARK.value) localStorage.setItem(OWNER_MARK.key, OWNER_MARK.value);
    if (setting === 'on') localStorage.removeItem(OWNER_MARK.key);
  } catch {
    return;
  }
}

function watchCaseResult() {
  const article = document.querySelector<HTMLElement>('[data-case]');
  const result = document.getElementById('result');
  if (!article?.dataset.case || !result || !('IntersectionObserver' in window)) return;
  const caseSlug = article.dataset.case;
  const observer = new IntersectionObserver((entries) => {
    if (!entries.some((entry) => entry.isIntersecting)) return;
    observer.disconnect();
    track('case_result_seen', { case: caseSlug });
  });
  observer.observe(result);
}
