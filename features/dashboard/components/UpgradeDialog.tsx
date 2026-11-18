"use client";

import { BaseDialog } from "@/components/common/BaseDialog";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface UpgradeDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  reason?: string;
}

export function UpgradeDialog({
  isOpen,
  onOpenChange,
  reason,
}: UpgradeDialogProps) {
  const router = useRouter();

  return (
    <BaseDialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      title="Upgrade Your Workspace Plan"
      description={
        reason ||
        "Free users are limited to 1 board, 3 subtasks per task, and basic shortcuts. Upgrade to Pro or Enterprise to unlock full features."
      }
    >
      <div className="flex justify-end space-x-3 pt-4">
        <Button
          variant="outline"
          onClick={() => onOpenChange(false)}
          className="cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          onClick={() => {
            onOpenChange(false);
            router.push("/pricing");
          }}
          className="cursor-pointer"
        >
          View Plans
        </Button>
      </div>
    </BaseDialog>
  );
}
