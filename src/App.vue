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
  max-width: 1120px;
  margin: 0 auto;
  padding: 32px 24px 48px;
}

.app-header {
  margin-bottom: 24px;
}

.app-header h1 {
  margin: 0;
  font-size: 1.75rem;
  line-height: 1.25;
}

.app-intro {
  max-width: 60ch;
  margin: 6px 0 0;
  color: var(--color-text-muted);
}

/* Panels stretch to the same height so the two columns line up. */
.app-main {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}

.panel {
  min-width: 0;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius);
  padding: 20px 24px 24px;
  background: var(--color-surface);
  box-shadow: var(--shadow-panel);
}

.panel h2 {
  margin: 0 0 20px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--color-border-subtle);
  font-size: 1.125rem;
  line-height: 1.4;
}

.save-error {
  margin: 16px 0 0;
  padding: 10px 12px;
  border: 1px solid var(--color-danger);
  border-left-width: 4px;
  border-radius: 6px;
  color: var(--color-danger);
  background: #fff5f5;
}

.save-error:empty {
  display: none;
}

@media (max-width: 720px) {
  .app-shell {
    padding: 20px 16px 32px;
  }

  .app-main {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  .panel {
    padding: 16px;
  }
}
</style>
