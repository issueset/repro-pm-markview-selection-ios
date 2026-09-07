



# Caret flickers across a mark view with `contenteditable=false` child

Online demo: https://issueset.github.io/repro-pm-markview-selection-ios/

Source code: https://github.com/issueset/repro-pm-markview-selection-ios/

A `mention` mark view renders a non-editable label followed by the editable source text:

```
<span class="mention" data-dom>
  <span class="label" contenteditable="false">🅰️TeamA</span>
  <span class="source" data-content-dom>🅱️@Alice</span>
</span>
```

🅰️ and 🅱️ are different DOM positions, but they should be treated as the same ProseMirror document position.

However, [`isEquivalentPosition`](https://code.haverbeke.berlin/prosemirror/prosemirror-view/src/tag/1.42.3/src/dom.ts#L39) treats them as different ProseMirror positions because its scan stops at the `contenteditable=false` element. So whenever the browser places the text caret on 🅰️, `prosemirror-view` moves it to 🅱️, causing the caret to flicker.

More specifically, this causes the following behavior:

1. On macOS Chrome, I cannot press `ArrowRight` to move the caret across the mark view.

   https://github.com/user-attachments/assets/fac4e64a-8013-4943-8336-c3d35f1e7cb1

2. On iOS Safari, I cannot long-press the spacebar to move the caret across the mark view.

   https://github.com/user-attachments/assets/8885a829-e593-4d3b-9ce9-ce87f153310e
