'use client'

import React, { useRef, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { useDocumentsApi } from '@/hooks/use-documents-api'
import { useDocumentsRefresh } from '@/hooks/use-documents-refresh'
import { Document } from '@/types/document'

interface TitleProps {
  initialData: Document
}

const Title = ({ initialData }: TitleProps) => {
  const { update } = useDocumentsApi()
  const bump = useDocumentsRefresh((state) => state.bump)
  const inputRef = useRef<HTMLInputElement>(null)

  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState(initialData.title || 'Untitled')

  const enableInput = () => {
    setTitle(initialData.title)
    setIsEditing(true)
    setTimeout(() => {
      inputRef.current?.focus()
      inputRef.current?.setSelectionRange(0, inputRef.current.value.length)
    }, 0)
  }

  const disableInput = () => {
    setIsEditing(false)
    bump()
  }

  const onChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(event.target.value)
    await update(initialData.id, {
      title: event.target.value || 'Untitled',
    })
  }

  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      disableInput()
    }
  }

  return (
    <div className="flex items-center gap-x-1">
      {!!initialData.icon && <p>{initialData.icon}</p>}
      {isEditing ? (
        <Input
          className="h-7 px-2 focus-visible:ring-transparent"
          ref={inputRef}
          onClick={enableInput}
          onBlur={disableInput}
          onChange={onChange}
          onKeyDown={onKeyDown}
          value={title}
        />
      ) : (
        <Button variant="ghost" onClick={enableInput} size="sm" className="h-auto p-1 font-normal">
          <span className="hidden max-w-[200px] truncate sm:inline">{initialData?.title}</span>
          <span className="max-w-[100px] truncate sm:hidden">{initialData?.title}</span>
        </Button>
      )}
    </div>
  )
}

Title.Skeleton = function TitleSkeleton() {
  return <Skeleton className="h-6 w-16 rounded-md" />
}

export default Title
