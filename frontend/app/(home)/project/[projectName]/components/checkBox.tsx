"use client";
import { Checkbox } from "@nextui-org/react";
import { useState } from "react";

export default function CheckBox({
  handleClick,
}: {
  handleClick: (v: boolean) => void;
}) {
  const [isSelected, setIsSelected] = useState<boolean>(false);
  return (
    <Checkbox
      isSelected={isSelected}
      onValueChange={(v) => {
        setIsSelected(v);
        handleClick(v);
      }}
    >
      <span className="text-sm">需要输出：{isSelected ? "是" : "否"}</span>
    </Checkbox>
  );
}
