"use client";

import { Id } from "@/../convex/_generated/dataModel";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { useRouter } from "next/navigation";
import { useUser } from "@clerk/clerk-react";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { MoreHorizontalIcon, Trash } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useTranslations } from 'next-intl'

interface MenuProps {
  documentId: Id<"documents">;
}

const Menu = ({ documentId }: MenuProps) => {
  const router = useRouter();
  const { user } = useUser();
  const archive = useMutation(api.documents.archive);
  
  const tClobal = useTranslations('Global')
  const tApp = useTranslations('App')

  const onArchive = () => {
    const promise = archive({ id: documentId });

    toast.promise(promise, {
      loading: "Archiving...",
      success: "Document archived",
      error: "Failed to archive document",
    });

    router.push("/documents");
  };
  return (
    <div>
      <DropdownMenu>
        <DropdownMenuTrigger>
          <Button size="sm" variant="ghost" className="h-4 w-4">
            <MoreHorizontalIcon />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          className="w-60"
          align="end"
          alignOffset={8}
          forceMount
        >
          <DropdownMenuItem onClick={onArchive}>
            <Trash className="mr-2 h-4 w-4" />
            { tClobal('delete') }
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <div className="text-xs text-muted-foreground p-2">
            { tApp('tips.lastEditedBy') }: {user?.fullName}
          </div>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

Menu.Skeleton = function MenuSkeleton() {
  return <Skeleton className="h-4 w-10" />;
};

export default Menu;
