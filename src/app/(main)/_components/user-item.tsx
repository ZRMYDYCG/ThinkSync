'use client'

import { ChevronsLeftRight } from 'lucide-react'

import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/hooks/use-auth'

const UserItem = () => {
  const { user, logout } = useAuth()
  const displayName = user?.name ?? user?.email ?? 'Account'
  const initials = displayName.slice(0, 2).toUpperCase()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <div role="button" className="flex w-full items-center p-3 text-sm">
          <div className="flex max-w-[150px] items-center gap-x-2">
            <Avatar className="h-5 w-5">
              <AvatarFallback className="text-[10px]">{initials}</AvatarFallback>
            </Avatar>
            <span className="line-clamp-1 text-start font-medium">
              {displayName}&apos;s ThinkSync
            </span>
            <ChevronsLeftRight className="ml-2 h-4 w-4 rotate-90 text-muted-foreground" />
          </div>
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-80" align="start" alignOffset={11} forceMount>
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">{user?.email}</p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-8 w-8">
                <AvatarFallback>{initials}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="line-clamp-1 text-sm">{displayName}&apos;s ThinkSync</p>
            </div>
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
