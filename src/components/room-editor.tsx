'use client'

import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import '@/assets/css/editor.css'
import { createOpenAI } from '@ai-sdk/openai'
import { PartialBlock } from '@blocknote/core'
import { en } from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import { AIMenuController, createAIExtension } from '@blocknote/xl-ai'
import { en as aiEn } from '@blocknote/xl-ai/locales'
import '@blocknote/xl-ai/style.css'
import { useTheme } from 'next-themes'
import React, { useMemo } from 'react'
import * as Y from 'yjs'

import { useUploadsApi } from '@/hooks/use-uploads-api'
import { CollabSocketProvider } from '@/lib/collab-socket-provider'

const openai = createOpenAI({
  apiKey: 'unused',
  baseURL: 'http://localhost:3000/ai/v1',
})

const model = openai('Qwen/QwQ-32B')

type Props = {
  ydoc: Y.Doc
  provider: CollabSocketProvider
  editable: boolean
  user: { name: string; color: string }
  initialContent?: string | null
  onChange?: (content: string) => void
  onReady?: (getContent: () => string) => void
}

export const RoomEditor = ({
  ydoc,
  provider,
  editable,
  user,
  initialContent,
  onChange,
  onReady,
}: Props) => {
  const { resolvedTheme } = useTheme()
  const { uploadImage } = useUploadsApi()

  const parsedInitialContent = useMemo((): PartialBlock[] | undefined => {
    if (typeof initialContent !== 'string' || initialContent.length === 0) {
      return undefined
    }
    try {
      return JSON.parse(initialContent) as PartialBlock[]
    } catch {
      return undefined
    }
  }, [initialContent])

  const editor = useCreateBlockNote(
    useMemo(
      () =>
        ({
          initialContent: parsedInitialContent,
          uploadFile: uploadImage,
          dictionary: {
            ...en,
            ai: aiEn,
          },
          extensions: [
            createAIExtension({
              model,
            }),
          ],
          collaboration: {
            provider,
            fragment: ydoc.getXmlFragment('document-store'),
            user,
          },
        }) as any,
      [parsedInitialContent, provider, uploadImage, user, ydoc],
    ),
  )

  const seedAppliedRef = React.useRef(false)

  React.useEffect(() => {
    seedAppliedRef.current = false
  }, [initialContent])

  React.useEffect(() => {
    if (!editable) return
    if (!parsedInitialContent || parsedInitialContent.length === 0) return
    const seedContent = () => {
      if (seedAppliedRef.current) return
      const current = Array.isArray(editor.document) ? editor.document : []
      editor.replaceBlocks(current, parsedInitialContent)
      onChange?.(JSON.stringify(editor.document, null, 2))
      seedAppliedRef.current = true
    }
    const onSync = (isSynced: boolean) => {
      if (!isSynced) return
      setTimeout(seedContent, 0)
    }
    provider.on('sync', onSync)
    if (provider.isSynced()) {
      setTimeout(seedContent, 0)
    }
    return () => provider.off('sync', onSync)
  }, [editable, editor, initialContent, onChange, parsedInitialContent, provider, ydoc])

  React.useEffect(() => {
    if (!onReady) return
    onReady(() => JSON.stringify(editor.document, null, 2))
  }, [editor, onReady])

  React.useEffect(() => {
    if (!onChange) return
    const handleUpdate = (_: Uint8Array, origin: unknown) => {
      if (origin !== provider) return
      onChange(JSON.stringify(editor.document, null, 2))
    }
    ydoc.on('update', handleUpdate)
    return () => ydoc.off('update', handleUpdate)
  }, [editor, onChange, provider, ydoc])

  const onContentChange = () => {
    onChange?.(JSON.stringify(editor.document, null, 2))
  }

  return (
    <div className="bg-white">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={onContentChange}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      >
        <AIMenuController />
      </BlockNoteView>
    </div>
  )
}
