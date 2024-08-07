"use client";
import { testSystemInfo } from "@/app/constants/testSystemInfo";
import { SystemInfo } from "@/app/interfaces/system";
import API from "@/app/utils/api";
import { logoutClicked } from "@/app/utils/login";
import { error } from "@/app/utils/message";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiCpu, FiLogOut } from "react-icons/fi";
import { MdExitToApp } from "react-icons/md";
import Draggable from "react-draggable";

export default function NavBar({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [closed, setClosed] = useState(false);
  const router = useRouter();

  const [monitorOpen, setMonitorOpen] = useState(false);
  const [systemInfo, setSystemInfo] = useState<SystemInfo | null>(null);

  const handleShowSystemInfo = () => {
    if (monitorOpen) {
      setMonitorOpen(false);
      return;
    }
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setSystemInfo(testSystemInfo);
      setMonitorOpen(true);
    } else {
      API.getMonitor().then((res) => {
        if (res.status === 200) {
          if (res.data.data) setSystemInfo(res.data.data);
          setMonitorOpen(true);
        } else {
          error("获取系统状态信息失败！");
        }
      });
    }
  };

  const monitorInterval = useRef<NodeJS.Timeout | null>(null);
  useEffect(() => {
    if (process.env.NEXT_PUBLIC_TEST != "test") {
      if (monitorOpen) {
        monitorInterval.current = setInterval(() => {
          API.getMonitor().then((res) => {
            if (res.status === 200) {
              if (res.data.data) setSystemInfo(res.data.data);
            }
          });
        }, 1000);
      } else {
        if (monitorInterval.current) {
          clearInterval(monitorInterval.current);
          monitorInterval.current = null;
        }
      }
    } else {
      if (monitorOpen) {
        monitorInterval.current = setInterval(() => {
          console.log("rmt");
        }, 1000);
      } else {
        if (monitorInterval.current) {
          clearInterval(monitorInterval.current);
          monitorInterval.current = null;
        }
      }
    }
  }, [monitorOpen]);

  return (
    <>
      <div
        className="fixed h-screen w-40 left-0 top-0 z-50 flex flex-col justify-between py-3 overflow-hidden transition-all bg-[#33333344] text-white"
        style={{
          width: closed ? "0" : "160px",
          paddingLeft: closed ? "0" : "12px",
          paddingRight: closed ? "0" : "12px",
        }}
      >
        {/* top part */}
        <div className="min-w-[136px] flex flex-col gap-2">
          <div
            className="w-full flex gap-2 text-lg items-center cursor-pointer py-2"
            onClick={() => router.push("/")}
          >
            <span className="font-bold animate-brand">Code-WEB</span>
          </div>
          <div
            className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={handleShowSystemInfo}
          >
            <FiCpu />
            <span>系统状态信息</span>
          </div>
        </div>
        {/* bottom part */}
        <div className="min-w-[136px] flex flex-col gap-2">
          <div
            className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={() => router.push("/")}
          >
            <FiLogOut />
            <span>退出项目</span>
          </div>
          <div
            className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={logoutClicked}
          >
            <MdExitToApp />
            <span>退出登录</span>
          </div>
        </div>
      </div>

      {/* open or close button */}
      <div
        className=" bg-[#19191966] fixed top-2/3 w-12 h-12 left-[136px] z-50 rounded-full transition-transform [clip-path:_polygon(50%_0,_100%_0%,_100%_100%,_50%_100%);] flex justify-end items-center pr-[6px] text-white cursor-pointer"
        style={{ transform: closed ? "translateX(-160px)" : "translateX(0)" }}
        onClick={(e) => setClosed(!closed)}
      >
        {closed ? <FaChevronRight /> : <FaChevronLeft />}
      </div>

      {/* monitor */}
      {monitorOpen && systemInfo && (
        <Draggable handle=".drag-handler">
          <div className="w-[400px] h-fit fixed z-[60] right-[200px] bottom-[30px] shadow-[0px_0px_4px_2px_rgba(0,0,0,0.2)] bg-[#ffffff33] select-none ">
            <div
              className="absolute right-[2px] top-[2px] w-6 h-6 flex justify-center items-center rounded-full bg-[#00000000] hover:bg-[#00000025] cursor-pointer"
              onClick={() => setMonitorOpen(false)}
            >
              ×
            </div>
            <div className="w-[calc(100%-6px)] h-5 bg-[#ffffff55] m-[3px] cursor-pointer drag-handler"></div>
            <div className="flex flex-col w-full gap-2 text-sm font-light p-4">
              <div className="py-2 flex items-center gap-2 rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] bg-[#ffffff77]">
                <div className="min-w-16 flex justify-center items-center ">
                  CPU
                </div>
                <div className="flex flex-col justify-center gap-[2px]">
                  {systemInfo.CPU.load && (
                    <div>利用率: {systemInfo.CPU.load}%</div>
                  )}
                  {systemInfo.CPU.temperature && (
                    <div>温度: {systemInfo.CPU.temperature}°C</div>
                  )}
                  {systemInfo.CPU.power && (
                    <div>功耗: {systemInfo.CPU.power}W</div>
                  )}
                </div>
              </div>
              <div className="py-2 flex items-center gap-2 rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] bg-[#ffffff77]">
                <div className="min-w-16 flex justify-center items-center ">
                  RAM
                </div>
                <div className="flex flex-col justify-center gap-[2px]">
                  {systemInfo.RAM.load && (
                    <div>利用率: {systemInfo.RAM.load}%</div>
                  )}
                </div>
              </div>
              <div className="py-2 flex items-center gap-2 rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] bg-[#ffffff77]">
                <div className="min-w-16 flex justify-center items-center ">
                  GPU
                </div>
                <div className="flex flex-col justify-center gap-[2px]">
                  {systemInfo.GPU.load && (
                    <div>利用率: {systemInfo.GPU.load}%</div>
                  )}
                  {systemInfo.GPU.temperature && (
                    <div>温度: {systemInfo.GPU.temperature}°C</div>
                  )}
                  {systemInfo.GPU.power && (
                    <div>功耗: {systemInfo.GPU.power}W</div>
                  )}
                </div>
              </div>
              <div className="py-2 flex items-center gap-2 rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] bg-[#ffffff77]">
                <div className="min-w-16 flex justify-center items-center ">
                  HDD
                </div>
                <div className="flex flex-col justify-center gap-[2px]">
                  {systemInfo.HDD.load && (
                    <div>利用率: {systemInfo.HDD.load}%</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Draggable>
      )}

      <div
        className="relative z-[1] w-screen h-screen transition-[clip-path] flex select-none"
        // style={{
        //   clipPath: closed
        //     ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
        //     : "polygon(250px 0%, 100% 0%, 100% 100%, 250px 100%)",
        // }}
      >
        <div
          className="w-[160px] h-full transition-width"
          style={{ width: closed ? "0px" : "160px" }}
        ></div>

        {children}
      </div>
    </>
  );
}
