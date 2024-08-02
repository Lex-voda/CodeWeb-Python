"use client";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { useContext, useState } from "react";
import { RootDirContext } from "./RootDirContext";
import { File } from "@/app/interfaces/file";

export default function ConfigModal({
  isOpen,
  onOpenChange,
  handleConfig,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  handleConfig: (path: string) => void;
}) {
  const { RootDir } = useContext(RootDirContext);
  const rootPath = "/" + Object.keys(RootDir)[0];

  const getFileList = (fileList: Array<any>) => {
    let tempArray: Array<File> = [];
    for (let i = 0; i < fileList.length; i++) {
      if (typeof fileList[i] === "string") {
        tempArray.push({ name: fileList[i], type: "file" });
      } else {
        tempArray.push({ name: Object.keys(fileList[i])[0], type: "dir" });
      }
    }
    return tempArray;
  };

  const [currentFileList, setCurrentFileList] = useState<Array<File>>(
    // @ts-ignore
    getFileList(RootDir[Object.keys(RootDir)[0]])
  );
  const [currentPath, setCurrentPath] = useState<string>(rootPath);
  const [currentDir, setCurrentDir] = useState<any>(RootDir);

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
      onClose={() => {
        // @ts-ignore
        setCurrentFileList(getFileList(RootDir[Object.keys(RootDir)[0]]));
        setCurrentPath(rootPath);
        setCurrentDir(RootDir);
      }}
      onClick={(e) => {
        e.stopPropagation();
      }}
      placement="center"
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalBody className="w-full h-full relative left-0 top-0">
              <div className="w-full h-full absolute top-0 left-0 z-[1] p-2 overflow-scroll no-scrollbar flex flex-col gap-2 ">
                {currentFileList.map((file: File) => (
                  <div key={file.name}>
                    {file.type === "file" ? (
                      <div
                        className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
                        onClick={() =>
                          handleConfig(currentPath + "/" + file.name)
                        }
                      >
                        {/* double click input */}
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      <div
                        className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
                        onClick={() => {
                          setCurrentPath(currentPath + "/" + file.name);
                          setCurrentFileList((currentList) => {
                            let fl = currentDir[Object.keys(currentDir)[0]];
                            for (let i = 0; i < fl.length; i++) {
                              if (typeof fl[i] === "string") {
                              } else {
                                if (Object.keys(fl[i])[0] === file.name)
                                  return getFileList(
                                    fl[i][Object.keys(fl[i])[0]]
                                  );
                              }
                            }
                            return currentList;
                          });
                          setCurrentDir((currentDir: any) => {
                            let fl = currentDir[Object.keys(currentDir)[0]];
                            for (let i = 0; i < fl.length; i++) {
                              if (typeof fl[i] === "string") {
                              } else {
                                if (Object.keys(fl[i])[0] === file.name)
                                  return fl[i];
                              }
                            }
                            return currentDir;
                          });
                        }}
                      >
                        <span>{file.name}</span>
                      </div>
                    )}
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
