'use client'

import { UploadCloudIcon, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import Image from 'next/image'
import * as React from 'react'
import { useDropzone, type DropzoneOptions } from 'react-dropzone'
import { twMerge } from 'tailwind-merge'

import { Spinner } from './spinner'

const variants = {
  base: 'relative rounded-md flex justify-center items-center flex-col cursor-pointer min-h-[150px] min-w-[200px] border border-dashed border-border transition-colors duration-200 ease-in-out',
  image: 'border-0 p-0 min-h-0 min-w-0 relative shadow-md bg-muted rounded-md',
  active: 'border-2',
  disabled: 'bg-muted/60 border-border cursor-default pointer-events-none',
  accept: 'border border-primary bg-primary/10',
  reject: 'border border-destructive bg-destructive/10',
}

type InputProps = {
  width?: number
  height?: number
  className?: string
  value?: File | string
  onChange?: (file?: File) => void | Promise<void>
  disabled?: boolean
  dropzoneOptions?: Omit<DropzoneOptions, 'disabled'>
}

const formatFileSize = (bytes: number) => {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  const index = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1)
  const value = bytes / Math.pow(1024, index)
  return `${value.toFixed(value >= 10 || index === 0 ? 0 : 1)} ${units[index]}`
}

const SingleImageDropzone = React.forwardRef<HTMLInputElement, InputProps>(
  ({ dropzoneOptions, width, height, value, className, disabled, onChange }, ref) => {
    const t = useTranslations('App.singleImageDropzone')
    const imageUrl = React.useMemo(() => {
      if (typeof value === 'string') {
        return value
      } else if (value) {
        return URL.createObjectURL(value)
      }
      return null
    }, [value])

    const {
      getRootProps,
      getInputProps,
      acceptedFiles,
      fileRejections,
      isFocused,
      isDragAccept,
      isDragReject,
    } = useDropzone({
      accept: { 'image/*': [] },
      multiple: false,
      disabled,
      onDrop: (acceptedFiles) => {
        const file = acceptedFiles[0]
        if (file) {
          void onChange?.(file)
        }
      },
      ...dropzoneOptions,
    })

    const dropZoneClassName = React.useMemo(
      () =>
        twMerge(
          variants.base,
          isFocused && variants.active,
          disabled && variants.disabled,
          imageUrl && variants.image,
          (isDragReject ?? fileRejections[0]) && variants.reject,
          isDragAccept && variants.accept,
          className,
        ).trim(),
      [isFocused, imageUrl, fileRejections, isDragAccept, isDragReject, disabled, className],
    )

    const errorMessage = React.useMemo(() => {
      if (fileRejections[0]) {
        const { errors } = fileRejections[0]
        if (errors[0]?.code === 'file-too-large') {
          return t('fileTooLarge', { size: formatFileSize(dropzoneOptions?.maxSize ?? 0) })
        } else if (errors[0]?.code === 'file-invalid-type') {
          return t('fileInvalidType')
        } else if (errors[0]?.code === 'too-many-files') {
          return t('tooManyFiles', { count: dropzoneOptions?.maxFiles ?? 0 })
        } else {
          return t('fileNotSupported')
        }
      }
      return undefined
    }, [fileRejections, dropzoneOptions, t])

    return (
      <div className="relative">
        {disabled && (
          <div className="bg-background/80 absolute inset-y-0 z-50 flex h-full w-full items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        <div
          {...getRootProps({
            className: dropZoneClassName,
            style: {
              width,
              height,
            },
          })}
        >
          <input ref={ref} {...getInputProps()} />

          {imageUrl ? (
            <Image
              className="rounded-md object-cover"
              src={imageUrl}
              alt={acceptedFiles[0]?.name ?? t('selectedImage')}
              fill
              sizes="100vw"
              unoptimized={imageUrl.startsWith('blob:') || imageUrl.startsWith('data:')}
            />
          ) : (
            <div className="text-muted-foreground flex flex-col items-center justify-center text-xs">
              <UploadCloudIcon className="mb-2 h-7 w-7" />
              <div className="text-muted-foreground">{t('uploadHint')}</div>
            </div>
          )}

          {imageUrl && !disabled && (
            <button
              type="button"
              aria-label={t('removeImage')}
              className="group absolute top-0 right-0 translate-x-1/4 -translate-y-1/4 transform border-0 bg-transparent p-0"
              onClick={(e) => {
                e.stopPropagation()
                void onChange?.(undefined)
              }}
            >
              <div className="border-border bg-background flex h-5 w-5 items-center justify-center rounded-md border border-solid transition-all duration-300 hover:h-6 hover:w-6">
                <X className="text-muted-foreground" width={16} height={16} />
              </div>
            </button>
          )}
        </div>

        <div className="text-destructive mt-1 text-xs">{errorMessage}</div>
      </div>
    )
  },
)
SingleImageDropzone.displayName = 'SingleImageDropzone'

const Button = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => {
    return (
      <button
        className={twMerge(
          'focus-visible:ring-ring inline-flex cursor-pointer items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 disabled:pointer-events-none disabled:opacity-50',
          'border border-border text-muted-foreground shadow hover:bg-accent hover:text-accent-foreground',
          'h-6 rounded-md px-2 text-xs',
          className,
        )}
        ref={ref}
        {...props}
      />
    )
  },
)
Button.displayName = 'Button'

export { SingleImageDropzone }
