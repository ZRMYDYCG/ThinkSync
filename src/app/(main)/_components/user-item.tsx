'use client'

import { ChevronsLeftRight } from 'lucide-react'
import React from 'react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

const UserItem = () => {
  const { user, logout } = useAuth()
  const displayName = user?.name ?? user?.email ?? 'Account'
  const initial = (Array.from(displayName.trim())[0] ?? 'A').toUpperCase()
  const secondaryText = user?.email && user.email !== displayName ? user.email : null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center gap-x-2 rounded-md px-3 py-2 text-sm transition-colors hover:bg-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <Avatar className="h-6 w-6">
            <AvatarFallback className="bg-primary/10 text-xs font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1 text-left">
            <div className="truncate text-sm font-medium leading-5">{displayName}</div>
            {secondaryText && (
              <div className="truncate text-xs text-muted-foreground">{secondaryText}</div>
            )}
          </div>
          <ChevronsLeftRight className="h-4 w-4 shrink-0 rotate-90 text-muted-foreground" />
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" alignOffset={11} forceMount>
        <div className="flex items-center gap-x-3 p-2">
          <Avatar className="h-10 w-10">
            <AvatarFallback className="bg-primary/10 text-base font-semibold text-primary">
              {initial}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            {secondaryText && (
              <p className="truncate text-xs text-muted-foreground">{secondaryText}</p>
            )}
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="w-full cursor-pointer" onClick={logout}>
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default UserItem
