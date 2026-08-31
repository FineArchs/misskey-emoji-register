<script lang="ts">
import EmojiBulkDeleter from './tools/EmojiBulkDeleter.svelte';
import EmojiRoboActivator from './tools/EmojiRoboActivator.svelte';

export function show() {
  dialogRoot.show();
}
let dialogRoot: HTMLDialogElement;
</script>
<dialog bind:this={dialogRoot} class="modal">
  <div class="modal-box">
    <div class="text-xl">ツール</div>
    <form method="dialog">
      <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">✕</button>
    </form>

    <div class="divider"></div>
    <EmojiBulkDeleter />
    <div class="divider"></div>
    <EmojiRoboActivator />
  </div>
  <!-- 背景クリックで閉じれるようにするやつ -->
  <form method="dialog" class="modal-backdrop">
    <button>close</button>
  </form>
</dialog>
