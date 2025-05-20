import React from 'react'

const TeamMember = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h2 className="text-center text-2xl font-bold mb-8 dark:text-white">项目成员</h2>
      <div className="flex justify-center flex-wrap gap-8">
        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src="https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/20/_20250520190857.jpg" alt="秋风" className="w-full h-full object-cover" />
          </div>
          <span className="text-center text-orange-500 dark:text-orange-300">一勺</span>
        </div>
        <div className="flex flex-col items-center space-y-2">
          <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 dark:bg-gray-800">
            <img src="https://qy-red-book.oss-cn-guangzhou.aliyuncs.com/i/2025/05/17/41.jpg" alt="轻叶" className="w-full h-full object-cover" />
          </div>
          <span className="text-center text-orange-500 dark:text-orange-300">轻叶</span>
        </div>
      </div>
    </div>
  )
}

export default TeamMember