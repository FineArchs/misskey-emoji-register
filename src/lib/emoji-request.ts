import type { Note } from "misskey-js/entities.js";
import type { Emoji } from "./store";

const SPLITCHAR = "▼";
const TAGSPLITCHAR = / |　/;
const REPEATCHAR = "★";

const requiredFields: [string, (text: string, emoji: Partial<Emoji>) => (void | string)][] = [
  // 絵文字名 :emoji_name:
  ["①", (text, emoji) => {
    const emojiName = extractEmojiName(text);
    if (emojiName == null) return "項目①の行に絵文字コードが含まれません";
    emoji.name = extractEmojiName(text);
  }],
  // ライセンス
  ["②", (text, emoji) => emoji.license = text],
  // 画像の出所
  ["③", (text, emoji) => emoji.from = text],
  // 元ネタなど
  ["④", (text, emoji) => emoji.description = text],
  // タグ
  ["⑤", (text, emoji) => emoji.tag = text.split(TAGSPLITCHAR)],
  // カテゴリ（使用されていない）
  // ["⑥",
  // センシティブ指定（使用されていない）
  // ["⑦",
  // ローカル限定指定（使用されていない）
  // ["⑧",
];
const numberings = requiredFields.map(v => v[0]);
const numberingRegexp = new RegExp("(" + numberings.join("|") + ")");

function extractEmojiName(text: string): Emoji | null {
  const matches = text.match(/:([a-z0-9_+-]+):/i);
  if (matches == null) throw new Error();
  return matches[1];
}

export function parseEmojiRequest(note: Note): (Emoji | string)[] {
  if (note.text == null) return ["ノートに本文がありません"];
  if (note.file == null) return ["ノートに画像が添付されていません"];

  const splitTexts = note.text.split(SPLITCHAR);
  const emojis: (Emoji | string)[];

  emojis = splitTexts.map((val, index) => {

    if (note.file.length <= index) return "対応する画像がありません";
    const numberingErrors = numberings.flatMap(num => {
      const count = val.split(num).length;
      if (count === 2) return [];
      if (count === 1) return num + "がありません";
      return `${num}が${count}つあります`;
    });
    if (numberingErrors.length > 0) return numberingErrors.join("\n");

    const emoji: Partial<Emoji> = {};

    const fieldTexts = val.split(numberingRegexp);
    let idx = 0;
    for (const i in fieldTexts) {
      
    while (true) {

    const fieldMatches = [...val.matchAll(new RegExp(
    const matchedNumberings = [...val.matchAll(numberingRegexp)].map(match => match[0]);
    matchedNumberings.shift();
    const 

    requiredFields.
