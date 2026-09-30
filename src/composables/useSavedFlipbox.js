import { onBeforeUnmount, ref, watch } from 'vue';
import { loadFromStorage, saveToStorage } from './usePersistence';

// Versioned so a future change to the data shape can migrate or discard
// old saves instead of loading something the app no longer understands.
const STORAGE_KEY = 'flipbox-builder:flipbox';
const SCHEMA_VERSION = 1;
const SAVE_DELAY_MS = 400;

function emptyFlipbox() {
  return { front: '', back: '', updatedAt: null };
}

// Storage is user-editable and may hold an older or corrupted save, so
// only accept the fields we expect, with the types we expect.
function parseSaved(saved) {
  if (!saved || saved.version !== SCHEMA_VERSION) return emptyFlipbox();
  const { front, back, updatedAt } = saved.flipbox ?? {};
  return {
    front: typeof front === 'string' ? front : '',
    back: typeof back === 'string' ? back : '',
    updatedAt: typeof updatedAt === 'string' ? updatedAt : null,
  };
}

// Loads the saved flipbox synchronously (so the first render already has
// it) and saves changes back after a short pause in typing. Pending saves
// are flushed when the tab is hidden or closed so nothing is lost.
export function useSavedFlipbox() {
  const flipbox = ref(parseSaved(loadFromStorage(STORAGE_KEY)));
  const saveFailed = ref(false);
  let timer = null;

  function save() {
    clearTimeout(timer);
    timer = null;
    saveFailed.value = !saveToStorage(STORAGE_KEY, {
      version: SCHEMA_VERSION,
      flipbox: flipbox.value,
    });
  }

  function flush() {
    if (timer) save();
  }

  watch(
    () => [flipbox.value.front, flipbox.value.back],
    () => {
      flipbox.value.updatedAt = new Date().toISOString();
      clearTimeout(timer);
      timer = setTimeout(save, SAVE_DELAY_MS);
    },
  );

  const onVisibilityChange = () => {
    if (document.visibilityState === 'hidden') flush();
  };
  document.addEventListener('visibilitychange', onVisibilityChange);
  window.addEventListener('pagehide', flush);

  onBeforeUnmount(() => {
    flush();
    document.removeEventListener('visibilitychange', onVisibilityChange);
    window.removeEventListener('pagehide', flush);
  });

  return { flipbox, saveFailed };
}
