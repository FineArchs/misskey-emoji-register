import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import { init as apiInit } from "./misskey";
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
export const emojis = writable<Emoji[]>();

const cookieStoresRecord: Record<string, Writable<string>> = {
  serverUrl, accessToken, defaultFFMpegArgs
};

export const getCookie = () => {
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
      apiInit();
    });
  }
  apiInit();
}
