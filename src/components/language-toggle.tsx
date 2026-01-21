'use client'

import { useLocale, useTranslations } from 'next-intl'
import React from 'react'

import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { setLocale } from '@/i18n'
import { type Locale, locales } from '@/i18n/config'

const LOCALE_LABELS: Record<Locale, string> = {
  zh: 'ZH',
  en: 'EN',
  ja: 'JA',
  ko: 'KO',
}

export function LanguageToggle() {
  const t = useTranslations('App.internationalization')
  const locale = useLocale()
  const currentLabel = LOCALE_LABELS[locale as Locale] ?? locale.toUpperCase()

  function onChangeLang(value: Locale) {
    setLocale(value)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          <span className="text-xs font-semibold">{currentLabel}</span>
          <span className="sr-only">Toggle Language</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {locales.map((value) => (
          <DropdownMenuItem key={value} onClick={() => onChangeLang(value)}>
            {t(value)}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
