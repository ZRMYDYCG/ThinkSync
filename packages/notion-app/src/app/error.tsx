"use client";

import Image from "next/image";
import Link from "next/link";

import { Button } from "@/components/ui/button";

const Error = () => {
  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <Image src="/error.png" alt="Notion logo" width={200} height={200} />
      <Image
        src="/error-dark.png"
        alt="Notion logo"
        className="hidden dark:block"
        width={200}
        height={200}
      />
      <h2 className="text-xl font-medium py-2">Something went wrong</h2>
      <Button asChild>
        <Link href="/documents">Go Back</Link>
      </Button>
    </div>
  );
};

export default Error;
