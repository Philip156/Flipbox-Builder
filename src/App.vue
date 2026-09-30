<template>
  <div class="app-shell">
    <header class="app-header">
      <h1>Flipbox Builder</h1>
    </header>
    <!--
      Starter layout: builder and preview shown side by side, both driven
      by the same reactive `flipbox` state, so the preview updates live
      as you edit - no manual save/refresh needed.

      You are free to restructure this (e.g. a toggle between builder and
      preview "modes" on the same page) as long as the preview still
      updates live and does not require a separate browser tab or window.
      See the task spec's "Layout" note under Flipbox component.
    -->
    <main class="app-main">
      <section class="panel" aria-labelledby="builder-heading">
        <h2 id="builder-heading">Builder</h2>
        <FlipboxBuilder v-model="flipbox" />
        <!-- Only speaks up on failure; saving normally happens silently. -->
        <p class="save-error" role="alert">
          <template v-if="saveFailed">
            Your changes couldn't be saved in this browser, so they'll be lost if you
            refresh. Storage may be full or disabled.
          </template>
        </p>
      </section>

      <section class="panel" aria-labelledby="preview-heading">
        <h2 id="preview-heading">Preview</h2>
        <FlipboxPreview :flipbox="flipbox" />
      </section>
    </main>
  </div>
</template>

<script setup>
import FlipboxBuilder from './components/FlipboxBuilder.vue';
import FlipboxPreview from './components/FlipboxPreview.vue';
import { useSavedFlipbox } from './composables/useSavedFlipbox';

// Shared by the builder and preview. Restored from localStorage on load
// and saved automatically as it changes.
const { flipbox, saveFailed } = useSavedFlipbox();
</script>

<style scoped>
.app-shell {
  max-width: 1100px;
  margin: 0 auto;
  padding: 24px;
}

.app-header {
  margin-bottom: 24px;
}

.app-header h1 {
  margin: 0;
}

.app-main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: start;
}

.panel {
  min-width: 0;
  border: 1px solid #d0d7de;
  border-radius: 8px;
  padding: 16px;
  background: #ffffff;
}

.panel h2 {
  margin-top: 0;
}

.save-error {
  margin: 12px 0 0;
  color: #cf222e;
}

.save-error:empty {
  display: none;
}

@media (max-width: 720px) {
  .app-main {
    grid-template-columns: 1fr;
  }
}
</style>
