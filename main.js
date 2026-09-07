import { Schema } from 'prosemirror-model'
import { EditorState } from 'prosemirror-state'
import { EditorView } from 'prosemirror-view'

const params = new URLSearchParams(location.search)
// ?debug=1 (also a checkbox on the page): pretend prosemirror-view had the
// proposed `ignoreForSelection` option, by setting the private field it already
// reads for `relaxedSide` widgets on the label element.
const debug = params.get('debug') === '1'

const schema = new Schema({
  nodes: {
    doc: { content: 'paragraph+' },
    paragraph: { content: 'text*', toDOM: () => ['p', 0], parseDOM: [{ tag: 'p' }] },
    text: {},
  },
  marks: {
    mention: {
      attrs: { label: {} },
      inclusive: false,
      toDOM: (mark) => ['span', { class: 'mention', 'data-label': mark.attrs.label }, 0],
      parseDOM: [{ tag: 'span.mention', getAttrs: (dom) => ({ label: dom.dataset.label }) }],
    },
  },
})

// A mention is rendered as a non-editable label followed by its editable source text:
//
//   <span class="mention" data-dom>
//     <span class="label" contenteditable="false">TeamA</span>
//     <span class="source" data-content-dom>@Alice</span>
//   </span>
//
// The DOM position right before <span class="mention"> and the DOM position at
// the start of the source text are the same document position.
function mentionView(mark) {
  const dom = document.createElement('span')
  dom.className = 'mention'
  dom.setAttribute("data-dom", "")

  const label = document.createElement('span')
  label.className = 'label'
  label.contentEditable = 'false'
  label.textContent = mark.attrs.label

  const contentDOM = document.createElement('span')
  contentDOM.className = 'source'
  contentDOM.setAttribute('data-content-dom', '')

  dom.append(label, contentDOM)
  if (debug) label.pmViewDesc = { ignoreForSelection: true }
  return { dom, contentDOM }
}

function createMention({ label, text }) {
  return schema.text(text, [schema.marks.mention.create({ label })])
}

// The first paragraph starts with a mention, the second has text before it.
const doc = schema.node('doc', null, [
  schema.node('paragraph', null, [createMention({ label: 'TeamA', text: '@Alice' }), schema.text(' wrote this')]),
  schema.node('paragraph', null, [schema.text('Hello '), createMention({ label: 'TeamB', text: '@Bob' }), schema.text(' wrote that')]),
])

const view = new EditorView(document.getElementById('editor'), {
  state: EditorState.create({ doc }),
  markViews: { mention: mentionView },
  dispatchTransaction(tr) {
    view.updateState(view.state.apply(tr))
    if (tr.docChanged) log(`document is now ${JSON.stringify(view.state.doc.toJSON().content.map((p) => p.content))}`)
  },
})
window.view = view

// The log: after every selectionchange, the DOM position of the selection and
// the document position ProseMirror maps it to. Also written to the console,
// which `vite dev` forwards to its terminal (`server.forwardConsole`).
const logEl = document.getElementById('log')
function log(text) {
  const now = new Date()
  const line = `${now.toISOString().replace(/.*T/, '').replace('Z', '')} ${text}`
  logEl.textContent += line + '\n'
  logEl.scrollTop = logEl.scrollHeight
  console.log(line)
}
function describe(node, offset) {
  const name = (el) => el.tagName.toLowerCase() + (el.className ? '.' + el.className : '')
  return node.nodeType === 3 ? `${name(node.parentNode)} text@${offset}` : `${name(node)}@${offset}`
}
document.addEventListener('selectionchange', () => {
  const { anchorNode, anchorOffset } = getSelection()
  if (anchorNode) log(`selectionchange: ${describe(anchorNode, anchorOffset)}  (document position ${view.state.selection.head})`)
})

const debugBox = document.getElementById('debug')
debugBox.checked = debug
debugBox.onchange = () => { params.set('debug', debugBox.checked ? '1' : '0'); location.search = params.toString() }
