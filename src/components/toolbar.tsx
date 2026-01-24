'use client'

import { ImageIcon, Smile, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import React, { ElementRef, useRef, useState } from 'react'
import TextareaAutosize from 'react-textarea-autosize'

import { Button } from '@/components/ui/button'
import { useCoverImage } from '@/hooks/use-cover-image'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { Document } from '@/types/document'

import IconPicker from './icon-picker'

interface ToolbarProps {
  initialData: Document
  preview?: boolean
}

export const Toolbar = ({ initialData, preview }: ToolbarProps) => {
  const t = useTranslations('App.toolbar')
  const inputRef = useRef<ElementRef<'textarea'> | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [value, setValue] = useState(initialData.title)

  const { update, removeIcon } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)

  const coverImage = useCoverImage()

  const enableInput = () => {
    if (preview) return

    setIsEditing(true)
    setTimeout(() => {
      setValue(initialData.title)
      inputRef.current?.focus()
    }, 0)
  }

  const disableInput = () => {
    setIsEditing(false)
    bump()
  }

  const onInput = async (value: string) => {
    setValue(value)
    await update(initialData.id, { title: value || t('untitled') })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      disableInput()
    }
  }

  const onIconSelect = async (icon: string) => {
    await update(initialData.id, { icon })
    bump()
  }

  const onRemoveIcon = async () => {
    await removeIcon(initialData.id)
    bump()
  }

  return (
    <div className="group relative pl-[54px]">
      {!!initialData.icon && !preview && (
        <div className="group/icon flex items-center gap-x-2 pt-6">
          <IconPicker onChange={onIconSelect}>
            <p className="text-6xl transition hover:opacity-75">{initialData.icon}</p>
          </IconPicker>
          <Button
            onClick={onRemoveIcon}
            variant="outline"
            size="icon"
            className="text-muted-foreground rounded-full opacity-0 transition group-hover/icon:opacity-100"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      )}
      {!!initialData.icon && preview && <p className="pt-6 text-6xl">{initialData.icon}</p>}
      <div className="flex items-center gap-x-1 py-4 opacity-0 group-hover:opacity-100">
        {!initialData.icon && !preview && (
          <IconPicker asChild onChange={onIconSelect}>
            <Button className="text-muted-foreground text-xs" variant="outline" size="sm">
              <Smile className="mr-2 h-4 w-4"></Smile>
              {t('addIcon')}
            </Button>
          </IconPicker>
        )}
        {!initialData.coverImage && !preview && (
          <Button
            onClick={coverImage.onOpen}
            className="text-muted-foreground text-xs"
            variant="outline"
            size="sm"
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            {t('addCover')}
          </Button>
        )}
      </div>
      {isEditing && !preview ? (
        <TextareaAutosize
          ref={inputRef}
          onBlur={disableInput}
          onKeyDown={onKeyDown}
          value={value}
          onChange={(event) => onInput(event.target.value)}
          className="resize-none bg-transparent text-5xl font-bold break-words text-[#3F3F3F] outline-none dark:text-[#CFCFCF]"
          placeholder={t('titlePlaceholder')}
        />
      ) : (
        <button
          type="button"
          onClick={enableInput}
          className="block w-full bg-transparent pb-[12px] text-left text-5xl font-bold break-words text-[#3F3F3F] focus-visible:outline-none dark:text-[#CFCFCF]"
        >
          {initialData.title || t('untitled')}
        </button>
      )}
    </div>
  )
}
