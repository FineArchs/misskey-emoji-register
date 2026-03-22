import { api } from "misskey-js"

import { serverUrl, accessToken, corsAnywhereUrl } from "./store";
import { get, derived } from "svelte/store";
import type { APIClient } from "misskey-js/api.js";
import type { AdminEmojiAddRequest, DriveFilesCreateResponse, Note } from "misskey-js/entities.js";

const miApi = derived(
  [serverUrl, accessToken],
  ([$serverUrl, $accessToken]) => new api.APIClient({
    origin: $serverUrl,
    credential: $accessToken,
  }),
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

export async function fetchImage(url: string, filename: string): Promise<File> {
  const response = await fetch(get(corsAnywhereUrl) + url);
  if (!response.ok) {
    throw new Error(`画像の取得に失敗しました: ${response.status}`);
  }

  const blob = await response.blob();

  return new File([blob], filename, { type: blob.type });
}
