<script lang="ts">
import { miApiReady, getEmojisBulk, deleteEmojis } from '../lib/misskey';

export function show() {
  dialogRoot.show();
}

let dialogRoot: HTMLDialogElement;
let deleteEmojisText = $state('');
let deleteEmojisFetched = $state<
  Awaited<ReturnType<typeof getEmojisBulk>>
>([]);
let deleteEmojisJsonUrl = $state('');
let deleteEmojisFileName = $state('');
let deleteEmojisBackupDone = $state(false);
let deleteEmojisDone = $state(false);

async function fetchDeletedEmojis() {
  deleteEmojisFetched = await getEmojisBulk(deleteEmojisText);
}

$effect(() => {
  const json = JSON.stringify(deleteEmojisFetched);
  const blob = new Blob([json], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  deleteEmojisJsonUrl = url;
  deleteEmojisFileName = [
    'EmojiBackup (',
    deleteEmojisFetched.length === 0 ? 'empty' : [
      deleteEmojisFetched[0].name,
      deleteEmojisFetched.length === 1 ? [] : [
        ` and ${deleteEmojisFetched.length - 1} emojis`,
      ],
    ],
    ').json',
  ].flat().join('')
  deleteEmojisBackupDone = false;
  deleteEmojisDone = false;
  return () => URL.revokeObjectURL(url);
});
</script>
<dialog bind:this={dialogRoot} class="modal">
  <div class="modal-box">
    <div class="text-xl">ツール</div>
    <div class="divider"></div>
    <div class="text-lg">絵文字一括削除</div>
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>
    <textarea
      class="textarea textarea-bordered h-32 w-full"
      disabled={!$miApiReady}
      bind:value={deleteEmojisText}
    ></textarea>
    {#if $miApiReady}
      <div class="text-xs">削除する絵文字名が<code>::</code>で挟まれているテキストを貼り付けてください</div>
      <button
        class="btn"
        disabled={deleteEmojisText === ""}
        onclick={fetchDeletedEmojis}
      >絵文字情報取得</button>
      {#if deleteEmojisFetched.length !== 0}
        <div class="text-xs">以下の絵文字が削除されます</div>
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>画像</th>
              <th>ライセンス</th>
            </tr>
          </thead>
          <tbody>
            {#each deleteEmojisFetched as emoji}
              <tr>
                <td><img class="h-8 inline-block" src={emoji.url} alt={`:${emoji.name}:`} /></td>
                <td>{emoji.license}</td>
              </tr>
            {/each}
          </tbody>
        </table>
        <div class="text-sm">
          先に絵文字データのバックアップを取ってください。
          <a
            class="btn btn-xs inline-block"
            href={deleteEmojisJsonUrl}
            download={deleteEmojisFileName}
            onclick={() => deleteEmojisBackupDone = true}
          >
            ダウンロード
          </a>
        </div>
        <button
          class="btn btn-primary"
          disabled={!deleteEmojisBackupDone || deleteEmojisDone}
          onclick={() => deleteEmojis(deleteEmojisFetched).then(() => deleteEmojisDone = true)}
        >削除を実行</button>
        {#if deleteEmojisDone}削除完了{/if}
      {/if}
    {:else}
      <div class="text-xs">絵文字一括削除ツールを使用するにはトップページでサーバーURLとアクセストークンを入力してください</div>
    {/if}
  </div>
  <!-- 背景クリックで閉じれるようにするやつ -->
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
