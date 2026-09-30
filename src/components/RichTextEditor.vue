<template>
  <div class="rich-text-editor">
    <!--
      Follows the WAI-ARIA toolbar pattern: one tab stop, arrow keys move
      between buttons. Unavailable actions use aria-disabled rather than
      disabled so the focused button never drops out of the tab order.
    -->
    <div ref="toolbarEl" class="toolbar" role="toolbar" aria-label="Text formatting" :aria-controls="editorId" @keydown="onToolbarKeydown">
      <div class="toolbar-groups">
        <div v-for="(group, groupIndex) in toolbarGroups" :key="groupIndex" class="toolbar-group">
          <button
            v-for="control in group"
            :key="control.name"
            type="button"
            :tabindex="control.index === focusIndex ? 0 : -1"
            :aria-label="control.label"
            :aria-pressed="control.isActive ? control.isActive() : undefined"
            :aria-disabled="control.isDisabled?.() || undefined"
            :aria-keyshortcuts="control.shortcut"
            :title="control.title"
            @click="runControl(control)"
            @focus="focusIndex = control.index"
          >
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              aria-hidden="true"
              focusable="false"
            >
              <path :d="control.icon" />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <EditorContent :editor="editor" class="editor-content" />
  </div>
</template>

<script setup>
  import { onBeforeUnmount, ref, useId, watch } from 'vue';
  import { Editor, EditorContent } from '@tiptap/vue-3';
  import StarterKit from '@tiptap/starter-kit';

  const props = defineProps({
    labelledby: { type: String, required: true },
    modelValue: {
      type: String,
      default: '',
    },
  });
  const emit = defineEmits(['update:modelValue']);

  const editorId = `rich-text-${useId()}`;

  // StarterKit includes bold, italic, bullet list, ordered list, undo/redo
  const editor = new Editor({
    extensions: [StarterKit],
    content: props.modelValue,
    editorProps: {
      attributes: {
        id: editorId,
        role: 'textbox',
        'aria-labelledby': props.labelledby,
        'aria-multiline': 'true',
      },
    },
    onUpdate: ({ editor: currentEditor }) => {
      emit('update:modelValue', currentEditor.getHTML());
    },
  });

  // Keeps the editor in sync if modelValue is changed from outside this
  // component (for example, loaded from storage after a refresh).
  watch(
    () => props.modelValue,
    value => {
      const isSame = value === editor.getHTML();
      if (!isSame) {
        editor.commands.setContent(value || '', { emitUpdate: false });
      }
    },
  );

  // Tiptap's shortcuts use Cmd on Apple devices and Ctrl elsewhere, so
  // describe them the same way. `aria-keyshortcuts` needs the standard key
  // names; the tooltip uses the names people see on their keyboard.
  const isApple = /Mac|iPhone|iPad/.test(navigator.userAgent);
  function shortcut(label, ...keys) {
    const ariaNames = { Mod: isApple ? 'Meta' : 'Control' };
    const visibleNames = { Mod: isApple ? 'Cmd' : 'Ctrl', Alt: isApple ? 'Option' : 'Alt' };
    return {
      shortcut: keys.map(key => ariaNames[key] ?? key).join('+'),
      title: `${label} (${keys.map(key => visibleNames[key] ?? key).join('+')})`,
    };
  }

  // Grouped for visual dividers.
  const toolbarGroups = [
    [
      {
        name: 'paragraph',
        icon: 'M13 4v16M17 4v16M19 4H9.5a4.5 4.5 0 0 0 0 9H13',
        label: 'Paragraph',
        ...shortcut('Paragraph', 'Mod', 'Alt', '0'),
        // List items contain paragraphs too, so only count a paragraph as
        // active when it isn't inside a list.
        isActive: () =>
          editor.isActive('paragraph') &&
          !editor.isActive('bulletList') &&
          !editor.isActive('orderedList'),
        // clearNodes lifts the selection out of any list, then sets a paragraph.
        run: chain => chain.clearNodes().setParagraph(),
      },
    ],
    [
      {
        name: 'bold',
        icon: 'M14 12a4 4 0 0 0 0-8H6v8M15 20a4 4 0 0 0 0-8H6v8Z',
        label: 'Bold',
        ...shortcut('Bold', 'Mod', 'B'),
        isActive: () => editor.isActive('bold'),
        run: chain => chain.toggleBold(),
      },
      {
        name: 'italic',
        icon: 'M19 4h-9M14 20H5M15 4 9 20',
        label: 'Italic',
        ...shortcut('Italic', 'Mod', 'I'),
        isActive: () => editor.isActive('italic'),
        run: chain => chain.toggleItalic(),
      },
    ],
    [
      {
        name: 'bulletList',
        icon: 'M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01',
        label: 'Bulleted list',
        ...shortcut('Bulleted list', 'Mod', 'Shift', '8'),
        isActive: () => editor.isActive('bulletList'),
        run: chain => chain.toggleBulletList(),
      },
      {
        name: 'orderedList',
        icon: 'M10 6h11M10 12h11M10 18h11M4 6h1v4M4 10h2M6 18H4c0-1 2-2 2-3s-1-1.5-2-1',
        label: 'Numbered list',
        ...shortcut('Numbered list', 'Mod', 'Shift', '7'),
        isActive: () => editor.isActive('orderedList'),
        run: chain => chain.toggleOrderedList(),
      },
    ],
    [
      {
        name: 'undo',
        icon: 'M9 14 4 9l5-5M4 9h10.5a5.5 5.5 0 0 1 0 11H11',
        label: 'Undo',
        ...shortcut('Undo', 'Mod', 'Z'),
        isDisabled: () => !editor.can().undo(),
        run: chain => chain.undo(),
      },
      {
        name: 'redo',
        icon: 'm15 14 5-5-5-5M20 9H9.5a5.5 5.5 0 0 0 0 11H13',
        label: 'Redo',
        ...shortcut('Redo', 'Mod', 'Shift', 'Z'),
        isDisabled: () => !editor.can().redo(),
        run: chain => chain.redo(),
      },
    ],
  ];
  toolbarGroups.flat().forEach((control, index) => {
    control.index = index;
  });

  const toolbarEl = ref(null);
  const focusIndex = ref(0);

  function runControl(control) {
    if (control.isDisabled?.()) return;
    control.run(editor.chain().focus()).run();
  }

  function onToolbarKeydown(event) {
    const buttons = [...toolbarEl.value.querySelectorAll('button')];
    const last = buttons.length - 1;
    const targets = {
      ArrowRight: focusIndex.value === last ? 0 : focusIndex.value + 1,
      ArrowLeft: focusIndex.value === 0 ? last : focusIndex.value - 1,
      Home: 0,
      End: last,
    };
    const next = targets[event.key];
    if (next === undefined) return;
    event.preventDefault();
    focusIndex.value = next;
    buttons[next].focus();
  }

  onBeforeUnmount(() => {
    editor.destroy();
  });

  defineExpose({ editor });
