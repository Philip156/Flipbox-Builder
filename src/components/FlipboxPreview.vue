<template>
  <div class="flipbox-preview">
    <p class="side-status">
      Showing: <strong>{{ isBack ? 'Back' : 'Front' }}</strong>
      (side {{ isBack ? 2 : 1 }} of 2)
    </p>

    <div :id="cardId" class="flipbox" :class="{ 'is-flipped': isBack }">
      <div class="flipbox-inner">
        <section
          class="flipbox-face flipbox-front"
          aria-label="Front side"
          :inert="isBack"
          :aria-hidden="isBack ? 'true' : undefined"
        >
          <span class="face-tag" aria-hidden="true">Front</span>
          <p v-if="frontEmpty" class="empty-state">Nothing on the front yet.</p>
          <div v-else class="flipbox-content" v-html="flipbox.front"></div>
        </section>

        <section
          class="flipbox-face flipbox-back"
          aria-label="Back side"
          :inert="!isBack"
          :aria-hidden="isBack ? undefined : 'true'"
        >
          <span class="face-tag" aria-hidden="true">Back</span>
          <p v-if="backEmpty" class="empty-state">Nothing on the back yet.</p>
          <div v-else class="flipbox-content" v-html="flipbox.back"></div>
        </section>
      </div>
    </div>

    <button type="button" class="flip-button" :aria-controls="cardId" @click="flip">
      {{ isBack ? 'Flip to front' : 'Flip to back' }}
    </button>

    <!-- Empty until the first flip so nothing is announced on page load. -->
    <p class="visually-hidden" aria-live="polite">{{ announcement }}</p>
  </div>
</template>

<script setup>
  import { computed, ref, useId } from 'vue';

  const props = defineProps({
    flipbox: {
      type: Object,
      required: true,
    },
  });

  const cardId = useId();
  const side = ref('front');
  const isBack = computed(() => side.value === 'back');
  const announcement = ref('');

  // TipTap emits `<p></p>` for an empty document, so strip tags before
  // checking for content.
  const isEmpty = html => !html || !html.replace(/<[^>]*>/g, '').trim();
  const frontEmpty = computed(() => isEmpty(props.flipbox.front));
  const backEmpty = computed(() => isEmpty(props.flipbox.back));

  function flip() {
    side.value = isBack.value ? 'front' : 'back';
    announcement.value = isBack.value ? 'Showing back' : 'Showing front';
  }
</script>

<style scoped>
  .flipbox-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
  }

  .side-status {
    margin: 0;
  }

  .flipbox {
    width: 280px;
    max-width: 100%;
    min-width: 0;
    perspective: 1000px;
  }

  /* Both faces share one grid cell so the card grows to fit the taller side. */
  .flipbox-inner {
    display: grid;
    transform-style: preserve-3d;
    transition: transform 0.5s ease;
  }

  .is-flipped .flipbox-inner {
    transform: rotateY(180deg);
  }

  .flipbox-face {
    grid-area: 1 / 1;
    position: relative;
    min-height: 180px;
    overflow-wrap: anywhere;
    border: 1px solid #d0d7de;
    border-radius: 8px;
    padding: 32px 16px 16px;
    background: #ffffff;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
  }

  .flipbox-back {
    background: #f6f8fa;
    transform: rotateY(180deg);
  }

  .face-tag {
    position: absolute;
    top: 8px;
    left: 12px;
    font-size: 0.75rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    color: #57606a;
  }

  .empty-state {
    margin: 0;
    font-style: italic;
    color: #57606a;
  }

  .flipbox-content :deep(p) {
    margin: 0 0 8px;
  }

  .flipbox-content :deep(ul),
  .flipbox-content :deep(ol) {
    margin: 0 0 8px;
    padding-left: 24px;
  }
  .flipbox-content :deep(pre) {
    white-space: pre-wrap;
  }

  .flipbox-content :deep(> :last-child) {
    margin-bottom: 0;
  }

  .visually-hidden {
    position: absolute;
    width: 1px;
    height: 1px;
    padding: 0;
    margin: -1px;
    overflow: hidden;
    clip: rect(0, 0, 0, 0);
    white-space: nowrap;
    border: 0;
  }

  @media (prefers-reduced-motion: reduce) {
    .flipbox-inner {
      transition: none;
    }
  }
</style>
