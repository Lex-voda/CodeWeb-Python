"use client";

import { testFileDirectory } from "@/app/constants/testFileDirectory";
import API from "@/app/utils/api";
import { createContext, useEffect, useState } from "react";

export const RootDirContext = createContext<{
  RootDir: any;
  updateRootDir: () => void;
}>({
  RootDir: {},
  updateRootDir: () => {},
});

export default function RootDirLayout({
  children,
  projectName,
}: {
  children: React.ReactNode;
  projectName: string;
}) {
  const [RootDir, setRootDir] = useState<any>(testFileDirectory);

  const updateRootDir = async () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setRootDir(testFileDirectory);
    } else {
      API.getDirectory(projectName).then((res) => {
        setRootDir(res.data.data.file_directory);
      });
    }
  };

  useEffect(() => {
    updateRootDir();
  }, []);

  return (
    <RootDirContext.Provider value={{ RootDir, updateRootDir }}>
      {children}
    </RootDirContext.Provider>
  );
}
