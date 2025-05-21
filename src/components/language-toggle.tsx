"use client"

import * as React from "react"
import { cn } from '@/lib/utils'
import { useTranslations, useLocale } from 'next-intl'
import { setLocale } from '@/i18n';
import { type Locale, locales } from '@/i18n/config'

import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    const t = useTranslations('App.internationalization')
    const [ZH, EN] = locales
    const locale = useLocale()
    const isZh = locale === ZH

    // 切换语言
    function onChangeLang(value: Locale) {
        const locale = value as Locale
        setLocale(locale)
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <span className={cn('rotate-0 scale-100 transition-all duration-300', !isZh ? '-rotate-90 scale-0' : '')}>
                        中
                    </span>
                    <span className={cn('absolute rotate-90 scale-0 transition-all duration-300', !isZh ? 'rotate-0 scale-100' : '')}>
                        En
                    </span>
                    <span className="sr-only">Toggle Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => onChangeLang(ZH)}>
                    {t('zh')}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onChangeLang(EN)}>
                    {t('en')}
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}