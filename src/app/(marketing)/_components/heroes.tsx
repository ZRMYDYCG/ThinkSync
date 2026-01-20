'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React from 'react'

const Heroes = () => {
  const t = useTranslations('Route.marketing.heroes')

  return (
    <div className="flex max-w-5xl flex-col items-center justify-center">
      <div className="flex items-center">
        <div className="relative h-[300px] w-[300px] sm:h-[350px] sm:w-[350px] md:h-[400px] md:w-[400px]">
          <Image
            src="/documents.png"
            alt={t('documentsAlt')}
            fill
            className="object-contain dark:hidden"
          ></Image>
          <Image
            src="/documents-dark.png"
            alt={t('documentsAlt')}
            fill
            className="hidden object-contain dark:block"
          ></Image>
        </div>
        <div className="relative hidden h-[400px] w-[400px] md:block">
          <Image
            src="/reading.png"
            alt={t('readingAlt')}
            fill
            className="object-contain dark:hidden"
          ></Image>
          <Image
            src="/reading-dark.png"
            alt={t('readingAlt')}
            fill
            className="hidden object-contain dark:block"
          ></Image>
        </div>
      </div>
    </div>
  )
}

export default Heroes
