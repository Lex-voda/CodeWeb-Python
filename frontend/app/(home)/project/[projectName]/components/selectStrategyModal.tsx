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

export default function SelectStrategyModal({
  isOpen,
  onOpenChange,
  handleConfirm,
  strategyNames,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  handleConfirm: (v: string) => void;
  strategyNames: string[];
}) {
  const [value, setValue] = useState<string>("");
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      onClose={() => setValue("")}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">选择策略</ModalHeader>
            <ModalBody>
              {strategyNames.map((strategyName, index) => (
                <div
                  className={`flex items-center justify-center mx-12 p-[4px] shadow-sm rounded-lg cursor-pointer ${
                    value === strategyName ? "bg-[#c0c0c0]" : "bg-[white]"
                  } hover:bg-gray-300`}
                  onClick={() => setValue(strategyName)}
                  key={index}
                >
                  {strategyName}
                </div>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  if (value === "") return;
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
