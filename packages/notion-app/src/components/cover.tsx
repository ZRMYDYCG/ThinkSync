"use client";

import { cn } from "@/lib/utils";
import Image from "next/image";

interface CoverProps {
  url?: string;
  preview?: boolean;
}

const Cover = ({ url, preview }: CoverProps) => {
  return (
    <div
      className={cn(
        "relative w-full h-[35vh]",
        !url && "h-[12vh]",
        url && "bg-muted",
      )}
    >
      {!!url && <Image src={url} fill className="object-cover" alt="Cover" />}
    </div>
  );
};

export default Cover;
