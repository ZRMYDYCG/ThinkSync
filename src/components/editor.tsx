'use client'

import '@/assets/css/editor.css'
import { $createCodeNode, CodeNode } from '@lexical/code'
import { $createLinkNode, AutoLinkNode, createLinkMatcherWithRegExp, LinkNode } from '@lexical/link'
import { $createListItemNode, $createListNode, ListItemNode, ListNode } from '@lexical/list'
import { AutoLinkPlugin } from '@lexical/react/LexicalAutoLinkPlugin'
import { LexicalComposer } from '@lexical/react/LexicalComposer'
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext'
import { ContentEditable } from '@lexical/react/LexicalContentEditable'
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary'
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin'
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin'
import { ListPlugin } from '@lexical/react/LexicalListPlugin'
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin'
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin'
import { $createHeadingNode, $createQuoteNode, HeadingNode, QuoteNode } from '@lexical/rich-text'
import {
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  type ElementNode,
  type TextFormatType,
} from 'lexical'
import { useLocale } from 'next-intl'
import React, { useEffect } from 'react'

import { $createImageNode, ImageNode } from './editor/image-node'

interface EditorProps {
  onChange: (value: string) => void
  initialContent?: string | null
  editable?: boolean
}

type LegacyInline =
  | string
  | { type?: string; text?: string; href?: string; styles?: Record<string, boolean> }
type LegacyBlock = {
  type?: string
  content?: LegacyInline[] | string
  props?: Record<string, unknown>
  children?: LegacyBlock[]
}

const theme = {
  heading: { h1: 'lexical-h1', h2: 'lexical-h2', h3: 'lexical-h3' },
  link: 'lexical-link',
  list: {
    listitem: 'lexical-list-item',
    nested: { listitem: 'lexical-nested-list-item' },
    ol: 'lexical-ol',
    ul: 'lexical-ul',
  },
  paragraph: 'lexical-paragraph',
  quote: 'lexical-quote',
  text: {
    bold: 'lexical-bold',
    code: 'lexical-inline-code',
    italic: 'lexical-italic',
    strikethrough: 'lexical-strikethrough',
    underline: 'lexical-underline',
  },
}

function appendLegacyInline(parent: ElementNode, content?: LegacyInline[] | string) {
  const items = typeof content === 'string' ? [content] : (content ?? [])
  for (const item of items) {
    if (typeof item === 'string') {
      parent.append($createTextNode(item))
      continue
    }
    const text = $createTextNode(item.text ?? '')
    const formats: Array<[string, TextFormatType]> = [
      ['bold', 'bold'],
      ['italic', 'italic'],
      ['underline', 'underline'],
      ['strike', 'strikethrough'],
      ['code', 'code'],
    ]
    for (const [style, format] of formats) if (item.styles?.[style]) text.toggleFormat(format)
    if ((item.type === 'link' || item.href) && item.href) {
      const link = $createLinkNode(item.href)
      link.append(text)
      parent.append(link)
    } else parent.append(text)
  }
}

function appendLegacyBlock(block: LegacyBlock) {
  const type = block.type ?? 'paragraph'
  if (type === 'image') {
    const src = typeof block.props?.url === 'string' ? block.props.url : ''
    if (src)
      $getRoot().append($createImageNode({ src, altText: String(block.props?.caption ?? '') }))
    return
  }
  if (type === 'bulletListItem' || type === 'numberedListItem' || type === 'checkListItem') {
    const list = $createListNode(
      type === 'numberedListItem' ? 'number' : type === 'checkListItem' ? 'check' : 'bullet',
    )
    const item = $createListItemNode()
    appendLegacyInline(item, block.content)
    list.append(item)
    $getRoot().append(list)
  } else {
    const node =
      type === 'heading'
        ? $createHeadingNode(
            `h${Math.min(3, Math.max(1, Number(block.props?.level) || 1))}` as 'h1' | 'h2' | 'h3',
          )
        : type === 'quote'
          ? $createQuoteNode()
          : type === 'codeBlock'
            ? $createCodeNode()
            : $createParagraphNode()
    appendLegacyInline(node, block.content)
    $getRoot().append(node)
  }
  block.children?.forEach(appendLegacyBlock)
}

function initializeLegacyContent(content: string) {
  const parsed = JSON.parse(content)
  if (Array.isArray(parsed)) {
    $getRoot().clear()
    parsed.forEach(appendLegacyBlock)
    if ($getRoot().isEmpty()) $getRoot().append($createParagraphNode())
  }
}

function getInitialEditorState(content?: string | null) {
  if (!content) return
  try {
    const parsed = JSON.parse(content)
    if (parsed?.root?.type === 'root') return content
    if (Array.isArray(parsed)) return () => initializeLegacyContent(content)
  } catch {
    return () =>
      $getRoot()
        .clear()
        .append($createParagraphNode().append($createTextNode(content)))
  }
}

const URL_MATCHER = /((https?:\/\/|www\.)[^\s]+)/
const matchers = [
  createLinkMatcherWithRegExp(URL_MATCHER, (text) =>
    text.startsWith('http') ? text : `https://${text}`,
  ),
]

