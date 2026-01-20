import { Button } from '@/components/ui/button'

import Logo from './logo'

const Footer = () => {
  return (
    <div className="z-50 flex w-full items-center bg-background p-6">
      <Logo></Logo>
      <div className="flex w-full items-center justify-between gap-x-2 text-muted-foreground md:ml-auto md:justify-end">
        <Button variant="ghost" size="sm">
          Privacy Policy
        </Button>
        <Button variant="ghost" size="sm">
          Terms of Service
        </Button>
      </div>
    </div>
  )
}

export default Footer
