"use client";
import { useDisclosure } from "@nextui-org/react";
import EditModal from "./editModal";

export default function TempFile() {
    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    return (
        <>
            <span onClick={onOpen}>open</span>
            <EditModal isOpen={isOpen} onOpenChange={onOpenChange} />
        </>
    )
}