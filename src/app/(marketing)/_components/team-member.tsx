import { useTranslations } from 'next-intl'
import React from 'react'

const TeamMember = () => {
  const t = useTranslations('Route.marketing.teamMember')

  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="mb-8 text-center text-2xl font-bold dark:text-white">{t('title')}</h2>
      <div className="flex flex-wrap justify-center gap-8">
        {t.raw('members').map((member: any, index: any) => (
          <div key={index} className="flex flex-col items-center space-y-2">
            <div className="h-20 w-20 overflow-hidden rounded-full bg-gray-100 dark:bg-gray-800">
              <img
                src={
                  index === 0
                    ? 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg'
                    : 'https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg'
                }
                alt={member.alt}
                className="h-full w-full object-cover"
              />
            </div>
            <span className="text-center text-orange-500 dark:text-orange-300">{member.name}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export default TeamMember
