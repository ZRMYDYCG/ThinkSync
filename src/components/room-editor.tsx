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
}

export const RoomEditor = ({ ydoc, provider, editable, user, initialContent, onChange }: Props) => {
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
