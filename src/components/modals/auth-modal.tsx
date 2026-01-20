'use client'

import { useTranslations } from 'next-intl'
import { useRouter } from 'next/navigation'
import React, { useState, useEffect } from 'react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useAuth } from '@/hooks/use-auth'
import { useAuthModal } from '@/hooks/use-auth-modal'

export const AuthModal = () => {
  const router = useRouter()
  const { login, register, isAuthenticated } = useAuth()
  const authModal = useAuthModal()
  const t = useTranslations('App.AuthModal')

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Reset form when modal opens or view changes
  useEffect(() => {
    if (authModal.isOpen) {
      setEmail('')
      setPassword('')
      setName('')
    }
  }, [authModal.isOpen, authModal.view])

  useEffect(() => {
    if (isAuthenticated && authModal.isOpen) {
      authModal.onClose()
      router.push('/documents')
    }
  }, [isAuthenticated, router, authModal])

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setIsSubmitting(true)
    try {
      if (authModal.view === 'login') {
        await login({ email, password })
        toast.success(t('LoggedInSuccessfully'))
      } else {
        await register({
          name: name || undefined,
          email,
          password,
        })
        toast.success(t('AccountCreatedSuccessfully'))
      }
      authModal.onClose()
      router.push('/documents')
    } catch (error) {
      const message = error instanceof Error ? error.message : t('AuthenticationFailed')
      toast.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  const onChangeView = () => {
    authModal.toggleView()
  }

  return (
    <Dialog open={authModal.isOpen} onOpenChange={authModal.onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {authModal.view === 'login' ? t('WelcomeBack') : t('CreateAnAccount')}
          </DialogTitle>
          <DialogDescription>
            {authModal.view === 'login' ? t('LoginToContinue') : t('StartOrganizing')}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          {authModal.view === 'register' && (
            <div className="space-y-2">
              <Label htmlFor="name">{t('Name')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('YourName')}
                disabled={isSubmitting}
              />
            </div>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">{t('Email')}</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t('EmailPlaceholder')}
              required
              disabled={isSubmitting}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">{t('Password')}</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              disabled={isSubmitting}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting
              ? t('Loading')
              : authModal.view === 'login'
                ? t('LogIn')
                : t('CreateAccount')}
          </Button>
          <div className="text-center text-sm text-muted-foreground">
            {authModal.view === 'login' ? t('NoAccount') : t('AlreadyHaveAccount')}
            <button
              type="button"
              onClick={onChangeView}
              className="cursor-pointer text-primary underline hover:opacity-80"
            >
              {authModal.view === 'login' ? t('CreateOne') : t('LogIn')}
            </button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
