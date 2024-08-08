"use client";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { useContext, useEffect, useRef, useState } from "react";
import { RootDirContext } from "../context/RootDirContext";
import { File } from "@/app/interfaces/file";
import { FaChevronLeft } from "react-icons/fa";
import { error } from "@/app/utils/message";

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

  const [currentPath, setCurrentPath] = useState<string>(rootPath);
  const [currentDir, setCurrentDir] = useState<any>(RootDir);
  const [lastDir, setLastDir] = useState<Array<any>>([]);
  const [currentFileList, setCurrentFileList] = useState<Array<File>>(
    getFileList(RootDir[Object.keys(RootDir)[0]])
  );
  const [currentSelectedFile, setCurrentSelectedFile] = useState<string>("");

  useEffect(() => {
    setCurrentFileList(getFileList(currentDir[Object.keys(currentDir)[0]]));
  }, [currentDir]);

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
        setCurrentPath(rootPath);
        setCurrentDir(RootDir);
        setCurrentSelectedFile("");
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
              <div className="w-full h-full absolute top-0 left-0 z-[1] p-2 pt-10 overflow-scroll no-scrollbar flex flex-col gap-2 ">
                {/* back button */}
                <div
                  className="absolute top-2 left-2 p-[6px] hover:bg-[#33333333] rounded-md"
                  onClick={() => {
                    if (currentPath === rootPath) return;
                    setCurrentSelectedFile("");
                    setCurrentPath(
                      currentPath.split("/").slice(0, -1).join("/")
                    );
                    setCurrentDir(lastDir[lastDir.length - 1]);
                    setLastDir([...lastDir].slice(0, -1));
                  }}
                >
                  <FaChevronLeft />
                </div>

                {/* directory */}
                {currentFileList.map((file: File) => (
                  <div key={file.name}>
                    {file.type === "file" ? (
                      <div
                        className={`w-full flex gap-2 text-md items-center cursor-pointer p-2 ${
                          currentSelectedFile === currentPath + "/" + file.name
                            ? "bg-[#33333366]"
                            : "bg-[#33333322]"
                        } hover:bg-[#33333377] transition-background rounded-lg`}
                        onClick={(e) => {
                          setCurrentSelectedFile(currentPath + "/" + file.name);
                        }}
                      >
                        {/* double click input */}
                        <span>{file.name}</span>
                      </div>
                    ) : (
                      <div
                        className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
                        onClick={() => {
                          setCurrentSelectedFile("");
                          setCurrentPath(currentPath + "/" + file.name);
                          setLastDir([...lastDir, currentDir]);
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

              {/* confirm button */}
              <div className="w-full bg-[white] absolute z-[2] bottom-0 left-0 py-2 flex justify-center items-center">
                <Button
                  onClick={() => {
                    if (currentSelectedFile === "") {
                      return;
                    }
                    if(currentSelectedFile.split('.').pop() !== 'json') {
                      error("请选择一个json文件！");
                      return;
                    }
                    handleConfig(currentSelectedFile);
                    onClose();
                  }}
                >
                  选择
                </Button>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
