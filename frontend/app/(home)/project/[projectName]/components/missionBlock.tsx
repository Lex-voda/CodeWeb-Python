"use client";
import { Dispatch, SetStateAction, useRef, useState } from "react";
import { Mission, StrategyContent } from "../../../../interfaces/project";
import { VscDebugStart } from "react-icons/vsc";
import { FaRegCircleStop } from "react-icons/fa6";
import { MdExpandMore } from "react-icons/md";
import { IoAddSharp } from "react-icons/io5";
import { useDisclosure } from "@nextui-org/react";
import SelectStrategyModal from "./selectStrategyModal";
import CheckBox from "./checkBox";
import { error } from "@/app/utils/message";
import SingleInputModal from "./singleInputModal";
import { BiSolidEdit } from "react-icons/bi";

export default function MissionBlock({
  missionIndex,
  mission,
  missionTable,
  currentMission,
  missionColor,
  strategyNames,
  strategyContents,
  setMissionTable,
  handleStartMission,
  handleStopMission,
}: {
  missionIndex: number;
  mission: Mission;
  missionTable: Mission[];
  currentMission: string;
  missionColor: string;
  strategyNames: string[];
  strategyContents: Array<StrategyContent>;
  setMissionTable: Dispatch<SetStateAction<Mission[]>>;
  handleStartMission: (index: number) => void;
  handleStopMission: (index: number) => void;
}) {
  const [closed, setClosed] = useState(false);
  const {
    isOpen: isSelectStrategyOpen,
    onOpen: onSelectStrategyOpen,
    onOpenChange: onSelectStrategyOpenChange,
  } = useDisclosure();
  const {
    isOpen: isMissionNameOpen,
    onOpen: onMissionNameOpen,
    onOpenChange: onMissionNameOpenChange,
  } = useDisclosure();
  const strategyCount = useRef(0);
  const missionRef = useRef<HTMLDivElement | null>(null);

  const handleMissionName = (newName: string) => {
    let newMissionTable = [...missionTable];
    newMissionTable[missionIndex].name = newName;
    setMissionTable(newMissionTable);
  };

  const handleAddStrategy = (strategyName: string) => {
    let strategyContent = strategyContents[strategyNames.indexOf(strategyName)];
    let newMissionTable = [...missionTable];
    let newARGS: any = {};
    for (let i = 0; i < strategyContent.argus.length; i++) {
      newARGS[strategyContent.argus[i].argu_name] = null;
    }
    newMissionTable[missionIndex].STRATEGY_QUEUE = [
      ...newMissionTable[missionIndex].STRATEGY_QUEUE,
      {
        FUNC: strategyName,
        ARGS: newARGS,
        ID: "RMT" + strategyCount.current++,
      },
    ];
    setMissionTable(newMissionTable);
  };

  function handleClickGetOutput(id: string) {
    return (v: boolean) => {
      let newMissionTable = [...missionTable];
      if (v) {
        newMissionTable[missionIndex].GET_OUTPUT.push(id);
      } else {
        newMissionTable[missionIndex].GET_OUTPUT = newMissionTable[
          missionIndex
        ].GET_OUTPUT.filter((item) => item !== id);
      }
      setMissionTable(newMissionTable);
    };
  }
  return (
    <div
      className="relative w-full p-2 rounded-lg shadow-sm transition-height overflow-scroll no-scrollbar max-h-[400px]"
      ref={missionRef}
      style={{
        height: closed ? "36px" : `${missionRef.current?.scrollHeight}px`,
        backgroundColor: missionColor,
      }}
      key={missionIndex}
    >
      <div className="relative w-full h-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <VscDebugStart
            className="size-5 cursor-pointer"
            onClick={() => {
              if (currentMission === "") {
                handleStartMission(missionIndex);
              } else {
                error("请先停止当前任务！");
              }
            }}
          />
          {currentMission === mission.name && (
            <FaRegCircleStop
              className="size-5 cursor-pointer"
              onClick={() => {
                handleStopMission(missionIndex);
              }}
            />
          )}
          <span className="text-md font-bold">{mission.name}</span>
          {currentMission !== mission.name && (
            <BiSolidEdit
              className="h-full flex items-center cursor-pointer"
              onClick={onMissionNameOpen}
            />
          )}
        </div>
        <div className="flex items-center">
          <MdExpandMore
            className="cursor-pointer size-8 transition-transform"
            style={{ transform: closed ? "rotate(0)" : "rotate(180deg)" }}
            onClick={() => setClosed(!closed)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-2">
        {mission.STRATEGY_QUEUE.map((strategy, index) => (
          <div className={`relative w-full h-fit `} key={index}>
            <div
              className={`w-[70%] h-fit p-2 overflow-scroll no-scrollbar flex gap-2 items-center rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] ${
                "bg-[" + missionColor + "]"
              }`}
            >
              <div className="flex items-center justify-center p-[6px] shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] rounded-lg">
                {strategy.FUNC}
              </div>
              {Object.keys(strategy.ARGS).map((arg) => (
                <div
                  className="flex items-center justify-center p-[6px] shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] rounded-lg hover:bg-[#ffffff66] cursor-pointer"
                  onClick={() => {
                    // TODO
                  }}
                  key={arg}
                >
                  {arg}:
                  {typeof strategy.ARGS[arg] === "object"
                    ? JSON.stringify(strategy.ARGS[arg])
                    : String(strategy.ARGS[arg])}
                </div>
              ))}
            </div>
            {/* select get output */}
            <div className="absolute right-0 top-0 h-full w-[25%] px-2 flex justify-center items-center rounded-lg bg-[#ffffff33]">
              <CheckBox
                handleClick={handleClickGetOutput(strategy.ID)}
              ></CheckBox>
            </div>
          </div>
        ))}
        {/* add strategy */}
        <div
          className="w-12 h-12 flex justify-center items-center border-dashed border-2 border-[#ffffff66] cursor-pointer"
          onClick={onSelectStrategyOpen}
        >
          <IoAddSharp className="size-7 text-[#ffffff66]" />
        </div>
      </div>

      {/* select strategy modal */}
      <SelectStrategyModal
        isOpen={isSelectStrategyOpen}
        onOpenChange={onSelectStrategyOpenChange}
        handleConfirm={handleAddStrategy}
        strategyNames={strategyNames}
      />

      {/* modify mission name modal */}
      <SingleInputModal
        isOpen={isMissionNameOpen}
        onOpenChange={onMissionNameOpenChange}
        handleConfirm={handleMissionName}
        title={`输入任务${mission.name}新的名称`}
      />
    </div>
  );
}
