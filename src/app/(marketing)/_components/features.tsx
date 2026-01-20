'use client'

import { useTranslations } from 'next-intl'
import Image from 'next/image'
import React from 'react'

interface FeatureItem {
  title: string
  description: string
  image: string
  reverse?: boolean
}

const FALLBACK_FEATURE_IMAGE = '/default-feature-image.png'

const FeatureImage = ({ src, alt }: { src: string; alt: string }) => {
  const [imageSrc, setImageSrc] = React.useState(src)

  React.useEffect(() => {
    setImageSrc(src)
  }, [src])

  return (
    <Image
      src={imageSrc}
      alt={alt}
      width={1200}
      height={800}
      sizes="(min-width: 768px) 50vw, 100vw"
      className="h-auto w-full object-cover"
      onError={() => {
        if (imageSrc !== FALLBACK_FEATURE_IMAGE) {
          setImageSrc(FALLBACK_FEATURE_IMAGE)
        }
      }}
    />
  )
}

const Features: React.FC = () => {
  const t = useTranslations('Route.marketing.features')
  const features: FeatureItem[] = [
    {
      title: t('items.0.title'),
      description: t('items.0.description'),
      image:
        'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/0f0503a83eb568239afebc2f4ca8424.jpg',
      reverse: false,
    },
    {
      title: t('items.1.title'),
      description: t('items.1.description'),
      image:
        'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/b62fd7d3778b953e1b174d170a82dbe.jpg',
      reverse: true,
    },
  ]

  return (
    <section className="w-full py-12 md:py-24 lg:py-32" id="features">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mx-auto mt-4 max-w-3xl text-lg text-gray-600 dark:text-gray-400">
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
              <div className="flex flex-1 flex-col justify-center space-y-4 md:w-1/2">
                <h3 className="text-2xl font-semibold text-gray-900 dark:text-gray-200">
                  {feature.title}
                </h3>
                <p className="leading-relaxed text-gray-600 dark:text-gray-400">
                  {feature.description}
                </p>
              </div>

              <div className="flex-1 md:w-1/2">
                <div className="relative overflow-hidden rounded-xl bg-white shadow-xl transition-shadow duration-300 hover:shadow-2xl dark:bg-gray-800">
                  <FeatureImage src={feature.image} alt={feature.title} />
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
