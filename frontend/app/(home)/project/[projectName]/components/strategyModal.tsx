"use client";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";

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
                  <div key={strategyName} className=" ">
                    <p>
                      {strategyName}: {`{`}
                    </p>
                    <div className="pl-6">
                      <p>argus: {`{`}</p>
                      <div className="pl-6">
                        <p>
                          argu_name:{" "}
                          {
                            content[Object.keys(content)[index]]["argus"][
                              "argu_name"
                            ]
                          }
                        </p>
                        <p>
                          argus_annotation:{" "}
                          {
                            content[Object.keys(content)[index]]["argus"][
                              "argu_annotation"
                            ]
                          }
                        </p>
                        <p>
                          argus_default:{" "}
                          {
                            content[Object.keys(content)[index]]["argus"][
                              "argu_default"
                            ]
                          }
                        </p>
                      </div>
                      <p>{`}`}</p>
                      <p>
                        return_annotation:{" "}
                        {
                          content[Object.keys(content)[index]][
                            "return_annotation"
                          ]
                        }
                      </p>
                      <p>
                        comment:{" "}
                        {content[Object.keys(content)[index]]["comment"]}
                      </p>
                    </div>
                    <p>{`}`}</p>
                  </div>
                ))}
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
