<script lang="ts">
  import { MiAuth } from "../lib/miauth.svelte";

  const miauth = new MiAuth();
  let { url, permissions } = localStorage.getItem('mitokengen-datas');
</script>

<main class="h-screen w-screen">
  <div class="navbar bg-base-300">
    <div class="navbar-start w-full break-keep">
      <h1 class="text-xl">Misskeyトークン発行機</h1>
    </div>
  </div>

  <div class="p-4">
  </div>
</main>