const Editor = ({ onChange, initialContent, editable = true }: EditorProps) => {
  const locale = useLocale()
  const initialConfig = {
    namespace: 'ThinkSyncEditor',
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      ImageNode,
    ],
    theme,
    editable,
    onError(error: Error) {
      throw error
    },
    editorState: getInitialEditorState(initialContent),
  }
  const placeholder = locale === 'zh' ? '开始输入内容…' : 'Start writing…'

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className="lexical-shell">
        <div className="lexical-editor-container">
          <RichTextPlugin
            contentEditable={
              <ContentEditable className="lexical-content-editable" aria-label="Document editor" />
            }
            placeholder={<div className="lexical-placeholder">{placeholder}</div>}
            ErrorBoundary={LexicalErrorBoundary}
          />
          <ListPlugin />
          <LinkPlugin />
          <AutoLinkPlugin matchers={matchers} />
          <HistoryPlugin />
          <EditablePlugin editable={editable} />
          {editable && (
            <OnChangePlugin
              ignoreSelectionChange
              onChange={(state) => onChange(JSON.stringify(state.toJSON()))}
            />
          )}
        </div>
      </div>
    </LexicalComposer>
  )
}

function EditablePlugin({ editable }: { editable: boolean }) {
  const [editor] = useLexicalComposerContext()
  useEffect(() => editor.setEditable(editable), [editor, editable])
  return null
}

/* Toolbar intentionally omitted from the editor UI.
function EditorToolbar() {
  const [editor] = useLexicalComposerContext()
  const { uploadImage } = useUploadsApi()
  const fileRef = useRef<HTMLInputElement>(null)
  const [canUndo, setCanUndo] = useState(false)
  const [canRedo, setCanRedo] = useState(false)

  useEffect(() => {
    const undo = editor.registerCommand(
      CAN_UNDO_COMMAND,
      (value) => (setCanUndo(value), false),
      COMMAND_PRIORITY_LOW,
    )
    const redo = editor.registerCommand(
      CAN_REDO_COMMAND,
      (value) => (setCanRedo(value), false),
      COMMAND_PRIORITY_LOW,
    )
    return () => {
      undo()
      redo()
    }
  }, [editor])

  const setBlock = useCallback(
    (kind: 'paragraph' | 'h1' | 'h2' | 'quote' | 'code') => {
      editor.update(() => {
        const selection = $getSelection()
        if (!$isRangeSelection(selection)) return
        $setBlocksType(selection, () =>
          kind === 'h1' || kind === 'h2'
            ? $createHeadingNode(kind)
            : kind === 'quote'
              ? $createQuoteNode()
              : kind === 'code'
                ? $createCodeNode()
                : $createParagraphNode(),
        )
      })
    },
    [editor],
  )

  const addLink = () => {
    const url = window.prompt('请输入链接地址')
    if (url === null) return
    editor.dispatchCommand(TOGGLE_LINK_COMMAND, url.trim() || null)
  }

  const addImage = async (file?: File) => {
    if (!file) return
    const src = await uploadImage(file)
    editor.update(() =>
      $getRoot().append($createImageNode({ src, altText: file.name }), $createParagraphNode()),
    )
  }

  return (
    <div className="lexical-toolbar" role="toolbar" aria-label="Formatting options">
      <ToolButton
        label="撤销"
        disabled={!canUndo}
        onClick={() => editor.dispatchCommand(UNDO_COMMAND, undefined)}
      >
        <Undo2 />
      </ToolButton>
      <ToolButton
        label="重做"
        disabled={!canRedo}
        onClick={() => editor.dispatchCommand(REDO_COMMAND, undefined)}
      >
        <Redo2 />
      </ToolButton>
      <span className="lexical-divider" />
      <ToolButton label="一级标题" onClick={() => setBlock('h1')}>
        <Heading1 />
      </ToolButton>
      <ToolButton label="二级标题" onClick={() => setBlock('h2')}>
        <Heading2 />
      </ToolButton>
      <ToolButton label="引用" onClick={() => setBlock('quote')}>
        <Quote />
      </ToolButton>
      <ToolButton label="代码块" onClick={() => setBlock('code')}>
        <Code />
      </ToolButton>
      <span className="lexical-divider" />
      <ToolButton label="粗体" onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold')}>
        <Bold />
      </ToolButton>
      <ToolButton
        label="斜体"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic')}
      >
        <Italic />
      </ToolButton>
      <ToolButton
        label="下划线"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline')}
      >
        <Underline />
      </ToolButton>
      <ToolButton
        label="删除线"
        onClick={() => editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough')}
      >
        <Strikethrough />
      </ToolButton>
      <ToolButton label="链接" onClick={addLink}>
        <LinkIcon />
      </ToolButton>
      <span className="lexical-divider" />
      <ToolButton
        label="无序列表"
        onClick={() => editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined)}
      >
        <List />
      </ToolButton>
      <ToolButton
        label="有序列表"
        onClick={() => editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined)}
      >
        <ListOrdered />
      </ToolButton>
      <ToolButton
        label="清除列表"
        onClick={() => editor.dispatchCommand(REMOVE_LIST_COMMAND, undefined)}
      >
        ¶
      </ToolButton>
      <ToolButton label="插入图片" onClick={() => fileRef.current?.click()}>
        <ImagePlus />
      </ToolButton>
      <input
        ref={fileRef}
        hidden
        type="file"
        accept="image/*"
        onChange={(event) => {
          void addImage(event.target.files?.[0])
          event.target.value = ''
        }}
      />
    </div>
  )
}

function ToolButton({
  label,
  children,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { label: string }) {
  return (
    <button
      type="button"
      className="lexical-tool-button"
      title={label}
      aria-label={label}
      {...props}
    >
      {children}
    </button>
  )
}
*/

export default Editor
