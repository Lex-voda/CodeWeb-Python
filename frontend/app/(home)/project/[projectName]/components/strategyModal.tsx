"use client";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";

export default function StrategyModal({
  isOpen,
  onOpenChange,
  content,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  content: any;
}) {
  return (
    <Modal
      className="w-full max-w-4xl h-full max-h-[600px]"
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      classNames={{
        backdrop: "bg-[#11111123] blur-[20px]",
        closeButton: "absolute right-1 top-1 z-10",
        base: "rounded-none",
      }}
      isDismissable={false}
      closeButton={true}
      //   onClose={() =>
      //     setCurrentStep(0)
      //   }
      onClick={(e) => {
        e.stopPropagation();
      }}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="w-full h-full relative left-0 top-0">
              <div className="w-full h-full absolute top-0 left-0 z-[1] p-6 overflow-scroll no-scrollbar flex flex-col gap-3 ">
                {Object.keys(content).map((strategyName, index) => (
                  <Table aria-label="strategy table" key={index}>
                    <TableHeader>
                      <TableColumn>Strategy Name</TableColumn>
                      <TableColumn>Argus</TableColumn>
                      <TableColumn>Return Annotation</TableColumn>
                      <TableColumn>Comment</TableColumn>
                    </TableHeader>
                    <TableBody>
                      <TableRow key="1">
                        <TableCell>{strategyName}</TableCell>
                        <TableCell>
                          <Table aria-label="Example static collection table">
                            <TableHeader>
                              <TableColumn>Argu Name</TableColumn>
                              <TableColumn>Argu Annotation</TableColumn>
                              <TableColumn>Argu Default</TableColumn>
                            </TableHeader>
                            <TableBody>
                              {content[Object.keys(content)[index]][
                                "argus"
                              ].map((argu: any) => {
                                return (
                                  <TableRow key={argu["argu_name"]}>
                                    <TableCell>{argu["argu_name"]}</TableCell>
                                    <TableCell>
                                      {argu["argu_annotation"]}
                                    </TableCell>
                                    <TableCell>
                                      {argu["argu_default"]}
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </TableCell>
                        <TableCell>
                          {
                            content[Object.keys(content)[index]][
                              "return_annotation"
                            ]
                          }
                        </TableCell>
                        <TableCell>
                          {content[Object.keys(content)[index]]["comment"]}
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                ))}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
