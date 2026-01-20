import { useTranslations } from 'next-intl'
import React from 'react'

const Wiki = () => {
  const t = useTranslations('Route.marketing.wiki')

  return (
    <div className="flex flex-col overflow-hidden rounded-lg transition-colors duration-300 lg:flex-row">
      <div className="order-1 w-full lg:order-none lg:w-1/2">
        <img src="/wiki-template.png" alt="Wiki Template" className="h-full w-full object-cover" />
      </div>

      <div className="order-2 w-full p-4 lg:order-none lg:w-1/2 lg:p-8">
        <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-gray-100 lg:mb-6 lg:text-2xl">
          {t('title')}
        </h2>
        <div className="space-y-4 lg:space-y-6">
          <div className="rounded-lg bg-white p-4 transition-colors duration-300 dark:bg-gray-700 lg:p-6">
            <h3 className="mb-2 text-base font-semibold text-blue-600 dark:text-blue-400 lg:text-lg">
              {t('items.0.title')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 lg:text-base">
              {t('items.0.description')}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 transition-colors duration-300 dark:bg-gray-700 lg:p-6">
            <h3 className="mb-2 text-base font-semibold text-green-600 dark:text-green-400 lg:text-lg">
              {t('items.1.title')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 lg:text-base">
              {t('items.1.description')}
            </p>
          </div>
          <div className="rounded-lg bg-white p-4 transition-colors duration-300 dark:bg-gray-700 lg:p-6">
            <h3 className="mb-2 text-base font-semibold text-purple-600 dark:text-purple-400 lg:text-lg">
              {t('items.2.title')}
            </h3>
            <p className="text-sm leading-relaxed text-gray-600 dark:text-gray-300 lg:text-base">
              {t('items.2.description')}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Wiki
