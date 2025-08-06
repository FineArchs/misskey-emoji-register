import { api } from "misskey-js"

import { serverUrl, accessToken } from "./store";
import { get } from "svelte/store";
import type { APIClient } from "misskey-js/api.js";
import type { AdminEmojiAddRequest, DriveFilesCreateResponse, Note } from "misskey-js/entities.js";

let miApi: APIClient;

export const init = () => {
  miApi = new api.APIClient({
    origin: get(serverUrl),
    credential: get(accessToken),
  })
}

export const getNote = async (noteId: string): Promise<Note> => {
  const note = miApi.request("notes/show", {
    noteId
  })

  return note;
}

export const addEmoji = async (request: Omit<AdminEmojiAddRequest, 'file'>, file: File) => {
  const formData = new FormData();
  formData.append("i", get(accessToken));
  formData.append("file", file);

  const res = await miApi.fetch(
    `${get(serverUrl)}/api/drive/files/create`,
    { method: "POST", body: formData, headers: {} }
  ).then(res => res.json())// as any as DriveFilesCreateResponse
  if ('error' in res) throw res.error;

  await miApi.request("admin/emoji/add", {
    ...request, fileId: res.id,
  });
}

export async function fetchImage(url: string): Promise<File> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`画像の取得に失敗しました: ${response.status}`);
  }

  const blob = await response.blob();

  // URLからファイル名を抽出
  const urlObj = new URL(url);
  let fileName = urlObj.pathname.split('/').pop() || 'downloaded_image';

  // ファイル名に拡張子が含まれていない場合、MIMEタイプから拡張子を推測
  if (!fileName.includes('.')) {
    const mimeType = blob.type;
    const extension = mimeType.split('/').pop();
    fileName += `.${extension}`;
  }

  return new File([blob], fileName, { type: blob.type });
}
