"use client";
import { error } from "@/app/utils/message";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  ModalHeader,
  Input,
  ModalFooter,
  Checkbox,
} from "@nextui-org/react";
import { useState } from "react";

export default function AddMissionModal({
  isOpen,
  onOpenChange,
  handleConfirm,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  handleConfirm: (v: string, i: boolean) => void;
}) {
  const [value, setValue] = useState<string>("");
  const [isIterable, setIsIterable] = useState<boolean>(false);
  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      onClose={() => {
        setValue("");
        setIsIterable(false);
      }}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              增加新任务
            </ModalHeader>
            <ModalBody>
              <Input
                autoFocus
                label="value"
                variant="bordered"
                placeholder="请输入任务名称"
                value={value}
                onValueChange={setValue}
              />
              <Checkbox isSelected={isIterable} onValueChange={setIsIterable}>
                是否为迭代任务：{isIterable ? "是" : "否"}
              </Checkbox>
            </ModalBody>
            <ModalFooter>
              <Button color="danger" variant="flat" onPress={onClose}>
                取消
              </Button>
              <Button
                color="primary"
                onPress={() => {
                  if(value === "") {
                    error("任务名称不能为空");
                    return;
                  }
                  handleConfirm(value, isIterable);
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
