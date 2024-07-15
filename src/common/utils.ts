import browser from 'webextension-polyfill';
import { ISettings } from './types';

export function isSameOrigin(linkUrl: string) {
  const url = new URL(linkUrl);
  return location.origin === url.origin;
}

export default function getEventTarget(event: Event): EventTarget | null {
  if (event.composedPath) {
    return event.composedPath()[0];
  }
  return event.target;
}

export const isFirefox = /firefox/i.test(navigator.userAgent);

const settingKeys: Record<keyof ISettings, number> = {
  urlList: 1,
};
export async function getSettings(): Promise<ISettings> {
  const items = await browser.storage.sync.get(Object.keys(settingKeys));

  const settings = items as ISettings;
  if (!settings.urlList) {
    settings.urlList = [];
  }
  return settings;
}

export async function setSettings(settings: Partial<ISettings>) {
  await browser.storage.sync.set(settings);
}
