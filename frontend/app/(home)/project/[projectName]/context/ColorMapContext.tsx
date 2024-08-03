"use client";

import { randomColor } from "@/app/utils/randomColor";
import { createContext, useState } from "react";

export const ColorMapContext = createContext<{
  colorMap: any;
  updateColorMap: (k: string, v: string) => void;
  randomColors: Array<string>;
}>({
  colorMap: {},
  updateColorMap: (k: string, v: string) => {},
  randomColors: [],
});

export default function ColorMapLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const randomColors: Array<string> = randomColor(1000, {
    start: 0,
    end: 255,
    opacity: 0.4,
  });
  const originMap = new Map<string, string>();
  originMap.set("null", "rgba(0,0,0,0.2)");
  const [colorMap, setColorMap] = useState<Map<string, string>>(new Map(originMap));

  const updateColorMap = (key: string, value: string) => {
    setColorMap((prev) => {
      let newColorMap = new Map(prev);
      newColorMap.set(key, value);
      return newColorMap;
    });
  };

  return (
    <ColorMapContext.Provider
      value={{ colorMap, updateColorMap, randomColors }}
    >
      {children}
    </ColorMapContext.Provider>
  );
}
