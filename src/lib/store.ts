import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import type { DriveFile, Note } from "misskey-js/entities.js";

export type Emoji = {
  originalText: string
  name: string
  license: string
  from: string
  description: string
  tag: string[]
  category: string
  isSensitive: string
  localOnly: string
  file: DriveFile
}

export const serverUrl = writable("");
export const accessToken = writable("");
export const note = writable<Note>();
export const defaultFFMpegArgs = writable("-lossless 1");
export const corsAnywhereUrl = writable("");
export const emojiRoboUrl = writable("");
export const emojis = writable<Emoji[]>();

// 機密情報　一週間で消える
const cookieStoresRecord: Record<string, Writable<string>> = {
  accessToken,
};
const getCookie = () => {
  const cookies = document.cookie;
  if (cookies !== "") {
    const strArr = cookies.split("; ");
    strArr.forEach((elem) => {
      const match = elem.match(/^([^=]+)=(.*)$/);
      if (!match) return;
      const [_, key, val] = match as [string, string, string];
      if (!(key in cookieStoresRecord)) return;
      cookieStoresRecord[key].set(val);
    })
  }
  for (const [key, store] of Object.entries(cookieStoresRecord)) {
    store.subscribe(value => {
      document.cookie = `${key}=${value}; Max-Age=50000000`;
    });
  }
}

// 機密でもない情報　設定系
const storageStoresRecord: Record<string, Writable<string>> = {
  serverUrl, defaultFFMpegArgs, corsAnywhereUrl, emojiRoboUrl
};
for (const [key, store] of Object.entries(storageStoresRecord)) {
  const saved = localStorage.getItem(key);
  if (saved != null) store.set(saved);
  store.subscribe(value => localStorage.setItem(key, value));
}
function loadQueryParam(): void {
  const url = new URL(window.location.href);
  const params = new URLSearchParams(url.search);
  let doKeep = false;
  for (const [qpkey, qpvalue] of params) {
    if (Object.hasOwn(storageStoresRecord, qpkey)) {
      storageStoresRecord[qpkey].set(qpvalue);
      continue;
    }
    switch (qpkey) {
      case 'load': {
        const newParams = new URLSearchParams();
        for (const [k, st] of Object.entries(storageStoresRecord)) {
          newParams.append(k, get(st));
        }
        url.search = newParams.toString();
        window.history.replaceState(null, '', url.toString());
        doKeep = true;
        break;
      }
      case 'keep': {
        doKeep = !!qpvalue;
        break;
      }
      default: {
        console.error(`Unknown Query Param: ${qpkey}`);
        break;
      }
    }
  }
  if (!doKeep) window.history.replaceState(null, '', url.pathname);
}

export function initStore(): void {
  getCookie();
  loadQueryParam();
}
