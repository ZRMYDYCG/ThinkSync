import React from 'react'
import { useTranslations } from "next-intl"

const TeamMember = () => {
    const t = useTranslations('Route.marketing.teamMember')

    return (
        <div className="container mx-auto px-4 py-8">
            <h2 className="text-center text-2xl font-bold mb-8 dark:text-white">
                {t('title')}
            </h2>
            <div className="flex justify-center flex-wrap gap-8">
                {t.raw('members').map((member: any, index: any) => (
                    <div key={index} className="flex flex-col items-center space-y-2">
                        <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
                            <img
                                src={index === 0 ? "https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg" : "https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg"}
                                alt={member.alt}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        <span className="text-center text-orange-500 dark:text-orange-300">
                            {member.name}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    )
}

export default TeamMember