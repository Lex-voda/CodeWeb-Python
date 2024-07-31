"use client";

import { testFileDirectory } from "@/app/constants/testFileDirectory";
import API from "@/app/utils/api";
import {
    createContext,
    useEffect,
    useState,
} from "react";

export const RootDirContext = createContext({
    RootDir: {},
    updateRootDir: () => { },
});

export default function RootDirLayout({ children }: { children: React.ReactNode }) {

    const [RootDir, setRootDir] = useState<any>(testFileDirectory);

    const updateRootDir = async () => {
        if (process.env.NEXT_PUBLIC_TEST === "test") {
            setRootDir(testFileDirectory);
        }
        else {
            API.getDirectory().then((res) => {
                setRootDir(res.data.data.file_directory);
            });
        }
    }

    useEffect(() => {
        updateRootDir();
    }, [])

    return (
        <RootDirContext.Provider value={{ RootDir, updateRootDir }}>
            {children}
        </RootDirContext.Provider>
    );
}
