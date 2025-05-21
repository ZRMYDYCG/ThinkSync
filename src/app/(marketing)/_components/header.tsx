"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"
import { useConvexAuth } from 'convex/react'
import {Spinner} from "@/components/spinner"
import Link from "next/link"
import {SignInButton} from "@clerk/clerk-react";
import { useTranslations } from "next-intl"

const Header = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const t = useTranslations('Route.marketing.header')

    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                {t('title')}
                <span className="underline">{t('brandName')}</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                {t('subtitle')}
            </h3>
            {isLoading && (
                <div className="w-full flex items-center justify-center">
                    <Spinner size="lg" />
                </div>
            )}
            {isAuthenticated && !isLoading && (
                <Button asChild>
                    <Link href="/documents">
                        {t('enterButton')}
                        <ArrowRight className="w-4 h-4 ml-2"></ArrowRight>
                    </Link>
                </Button>
            )}
            {!isAuthenticated && !isLoading && (
                <SignInButton mode="modal">
                    <Button>
                        {t('getStartedButton')}
                        <ArrowRight className="w-4 h-4 ml-2"></ArrowRight>
                    </Button>
                </SignInButton>
            )}
        </div>
    )
}

export default Header