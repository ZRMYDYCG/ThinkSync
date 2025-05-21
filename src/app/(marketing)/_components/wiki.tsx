import React from 'react'
import { useTranslations } from "next-intl"

const Wiki = () => {
    const t = useTranslations('Route.marketing.wiki')

    return (
        <div className="flex flex-col lg:flex-row rounded-lg overflow-hidden transition-colors duration-300">
            <div className="w-full lg:w-1/2 order-1 lg:order-none">
                <img
                    src="/wiki-template.png"
                    alt="Wiki Template"
                    className="w-full h-full object-cover"
                />
            </div>
            
            <div className="w-full lg:w-1/2 p-4 lg:p-8 order-2 lg:order-none">
                <h2 className="text-xl lg:text-2xl font-bold mb-4 lg:mb-6 text-gray-800 dark:text-gray-100">
                    {t('title')}
                </h2>
                <div className="space-y-4 lg:space-y-6 ">
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
                            {t('items.0.title')}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('items.0.description')}
                        </p>
                    </div>
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                            {t('items.1.title')}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('items.1.description')}
                        </p>
                    </div>
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                            {t('items.2.title')}
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            {t('items.2.description')}
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Wiki