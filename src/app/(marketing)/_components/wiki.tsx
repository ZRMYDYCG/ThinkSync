import React from 'react'

const Wiki = () => {
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
                    探索ThinkSync的无限可能
                </h2>
                <div className="space-y-4 lg:space-y-6 ">
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-blue-600 dark:text-blue-400">
                            团队协作新方式
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            打破信息孤岛，实现跨部门无缝协作，让项目进展一目了然。
                        </p>
                    </div>
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-green-600 dark:text-green-400">
                            知识沉淀与传承
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            构建企业知识库，让经验与智慧得以积累和传承。
                        </p>
                    </div>
                    <div className="p-4 lg:p-6 bg-white dark:bg-gray-700 rounded-lg transition-colors duration-300">
                        <h3 className="text-base lg:text-lg font-semibold mb-2 text-purple-600 dark:text-purple-400">
                            个人成长加速器
                        </h3>
                        <p className="text-sm lg:text-base text-gray-600 dark:text-gray-300 leading-relaxed">
                            打造个人知识体系，支持Markdown，让学习笔记更专业。
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Wiki