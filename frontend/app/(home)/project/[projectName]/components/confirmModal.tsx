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

export default function ConfirmModal({
  isOpen,
  onOpenChange,
  title,
  handleConfirm,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  title: string;
  handleConfirm: () => void;
}) {
  return (
    <Modal isOpen={isOpen} onOpenChange={onOpenChange} placement="center">
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">{title}</ModalHeader>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  handleConfirm();
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