</script>

<style scoped>
  /* The outer border marks the edge of an input, so it uses the 3:1 control colour. */
  .rich-text-editor {
    border: 1px solid var(--color-border-control);
    border-radius: var(--radius);
    background: var(--color-surface);
  }

  .toolbar {
    padding: 4px 0;
    border-bottom: 1px solid var(--color-border-subtle);
    border-radius: calc(var(--radius) - 1px) calc(var(--radius) - 1px) 0 0;
    background: var(--color-surface-muted);
  }

  /*
   * Each group draws its divider as a left border, pulled 1px outside this
   * container. overflow: hidden clips that border on whichever group starts
   * a row, so a wrapped row never begins with a stray divider.
   */
  .toolbar-groups {
    display: flex;
    flex-wrap: wrap;
    row-gap: 2px;
    overflow: hidden;
  }

  .toolbar-group {
    display: flex;
    gap: 2px;
    margin-left: -1px;
    /* Vertical padding leaves room for the focus ring inside the clip. */
    padding: 3px 8px;
    border-left: 1px solid var(--color-border-subtle);
  }

  .toolbar button {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 32px;
    height: 32px;
    padding: 0;
    border: 1px solid transparent;
    border-radius: 6px;
    background: transparent;
    color: var(--color-text);
  }

  .toolbar button:hover {
    background: #e6eaef;
  }

  .toolbar button:focus-visible {
    outline: var(--focus-ring);
    outline-offset: 1px;
  }

  /* The border is the on/off cue, so it needs 3:1 against the toolbar (WCAG 1.4.11). */
  .toolbar button[aria-pressed='true'] {
    background: var(--color-accent-subtle);
    border-color: var(--color-accent);
    color: var(--color-accent-hover);
  }

  .toolbar button[aria-disabled='true'] {
    color: #8c959f;
    cursor: not-allowed;
    background: transparent;
  }

  /* High-contrast modes drop custom backgrounds, which would hide the pressed state. */
  @media (forced-colors: active) {
    .toolbar button[aria-pressed='true'] {
      forced-color-adjust: none;
      background: Highlight;
      border-color: Highlight;
      color: HighlightText;
    }

    .toolbar button[aria-disabled='true'] {
      color: GrayText;
    }
  }

  /*
   * Padding and height sit on the editable element itself so the whole box
   * is clickable and the focus ring outlines the full writing area.
   */
  .editor-content :deep(.tiptap) {
    min-height: 140px;
    padding: 12px 14px;
    border-radius: 0 0 calc(var(--radius) - 1px) calc(var(--radius) - 1px);
    overflow-wrap: anywhere;
  }

  .editor-content :deep(.tiptap:focus-visible) {
    outline: var(--focus-ring);
    outline-offset: -2px;
  }

  .editor-content :deep(p) {
    margin: 0 0 8px;
  }

  .editor-content :deep(ul),
  .editor-content :deep(ol) {
    margin: 0 0 8px;
    padding-left: 24px;
  }

  .editor-content :deep(.tiptap > :last-child) {
    margin-bottom: 0;
  }

  .editor-content :deep(pre) {
    white-space: pre-wrap;
  }
</style>
