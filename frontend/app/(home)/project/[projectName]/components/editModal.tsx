"use client";
import { error, success } from "@/app/utils/message";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { Dispatch, SetStateAction, useEffect, useRef, useState } from "react"; // Using ES6 import syntax
import hljs from "highlight.js/lib/core";
import python from "highlight.js/lib/languages/python";
import "highlight.js/styles/default.css";
import API from "@/app/utils/api";

export default function EditModal({
  isOpen,
  onOpenChange,
  content,
  filePath,
  messageList,
  setMessageList,
  projectName,
}: {
  isOpen: boolean;
  onOpenChange: () => void;
  content: string;
  filePath: string;
  messageList: Array<string>;
  setMessageList: Dispatch<SetStateAction<string[]>>;
  projectName: string;
}) {
  const contentRef = useRef<HTMLDivElement | null>(null);

  const handleSave = async () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([...messageList, `test: 修改文件${filePath}内容成功！`]);
      success("修改文件内容成功！");
    } else {
      if (contentRef.current)
        API.putFileContent(filePath, contentRef.current?.innerText).then(
          (res) => {
            if (res.status === 200) {
              if (res.data.message)
                setMessageList([...messageList, res.data.message]);
              success("修改文件内容成功！");
            } else {
              error("修改文件内容失败！");
            }
          }
        );
    }
  };

  const saveContent = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.ctrlKey && e.key === "s") {
      e.preventDefault();
      handleSave();
    }
    // innerHTML=innerHTML.replace(/<div>/g, "\n").replace(/<\/div>/g, "");
    // 初始innerText，初始innerHTML
    // 高亮原理
    // highlightElement原理
    // contentEditable原理
    // else{
    //     if (contentRef.current) {
    //         hljs.highlightElement(contentRef.current);
    //         console.log(contentRef.current.innerText);
    //     }
    // }
  };

  useEffect(() => {
    // Then register the languages you need
    hljs.registerLanguage("python", python);
    // hljs.configure({
    //     ignoreUnescapedHTML: true
    // })
  }, []);

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
              <div
                ref={contentRef}
                onKeyDown={saveContent}
                contentEditable
                className="w-full h-full absolute top-0 left-0 z-[1] p-2 overflow-scroll no-scrollbar"
              >
                {content}
                <div className="w-full bg-[white] absolute z-[2] bottom-0 left-0 py-2 flex justify-center items-center">
                  <Button
                    onClick={() => {
                      handleSave();
                      onClose();
                    }}
                  >
                    保存文件
                  </Button>
                </div>
              </div>
            </ModalBody>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
