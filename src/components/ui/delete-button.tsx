"use client";

import { Modal } from "antd";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

type DeleteAction = (id: number) => Promise<{ ok: boolean; message?: string }>;

export function DeleteButton({
  id,
  label,
  action,
}: {
  id: number;
  label: string;
  action: DeleteAction;
}) {
  const router = useRouter();

  function confirmDelete() {
    Modal.confirm({
      title: `Delete ${label}?`,
      content: "This action cannot be undone.",
      okText: "Delete",
      okType: "danger",
      cancelText: "Cancel",
      onOk: async () => {
        const result = await action(id);
        if (!result.ok) {
          toast.error(result.message ?? `Unable to delete ${label.toLowerCase()}.`);
          return;
        }

        toast.success(`${label} deleted.`);
        router.refresh();
      },
    });
  }

  return (
    <Button type="link" danger onClick={confirmDelete}>
      Delete
    </Button>
  );
}
