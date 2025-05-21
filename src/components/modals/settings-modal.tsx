"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSetting } from "@/hooks/useSetting";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from '@/components/language-toggle'
import { useTranslations } from "next-intl";

export const SettingsModal = () => {
  const setting = useSetting();
  
  const tApp = useTranslations('App')

  return (
    <Dialog open={setting.isOpen} onOpenChange={setting.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">{tApp('tips.MySettings')}</h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>{tApp('tips.Appearance')}</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              {tApp('tips.CustomizeTheLookAndFeelOfTheApp')}
            </span>
          </div>
          <ModeToggle/>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>{tApp('tips.Language')}</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              { tApp('tips.CurrentSupportedLanguageIsEnglishAndChinese') }
            </span>
          </div>
          <LanguageToggle/>
        </div>
      </DialogContent>
    </Dialog>
  )
}
