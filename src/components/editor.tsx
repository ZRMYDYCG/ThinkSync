'use client'

import '@blocknote/core/fonts/inter.css'
import '@blocknote/mantine/style.css'
import '@/assets/css/editor.css'
import { createOpenAI } from '@ai-sdk/openai'
import { PartialBlock, filterSuggestionItems } from '@blocknote/core'
import * as coreLocales from '@blocknote/core/locales'
import { BlockNoteView } from '@blocknote/mantine'
import { useCreateBlockNote } from '@blocknote/react'
import {
  FormattingToolbar,
  FormattingToolbarController,
  SuggestionMenuController,
  getDefaultReactSlashMenuItems,
  getFormattingToolbarItems,
} from '@blocknote/react'
import {
  AIMenuController,
  AIToolbarButton,
  createAIExtension,
  getAISlashMenuItems,
} from '@blocknote/xl-ai'
import * as aiLocales from '@blocknote/xl-ai/locales'
import '@blocknote/xl-ai/style.css'
import { useLocale } from 'next-intl'
import { useTheme } from 'next-themes'
import React, { useCallback, useMemo } from 'react'

import { useUploadsApi } from '@/hooks/use-uploads-api'

interface EditorProps {
  onChange: (value: string) => void
  initialContent?: string | null
  editable?: boolean
}

const openai = createOpenAI({
  apiKey: 'unused',
  baseURL: 'http://localhost:3000/ai/v1',
})

const model = openai('Qwen/QwQ-32B')

const Editor = ({ onChange, initialContent, editable }: EditorProps) => {
  const { resolvedTheme } = useTheme()
  const locale = useLocale()
  const { uploadImage } = useUploadsApi()
  const normalizedContent =
    typeof initialContent === 'string' && initialContent.length > 0 ? initialContent : undefined

  const handleUpload = useCallback(
    async (file: File) => {
      return uploadImage(file)
    },
    [uploadImage],
  )
  const dictionary = useMemo(() => {
    const coreFallback = coreLocales.en
    const aiFallback = (aiLocales as Record<string, any>).en
    const coreDictionary =
      (coreLocales as Record<string, typeof coreLocales.en>)[locale] ?? coreFallback
    const aiDictionary = (aiLocales as Record<string, any>)[locale] ?? aiFallback
    return {
      ...coreDictionary,
      ai: aiDictionary,
    }
  }, [locale])

  const editor = useCreateBlockNote(
    {
      initialContent: normalizedContent
        ? (JSON.parse(normalizedContent) as PartialBlock[])
        : undefined,
      uploadFile: handleUpload,
      dictionary,
      extensions: [
        createAIExtension({
          model,
        }),
      ],
    } as any,
    [normalizedContent, handleUpload, dictionary],
  )

  const onContentChange = () => {
    onChange(JSON.stringify(editor.document, null, 2))
  }
  return (
    <div className="bg-background">
      <BlockNoteView
        editor={editor}
        editable={editable}
        onChange={onContentChange}
        formattingToolbar={false}
        slashMenu={false}
        theme={resolvedTheme === 'dark' ? 'dark' : 'light'}
      >
        <AIMenuController />
        <FormattingToolbarWithAI />
        <SuggestionMenuWithAI editor={editor} />
      </BlockNoteView>
    </div>
  )
}

function FormattingToolbarWithAI() {
  return (
    <FormattingToolbarController
      formattingToolbar={() => (
        <FormattingToolbar>
          {...getFormattingToolbarItems()}
          {/* Add the AI button */}
          <AIToolbarButton />
        </FormattingToolbar>
      )}
    />
  )
}

function SuggestionMenuWithAI(props: { editor: any }) {
  return (
    <SuggestionMenuController
      triggerCharacter="/"
      getItems={async (query) =>
        filterSuggestionItems(
          [...getDefaultReactSlashMenuItems(props.editor), ...getAISlashMenuItems(props.editor)],
          query,
        )
      }
    />
  )
}

export default Editor
