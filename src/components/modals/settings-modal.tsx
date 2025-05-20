"use client";

import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { useSetting } from "@/hooks/useSetting";
import { Label } from "@/components/ui/label";
import { ModeToggle } from "@/components/mode-toggle";
import { LanguageToggle } from '@/components/language-toggle'

export const SettingsModal = () => {
  const setting = useSetting();

  return (
    <Dialog open={setting.isOpen} onOpenChange={setting.onClose}>
      <DialogContent>
        <DialogHeader className="border-b pb-3">
          <h2 className="text-lg font-medium">My Settings</h2>
        </DialogHeader>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>Appearance</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Customize the look and feel of the app
            </span>
          </div>
          <ModeToggle/>
        </div>
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-y-1">
            <Label>Language</Label>
            <span className="text-[0.8rem] text-muted-foreground">
              Current supported language is English and Chinese
            </span>
          </div>
          <LanguageToggle/>
        </div>
      </DialogContent>
    </Dialog>
  )
}
