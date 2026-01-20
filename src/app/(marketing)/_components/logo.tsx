import { Poppins } from 'next/font/google'
import Image from 'next/image'

import { cn } from '@/lib/utils'

const font = Poppins({
  subsets: ['latin'],
  weight: ['400', '600'],
})

const Logo = () => {
  return (
    <div className="hidden items-center gap-x-2 md:flex">
      <Image src="/logo.svg" alt="ThinkSync" width="40" height="40"></Image>
      <p className={cn('font-semibold', font)}>ThinkSync</p>
    </div>
  )
}

export default Logo
