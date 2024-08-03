"use client";
import { StrategyContent } from "@/app/interfaces/project";
import { error } from "@/app/utils/message";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  ModalHeader,
  Input,
  ModalFooter,
  Select,
  SelectItem,
} from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { useState } from "react";

export default function SelectParameterModal({
  isOpen,
  onOpenChange,
  handleConfirm,
  strategyNames,
  strategyContents,
  currentOpenStrategyName,
  currentOpenStrategyID,
  configTable,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  handleConfirm: (v: Array<any>) => void;
  strategyNames: string[];
  strategyContents: Array<StrategyContent>;
  currentOpenStrategyName: string;
  currentOpenStrategyID: string;
  configTable: any;
}) {
  const [args, setArgs] = useState<Array<any>>(
    Array(
      strategyContents[strategyNames.indexOf(currentOpenStrategyName)].argus
        .length
    ).fill("")
  );

  const argusRange: any = { ...configTable, ...{ default: null } };
  for (let i = 0; i < Number(currentOpenStrategyID.split("_")[1]); i++) {
    argusRange[`RMT_${i}_OUTPUT`] = `RMT_${i}_OUTPUT`;
  }

  const [selectedKeys, setSelectedKeys] = useState<Array<string>>([]);

  const handleSelectionChange = (e: any, index: number) => {
    setSelectedKeys((prev) => {
      let newSelectedKeys = [...prev];
      newSelectedKeys[index] = e.target.value;
      return newSelectedKeys;
    });
    setArgs((prev) => {
      let newArgs = [...prev];
      newArgs[index] = argusRange[e.target.value];
      return newArgs;
    });
  };

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      placement="center"
      onClose={() => {
        setSelectedKeys([]);
        setArgs([]);
      }}
      className="max-h-[80vh] overflow-scroll no-scrollbar"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">选择参数</ModalHeader>
            <ModalBody>
              <p>策略详情：</p>
              <Table aria-label="Example static collection table">
                <TableHeader>
                  <TableColumn>Argu Name</TableColumn>
                  <TableColumn>Argu Annotation</TableColumn>
                  <TableColumn>Argu Default</TableColumn>
                </TableHeader>
                <TableBody>
                  {strategyContents[
                    strategyNames.indexOf(currentOpenStrategyName)
                  ].argus.map((argu: any) => {
                    return (
                      <TableRow key={argu["argu_name"]}>
                        <TableCell>{argu["argu_name"]}</TableCell>
                        <TableCell>{argu["argu_annotation"]}</TableCell>
                        <TableCell>{argu["argu_default"]}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p>配置表详情</p>
              <Table
                aria-label="Example static collection table"
                className=" max-h-full overflow-scroll no-scrollbar"
                classNames={{
                  wrapper: " max-h-full overflow-scroll no-scrollbar ",
                }}
                isHeaderSticky={true}
              >
                <TableHeader>
                  <TableColumn>Key</TableColumn>
                  <TableColumn>Value</TableColumn>
                </TableHeader>
                <TableBody>
                  {Object.keys(configTable).map((configName, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>{configName}</TableCell>
                        <TableCell className="relative w-full pr-6">
                          <span>
                            {typeof configTable[configName] === "object"
                              ? JSON.stringify(configTable[configName])
                              : String(configTable[configName])}
                          </span>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              <p>参数选择：</p>
              {strategyContents[
                strategyNames.indexOf(currentOpenStrategyName)
              ].argus.map((argu: any, index) => (
                <div key={index} className="flex gap-2 items-center justify-between">
                  <p className="w-[15%] flex justify-center items-center">{argu["argu_name"]}: </p>
                  <Select
                    label="选择参数值"
                    variant="bordered"
                    placeholder="选择参数值"
                    selectedKeys={[selectedKeys[index]]}
                    className="max-w-xs"
                    onChange={(e) => {
                      handleSelectionChange(e, index);
                    }}
                  >
                    {Object.keys(argusRange).map((paraName) => (
                      <SelectItem key={paraName}>{paraName}</SelectItem>
                    ))}
                  </Select>
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
                  for (let i = 0; i < args.length; i++) {
                    if (args[i] === "") {
                      error("请选择所有参数！");
                      return;
                    }
                  }
                  handleConfirm(args);
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
