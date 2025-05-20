"use client"

import React from 'react'

const Testimonials = () => {
    const testimonials = [
        {
            avatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg',
            name: 'Yi Shao',
            role: 'Product Manager',
            quote: 'The user experience of this product is excellent!'
        },
        {
            avatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg',
            name: 'Anonymous User',
            role: 'Freelancer',
            quote: 'Very satisfied, the interface is simple and easy to use.'
        },
        {
            avatar: 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/6.jpg',
            name: 'Alex Johnson',
            role: 'CTO',
            quote: 'This tool has completely transformed my workflow!'
        }
    ]

    return (
        <div className="py-24 sm:py-32">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
                        What our users are saying
                    </h2>
                    <p className="mt-2 text-lg leading-8 text-gray-600 dark:text-gray-300">
                        Join thousands of satisfied users worldwide
                    </p>
                </div>
                <div className="mx-auto mt-16 grid max-w-2xl grid-cols-1 lg:mx-0 lg:max-w-none lg:grid-cols-3 gap-8">
                    {testimonials.map((testimonial, index) => (
                        <div key={index} className="flex flex-col justify-between bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-lg ring-1 ring-gray-900/10 dark:ring-gray-700 hover:scale-105 transition-transform duration-300">
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
                                    <div className="text-gray-600 dark:text-gray-400">
                                        {testimonial.role}
                                    </div>
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
