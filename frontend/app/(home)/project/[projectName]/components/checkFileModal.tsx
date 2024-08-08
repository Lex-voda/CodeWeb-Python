"use client";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  useDisclosure,
  Tooltip,
} from "@nextui-org/react";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { RootDirContext } from "../context/RootDirContext";
import { File } from "@/app/interfaces/file";
import { FaChevronLeft } from "react-icons/fa";
import { error, success } from "@/app/utils/message";
import EditModal from "./editModal";
import API from "@/app/utils/api";
import {
  MdDeleteOutline,
  MdOutlineDriveFileRenameOutline,
  MdOutlineNoteAdd,
} from "react-icons/md";
import SingleInputModal from "./singleInputModal";
import ConfirmModal from "./confirmModal";
import { IoMdRefresh } from "react-icons/io";

export default function CheckFileModal({
  isOpen,
  onOpenChange,
  messageList,
  setMessageList,
  projectName,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  messageList: Array<string>;
  setMessageList: Dispatch<SetStateAction<string[]>>;
  projectName: string;
}) {
  const { RootDir, updateRootDir } = useContext(RootDirContext);
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
  const [currentSelectedFileType, setCurrentSelectedFileType] =
    useState<string>("");

  useEffect(() => {
    setCurrentFileList(getFileList(currentDir[Object.keys(currentDir)[0]]));
  }, [currentDir]);

  const [currentSelectedFileContent, setCurrentSelectedFileContent] =
    useState<string>("");

  const handleEdit = () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([
        ...messageList,
        `test: 请求文件${currentSelectedFile}内容成功！`,
      ]);
      success("请求文件内容成功！");
      setCurrentSelectedFileContent("test content");
      onEditOpen();
    } else {
      API.getFileContent(currentSelectedFile).then((res) => {
        if (res.status === 200) {
          if (res.data.data)
            setCurrentSelectedFileContent(res.data.data?.content);
          if (res.data.message)
            setMessageList([...messageList, res.data.message]);
          success("请求文件内容成功！");
          onEditOpen();
        } else {
          error("请求文件内容失败！");
        }
      });
    }
  };

  const {
    isOpen: isEditOpen,
    onOpen: onEditOpen,
    onOpenChange: onEditOpenChange,
  } = useDisclosure();

  const {
    isOpen: isAddOpen,
    onOpen: onAddOpen,
    onOpenChange: onAddOpenChange,
  } = useDisclosure();

  const {
    isOpen: isRenameOpen,
    onOpen: onRenameOpen,
    onOpenChange: onRenameOpenChange,
  } = useDisclosure();

  const {
    isOpen: isDeleteOpen,
    onOpen: onDeleteOpen,
    onOpenChange: onDeleteOpenChange,
  } = useDisclosure();

  const handleAdd = (v: string) => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([
        ...messageList,
        `test: 新建文件${currentPath + "/" + v}成功！`,
      ]);
      success("新建文件成功！");
    } else {
      API.postFile(currentPath + "/" + v).then((res) => {
        if (res.status === 200) {
          if (res.data.message)
            setMessageList([...messageList, res.data.message]);
          success("新建文件成功！");
          updateRootDir();
        } else {
          error("新建文件失败！");
        }
      });
    }
  };

  const handleDelete = () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([
        ...messageList,
        `test: 删除文件${currentSelectedFile}成功！`,
      ]);
      success("删除文件成功！");
    } else {
      API.deleteFile(currentSelectedFile).then((res) => {
        if (res.status === 200) {
          if (res.data.message)
            setMessageList([...messageList, res.data.message]);
          success("删除文件成功！");
          updateRootDir();
        } else {
          error("删除文件失败！");
        }
      });
    }
  };

  const handleRename = (v: string) => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([...messageList, `test: 文件${currentSelectedFile}重命名为${v}！`]);
      success("重命名文件成功！");
    } else {
      API.patchFile(currentSelectedFile, v).then((res) => {
        if (res.status === 200) {
          if (res.data.message)
            setMessageList([...messageList, res.data.message]);
          success("重命名文件成功！");
          updateRootDir();
        } else {
          error("重命名文件失败！");
        }
      });
    }
  };

  return (
    <>
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
                <div className="w-full h-full absolute top-0 left-0 z-[1] p-2 pt-0 overflow-scroll no-scrollbar flex flex-col gap-2 ">
                  {/* back button */}
                  <div className="sticky top-2 left-0 mb-2 p-[6px] w-fit bg-[#00000011] rounded-md flex items-center gap-2">
                    <div
                      className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md"
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
                    <div
                      className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md text-lg"
                      onClick={onAddOpen}
                    >
                      <MdOutlineNoteAdd />
                    </div>
                    <div
                      className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md text-lg"
                      onClick={() => {
                        if (currentSelectedFile === "") {
                          error("请选择文件！");
                          return;
                        }
                        onDeleteOpen();
                      }}
                    >
                      <MdDeleteOutline />
                    </div>
                    <div
                      className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md text-lg"
                      onClick={() => {
                        updateRootDir();
                      }}
                    >
                      <IoMdRefresh />
                    </div>
                    <div
                      className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md text-lg"
                      onClick={() => {
                        if (currentSelectedFile === "") {
                          error("请选择文件！");
                          return;
                        }
                        onRenameOpen();
                      }}
                    >
                      <MdOutlineDriveFileRenameOutline />
                    </div>
                  </div>

                  {/* directory */}
                  {currentFileList.map((file: File) => (
                    <div key={file.name}>
                      {file.type === "file" ? (
                        <div
                          className={`w-full flex gap-2 text-md items-center cursor-pointer p-2 ${
                            currentSelectedFile ===
                            currentPath + "/" + file.name
                              ? "bg-[#33333366]"
                              : "bg-[#33333322]"
                          } hover:bg-[#33333377] transition-background rounded-lg`}
                          onClick={(e) => {
                            setCurrentSelectedFile(
                              currentPath + "/" + file.name
                            );
                            setCurrentSelectedFileType("file");
                          }}
                          onDoubleClick={() => {
                            handleEdit();
                          }}
                        >
                          {/* double click input */}
                          <span>{file.name}</span>
                        </div>
                      ) : (
                        <div
                          className={`w-full flex gap-2 text-md items-center cursor-pointer p-2 ${
                            currentSelectedFile ===
                            currentPath + "/" + file.name
                              ? "bg-[#33333366]"
                              : "bg-[#33333322]"
                          } hover:bg-[#33333377] transition-background rounded-lg`}
                          onClick={() => {
                            setCurrentSelectedFile(
                              currentPath + "/" + file.name
                            );
                            setCurrentSelectedFileType("dir");
                          }}
                          onDoubleClick={() => {
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
                {/* <div className="w-full bg-[white] absolute z-[2] bottom-0 left-0 py-2 flex justify-center items-center">
                  <Button
                    onClick={() => {
                      if (currentSelectedFile === "") {
                        error("请选择文件!");
                        return;
                      }
                      if(currentSelectedFileType === "dir") {
                        error("请选择文件而不是文件夹！");
                        return;
                      }
                      handleEdit();
                      onClose();
                    }}
                  >
                    查看文件
                  </Button>
                </div> */}
              </ModalBody>
            </>
          )}
        </ModalContent>
      </Modal>

      <EditModal
        isOpen={isEditOpen}
        onOpenChange={onEditOpenChange}
        filePath={currentSelectedFile}
        content={currentSelectedFileContent}
        messageList={messageList}
        setMessageList={setMessageList}
        projectName={projectName}
      ></EditModal>

      <SingleInputModal
        isOpen={isAddOpen}
        onOpenChange={onAddOpenChange}
        title="添加文件"
        handleConfirm={handleAdd}
      ></SingleInputModal>

      <ConfirmModal
        isOpen={isDeleteOpen}
        onOpenChange={onDeleteOpenChange}
        title="确认删除文件？"
        handleConfirm={handleDelete}
      ></ConfirmModal>

      <SingleInputModal
        isOpen={isRenameOpen}
        onOpenChange={onRenameOpenChange}
        title="重命名文件"
        handleConfirm={handleRename}
      ></SingleInputModal>
    </>
  );
}
