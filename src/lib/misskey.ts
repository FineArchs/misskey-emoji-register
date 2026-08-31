import { api } from "misskey-js"

import { serverUrl, accessToken, corsAnywhereUrl } from "./store";
import { EMOJINAME_REGEXP1 } from './splitEmojis';
import { get, derived } from "svelte/store";
import type { APIClient } from "misskey-js/api.js";
import type { AdminEmojiAddRequest, DriveFilesCreateResponse, Note, EmojiDetailed  } from "misskey-js/entities.js";

const miApi = derived(
  [serverUrl, accessToken],
  ([$serverUrl, $accessToken]) => new api.APIClient({
    origin: $serverUrl,
    credential: $accessToken,
  }),
);

export const miApiReady = derived(
  [serverUrl, accessToken],
  ([$serverUrl, $accessToken]) => ($serverUrl && $accessToken),
);

export const getNote = async (noteId: string): Promise<Note> => {
  const note = get(miApi).request("notes/show", {
    noteId
  })

  return note;
}

export const addEmoji = async (request: Omit<AdminEmojiAddRequest, 'file'>, file: File) => {
  const formData = new FormData();
  formData.append("i", get(accessToken));
  formData.append("file", file);

  const res = await get(miApi).fetch(
    `${get(serverUrl)}/api/drive/files/create`,
    { method: "POST", body: formData, headers: {} }
  ).then(res => res.json())// as any as DriveFilesCreateResponse
  if ('error' in res) throw res.error;

  await get(miApi).request("admin/emoji/add", {
    ...request, fileId: res.id,
  });
}

export async function fetchViaCorsAnywhere(url: string): ReturnType<typeof fetch> {
  return fetch(get(corsAnywhereUrl) + url);
}

export async function fetchImage(url: string, filename: string): Promise<File> {
  const response = await fetchViaCorsAnywhere(url);
  if (!response.ok) {
    throw new Error(`画像の取得に失敗しました: ${response.status}`);
  }

  const blob = await response.blob();

  return new File([blob], filename, { type: blob.type });
}

export async function getEmojisBulk(rawQuery: string): Promise<EmojiDetailed[]> {
  const re = new RegExp(EMOJINAME_REGEXP1, 'g');
  const query = [...rawQuery.matchAll(re)].map(m => m[0]).join('');
  if (query === '') return [];

  let emojis: EmojiDetailed[] = [];
  let untilId: string | null = null;
  for (;;) {
    const newEmojis = await get(miApi).request("admin/emoji/list", {
      query,
      limit: 100,
      ...(untilId !== null ? { untilId } : {}),
    }) as EmojiDetailed[]; // misskey-jsが古くなっており型が合わないためasでごまかす
    if (newEmojis.length === 0) break;
    emojis = emojis.concat(newEmojis);
    untilId = newEmojis.at(-1)!.id;
  }
  return emojis;
}

export async function deleteEmojis(emojis: EmojiDetailed[]) {
  await get(miApi).request("admin/emoji/delete-bulk", {
    ids: emojis.map(v => v.id),
  });
}
