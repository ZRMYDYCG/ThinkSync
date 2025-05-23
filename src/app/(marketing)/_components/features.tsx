"use client"

import React from 'react'
import { useTranslations } from "next-intl"

interface FeatureItem {
    title: string
    description: string
    image: string
    reverse?: boolean
}

const Features: React.FC = () => {
    const t = useTranslations('Route.marketing.features')
    const features: FeatureItem[] = [
        {
            title: t('items.0.title'),
            description: t('items.0.description'),
            image: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/0f0503a83eb568239afebc2f4ca8424.jpg',
            reverse: false
        },
        {
            title: t('items.1.title'),
            description: t('items.1.description'),
            image: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/b62fd7d3778b953e1b174d170a82dbe.jpg',
            reverse: true
        },
    ];

    return (
        <section className="w-full py-12 md:py-24 lg:py-32" id="features">
            <div className="max-w-7xl mx-auto">
                <div className="text-center mb-16">
                    <h2 className="text-3xl font-extrabold text-gray-900 dark:text-gray-100 tracking-tight sm:text-4xl">
                        {t('title')}
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 dark:text-gray-400 max-w-3xl mx-auto">
                        {t('description')}
                    </p>
                </div>

                <div className="space-y-20 md:space-y-32">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className={`flex flex-col gap-8 md:gap-12 ${
                                feature.reverse ? 'md:flex-row-reverse' : 'md:flex-row'
                            }`}
                        >
                            <div className="flex-1 md:w-1/2 flex flex-col justify-center space-y-4">
                                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
                                    {feature.title}
                                </h3>
                                <p className="text-gray-600 dark:text-gray-400 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>

                            <div className="flex-1 md:w-1/2">
                                <div
                                    className="relative bg-white dark:bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-shadow duration-300">
                                    <img
                                        src={feature.image}
                                        alt={feature.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.currentTarget.src = '/default-feature-image.png'
                                        }}
                                    />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}

export default Features