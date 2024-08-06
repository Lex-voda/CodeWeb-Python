"use client";
import { logoutClicked } from "@/app/utils/login";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";

export default function NavBar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [closed, setClosed] = useState(false);
  const router = useRouter();

  return (
    <>
      <div
        className="fixed h-screen w-60 left-0 top-0 z-50 flex flex-col justify-between py-3 overflow-hidden transition-all bg-[#33333344] text-white"
        style={{
          width: closed ? "0" : "240px",
          paddingLeft: closed ? "0" : "12px",
          paddingRight: closed ? "0" : "12px",
        }}
      >
        {/* top part */}
        <div className="min-w-[216px] flex flex-col gap-2">
          <div
            className="w-full flex gap-2 text-lg items-center cursor-pointer"
            onClick={() => router.push("/")}
          >
            <span className="font-bold animate-brand">Code-WEB</span>
          </div>
        </div>
        {/* bottom part */}
        <div className="min-w-[216px] flex flex-col gap-2">
          <div
            className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={logoutClicked}
          >
            <FiLogOut />
            <span>退出登录</span>
          </div>
          <div
            className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={() => router.push("/")}
          >
            <FiLogOut />
            <span>退出项目</span>
          </div>
        </div>
      </div>

      {/* open or close button */}
      <div
        className=" bg-[#19191966] fixed top-2/3 w-12 h-12 left-[216px] z-50 rounded-full transition-transform [clip-path:_polygon(50%_0,_100%_0%,_100%_100%,_50%_100%);] flex justify-end items-center pr-[6px] text-white cursor-pointer"
        style={{ transform: closed ? "translateX(-240px)" : "translateX(0)" }}
        onClick={(e) => setClosed(!closed)}
      >
        {closed ? <FaChevronRight /> : <FaChevronLeft />}
      </div>

      <div
        className="relative z-[1] w-screen h-screen transition-[clip-path] flex"
        // style={{
        //   clipPath: closed
        //     ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
        //     : "polygon(250px 0%, 100% 0%, 100% 100%, 250px 100%)",
        // }}
      >
        <div
          className="w-[240px] h-full transition-width"
          style={{ width: closed ? "0px" : "240px" }}
        ></div>

        {children}
      </div>
    </>
  );
}
