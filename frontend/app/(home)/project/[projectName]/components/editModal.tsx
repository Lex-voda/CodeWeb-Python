"use client";
import { success } from "@/app/utils/message";
import { Modal, ModalContent, ModalBody, Button } from "@nextui-org/react";
import { useEffect, useRef, useState } from "react";// Using ES6 import syntax
import hljs from 'highlight.js/lib/core';
import python from 'highlight.js/lib/languages/python';
import 'highlight.js/styles/default.css';

export default function EditModal({
    isOpen,
    onOpenChange,
}: {
    isOpen: boolean;
    onOpenChange: () => void;
}) {

    const contentRef = useRef<HTMLDivElement | null>(null);

    const [codeContent, setCodeContent] = useState<string>("print(1)\nprint(2)\nprint(3)");

    const saveContent = async (e: React.KeyboardEvent<HTMLDivElement>) => {
        if (e.ctrlKey && e.key === 's') {
            e.preventDefault();
            console.log(contentRef.current?.innerText);
            success("保存成功！");
        }
        // else{
        //     if (contentRef.current) {
        //         hljs.highlightElement(contentRef.current);
        //         console.log(contentRef.current.innerText);
        //     }
        // }
    }

    useEffect(() => {
        // Then register the languages you need
        hljs.registerLanguage('python', python);
        // hljs.configure({
        //     ignoreUnescapedHTML: true
        // })
    }, [])

    return (
        <Modal
            className="w-full max-w-4xl h-full max-h-[600px]"
            isOpen={isOpen}
            onOpenChange={onOpenChange}
            classNames={{
                backdrop: "bg-[#11111123] blur-[20px]",
                closeButton: "absolute right-1 top-1 z-10",
                base: "rounded-none"
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
                                onChange={(e) => { console.log(e) }}
                                contentEditable
                                className="w-full h-full absolute top-0 left-0 z-[1] p-2 overflow-scroll no-scrollbar"
                            >
                                {codeContent}
                            </div>
                        </ModalBody>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}