<script lang="ts">
import { corsAnywhereUrl, emojiRoboUrl } from '../../lib/store';
import { fetchViaCorsAnywhere } from '../../lib/misskey';


let intervalId: null | number = $state(null);

function activate() {
  intervalId = setInterval(sendRequest, 3000);
}

function deactivate() {
  if (intervalId != null) clearInterval(intervalId);
  intervalId = null;
}

function sendRequest() {
  fetchViaCorsAnywhere($emojiRoboUrl);
}
</script>

<div>
  <div class="text-lg">絵文字追加通知bot起動</div>
  <div>
    <label for="default-ffmpeg-args">emojirobo URL</label>
    <input
      id="emoji-robo-url"
      bind:value={$emojiRoboUrl}
      type="text"
      class="input input-xs input-bordered input-md w-full"
      placeholder="EX: https://example-emoji-robo.com"
    />
  </div>
  {#if intervalId == null}
    <button
      class="btn"
      onclick={activate}
      disabled={!$corsAnywhereUrl || !$emojiRoboUrl}
    >
      起動
    </button>
  {:else}
    <button
      class="btn"
      onclick={deactivate}
    >
      停止
    </button>
    <div class="text-sm">動作中…</div>
  {/if}
  {#if !$corsAnywhereUrl}
    <div class="text-xs">絵文字追加通知bot起動ツールを使用するにはトップページでcors-anywhere URLを入力してください</div>
  {/if}
  {#if !$emojiRoboUrl}
    <div class="text-xs">絵文字追加通知bot起動ツールを使用するにはemojirobo URLを入力してください</div>
  {/if}
</div>
