"use client";

import { Id } from "@/../convex/_generated/dataModel";
import { useRouter } from "next/navigation";
import { useMutation } from "convex/react";
import { api } from "@/../convex/_generated/api";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import ConfirmModal from "@/components/modals/confirm-modal";

interface BannerProps {
  documentId: Id<"documents">;
}

const Banner = ({ documentId }: BannerProps) => {
  const router = useRouter();

  const remove = useMutation(api.documents.remove);
  const restore = useMutation(api.documents.restore);

  const onRemove = async () => {
    const promise = remove({ id: documentId });
    toast.promise(promise, {
      loading: "Removing...",
      success: "Removed",
      error: "Failed to remove",
    });
    router.push("/documents");
  };

  const onRestore = async () => {
    const promise = restore({ id: documentId });

    toast.promise(promise, {
      loading: "Restoring...",
      success: "Restored",
      error: "Failed to restore",
    });
  };

  return (
    <div className="bg-rose-500 text-center text-sm p-2 text-white flex items-center gap-x-2 justify-center">
      <p>This document is in the trash.</p>
      <Button
        size="sm"
        onClick={onRestore}
        variant="outline"
        className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
      >
        Restore Document
      </Button>
      <ConfirmModal onConfirm={onRemove}>
        <Button
          size="sm"
          variant="outline"
          className="border-white bg-transparent hover:bg-primary/5 text-white hover:text-white p-1 px-2 h-auto font-normal"
        >
          Delete Forever
        </Button>
      </ConfirmModal>
    </div>
  );
};

export default Banner;
