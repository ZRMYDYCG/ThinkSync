"use client";

import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import React from "react";

interface ConfirmModalProps {
  children?: React.ReactNode;
  onConfirm: () => void;
}

export const ConfirmModal = ({}: ConfirmModalProps) => {};
