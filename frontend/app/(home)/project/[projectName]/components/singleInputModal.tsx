"use client";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  ModalHeader,
  Input,
  ModalFooter,
} from "@nextui-org/react";
import { useState } from "react";

export default function SingleInputModal({
  isOpen,
  onOpenChange,
  title,
  handleConfirm,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  handleConfirm: (v: string) => void;
}) {
  const [value, setValue] = useState<string>("");
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="value"
                variant="bordered"
                value={value}
                onValueChange={setValue}
              />
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleConfirm(value);
                  onClose();
                }}
              >
                确认
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
