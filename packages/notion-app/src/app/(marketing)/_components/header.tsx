"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"


const Header = () => {
    return (
        <div className="max-w-3xl space-y-4">
            <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
                Your Ideas, Documents, & Plans. Unified. Welcome to
                <span className="underline">Notion</span>
            </h1>
            <h3 className="text-base sm:text-xl md:text-2xl font-medium">
                Notion is a new kind of workspace that <br />
                blends your notes,
                docs, and tasks into a single, organized space.
            </h3>
            <Button>
                Enter Notion
                <ArrowRight className="w-4 h-4 ml-2"></ArrowRight>
            </Button>
        </div>
    )
}

export default Header