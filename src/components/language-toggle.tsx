"use client"

import * as React from "react"
import { useState } from "react"
import { cn } from '@/lib/utils'


import { Button } from "@/components/ui/button"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export function LanguageToggle() {
    const [currentLanguage, setCurrentLanguage] = useState("zh")


    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <div className={cn('block', currentLanguage === 'zh' ? '' : 'hidden')}>中</div>
                    <div className={cn('block', currentLanguage === 'en' ? '' : 'hidden')}>EN</div>
                    <span className="sr-only">Toggle Language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setCurrentLanguage("zh")}>
                    Chinese
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setCurrentLanguage("en")}>
                    English
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    )
}
