"use client";
import { testStrategy } from "@/app/constants/testStrategy";
import { StrategyContent } from "@/app/interfaces/project";
import API from "@/app/utils/api";
import { useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { FiLogOut } from "react-icons/fi";
import StrategyModal from "./strategyModal";
import { useDisclosure } from "@nextui-org/react";
import ConfigModal from "./configModal";

export default function MainPage({ projectName }: { projectName: string}) {

    const [closed, setClosed] = useState(false);

    const [strategyTable, setStrategyTable] = useState<any>({});
    const [strategyContents, setStrategyContents] = useState<StrategyContent[]>([]);
    const [strategyNames, setStrategyNames] = useState<string[]>([]);

    const { isOpen: isStrategyOpen, onOpen: onStrategyOpen, onOpenChange: onStrategyOpenChange } = useDisclosure();
    const handleCheckStrategy = async () => {
        if (process.env.NEXT_PUBLIC_TEST === "test") {
            setStrategyNames(Object.keys(testStrategy));
            for (let i = 0; i < Object.keys(testStrategy).length; i++) {
                const strategyName = Object.keys(testStrategy)[i];
                // @ts-ignore
                setStrategyContents([...strategyContents, testStrategy[strategyName]]);
            }
            setStrategyTable(testStrategy);
        }
        else {
            const strategytable = API.getStrategy(projectName).then((res) => { return res.data.data.strategy_registry; });
            setStrategyNames(Object.keys(strategytable));
            for (let i = 0; i < Object.keys(strategytable).length; i++) {
                const strategyName = Object.keys(strategytable)[i];
                // @ts-ignore
                setStrategyContents([...strategyContents, strategytable[strategyName]]);
            }
            setStrategyTable(strategytable);
        }
        onStrategyOpen();
    }

    const { isOpen: isConfigOpen, onOpen: onConfigOpen, onOpenChange: onConfigOpenChange } = useDisclosure();
    const handleConfig = async (path: string) => {
        console.log(path);
    }

    return (
        <>
            <div
                className="fixed h-screen w-40 right-0 top-0 z-50 flex flex-col justify-between py-3 overflow-hidden transition-all bg-[#33333344] text-white"
                style={{ width: closed ? "0" : "160px", paddingLeft: closed ? "0" : "12px", paddingRight: closed ? "0" : "12px" }}
            >
                {/* top part */}
                <div className="min-w-[136px] flex flex-col gap-2">
                    <div className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg" onClick={handleCheckStrategy}>
                        <FiLogOut />
                        <span>查看注册表</span>
                    </div>
                    <div className="w-full flex gap-2 text-md items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg" onClick={onConfigOpen}>
                        <FiLogOut />
                        <span>配置文件路径</span>
                    </div>
                </div>
                {/* bottom part */}
                <div className="min-w-[136px] flex flex-col gap-2">

                </div>
            </div>

            {/* open or close button */}
            <div
                className=" bg-[#19191966] fixed top-2/3 w-10 h-10 right-[-20px] z-50 rounded-full transition-transform [clip-path:_polygon(0_0,_50%_0%,_50%_100%,_0%_100%);] flex items-center pl-[5px] text-white cursor-pointer"
                style={{ transform: closed ? "translateX(0px)" : "translateX(-160px)" }}
                onClick={(e) => setClosed(!closed)}
            >
                {closed ? (
                    <FaChevronLeft />
                ) : (
                    <FaChevronRight />
                )}
            </div>

            <div className="w-screen h-screen p-10 flex justify-between">
                {/* left part */}
                <div className="w-[55%] h-full flex flex-col justify-between">
                    {/* config part */}
                    <div className="w-full h-[35%] flex flex-col gap-2 p-4 rounded-xl bg-[#66666622]">
                        something
                    </div>
                    {/* mission part */}
                    <div className="w-full h-[60%] flex flex-col gap-2 p-4 rounded-xl bg-[#66666622]">
                        something
                    </div>
                </div>
                {/* right part */}
                <div className="w-[40%] h-full flex flex-col justify-between">
                    something
                </div>
            </div>

            {/* strategy modal */}
            <StrategyModal isOpen={isStrategyOpen} onOpenChange={onStrategyOpenChange} content={strategyTable} />

            {/* config modal */}
            <ConfigModal isOpen={isConfigOpen} onOpenChange={onConfigOpenChange} handleConfig={handleConfig} />
        </>
    );
}
