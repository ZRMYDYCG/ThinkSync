'use client'

import { useTranslations } from 'next-intl'
import React from 'react'

const Testimonials = () => {
  const t = useTranslations('Route.marketing.testimonials')
  const testimonials = t.raw('items')

  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            {t('title')}
          </h2>
          <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
            {t('description')}
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 gap-8 lg:mx-0 lg:max-w-none lg:grid-cols-3">
          {testimonials.map((testimonial: any, index: any) => (
            <div
              key={index}
              className="flex flex-col justify-between rounded-2xl bg-white p-8 shadow-lg ring-1 ring-gray-900/10 transition-transform duration-300 hover:scale-105 dark:bg-gray-800 dark:ring-gray-700"
            >
              <div>
                <p className="mt-6 text-lg leading-8 text-gray-900 dark:text-white">
                  {testimonial.quote}
                </p>
              </div>
              <div className="mt-8 flex items-center gap-x-4">
                <img
                  className="h-10 w-10 rounded-full bg-gray-50"
                  src={testimonial.avatar}
                  alt={testimonial.name}
                />
                <div className="text-sm leading-6">
                  <div className="font-semibold text-gray-900 dark:text-white">
                    {testimonial.name}
                  </div>
                  <div className="text-gray-600 dark:text-gray-400">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Testimonials
