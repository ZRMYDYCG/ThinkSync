'use client'

import { useScrollTop } from "@/hooks/useScrollTop";
import Link from 'next/link'
import { cn } from "@/lib/utils";
import Logo from './logo'
import { ModeToggle } from '@/components/mode-toggle'
import { useConvexAuth } from 'convex/react'
import { SignInButton, UserButton } from "@clerk/clerk-react";
import {Button} from "@/components/ui/button";
import { Spinner } from '@/components/spinner'

const Navbar = () => {
    const { isAuthenticated, isLoading } = useConvexAuth()
    const scrolled = useScrollTop()

    return (
        <div className={
            cn(
                "z-50 bg-background fixed top-0 flex items-center w-full p-6 dark:bg-[#1F1F1F]",
                scrolled && "border-b shadow-sm"
            )
        }>
            <Logo />
            <div className="md:ml-auto md:justify-end justify-between w-full flex items-center gap-x-2">
                {
                    isLoading && (
                        <Spinner></Spinner>
                    )
                }
                {
                    !isAuthenticated && !isLoading && (
                        <>
                            <SignInButton mode="modal">
                                <Button variant="ghost" size="sm">Log in</Button>
                            </SignInButton>
                            <SignInButton mode="modal">
                                <Button size="sm">Get Notion Free</Button>
                            </SignInButton>
                        </>
                    )
                }
                {
                    isAuthenticated && !isLoading && (
                        <>
                            <Button variant="ghost" size="sm" asChild>
                                <Link href="/documents">
                                    Enter Notion
                                </Link>
                            </Button>
                            <UserButton />
                        </>
                    )
                }
                <ModeToggle />
            </div>
        </div>
    )
}

export default Navbar
