import type { CONVERSION, Conversion, ConversionEvent } from '../lib/track';

const CONFIRMATION_MS = 2000;
const CONVERSION_EVENT: typeof CONVERSION = 'conversion';

document.addEventListener('click', (event) => {
  const element = (event.target as Element).closest<HTMLElement>('[data-track]');
  if (!element) return;
  const { track: conversion, trackTarget } = element.dataset;
  const detail: Conversion = {
    event: conversion as ConversionEvent,
    props: trackTarget ? { target: trackTarget } : undefined,
  };
  document.dispatchEvent(new CustomEvent(CONVERSION_EVENT, { detail }));
  if (element instanceof HTMLAnchorElement && element.dataset.emailCopy) copyEmail(event, element);
});

async function copyEmail(event: Event, link: HTMLAnchorElement) {
  if (!navigator.clipboard) return;
  event.preventDefault();
  try {
    await navigator.clipboard.writeText(link.dataset.emailCopy!);
  } catch {
    window.location.href = link.href;
    return;
  }
  confirm(link);
}

function confirm(link: HTMLAnchorElement) {
  const label = link.querySelector<HTMLElement>('[data-email-label]')!;
  const status = link.parentElement!.querySelector<HTMLElement>('[data-email-status]')!;
  const original = label.textContent;
  label.textContent = link.dataset.copiedLabel!;
  status.textContent = link.dataset.copiedStatus!;
  setTimeout(() => {
    label.textContent = original;
    status.textContent = '';
  }, CONFIRMATION_MS);
}
