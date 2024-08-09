"use client";
import {
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { Mission, StrategyContent } from "../../../../interfaces/project";
import { VscDebugStart } from "react-icons/vsc";
import { FaRegCircleStop } from "react-icons/fa6";
import { MdDeleteOutline, MdExpandMore } from "react-icons/md";
import { IoAddSharp } from "react-icons/io5";
import { useDisclosure } from "@nextui-org/react";
import SelectStrategyModal from "./selectStrategyModal";
import CheckBox from "./checkBox";
import { error } from "@/app/utils/message";
import SingleInputModal from "./singleInputModal";
import { BiSolidEdit } from "react-icons/bi";
import SelectParameterModal from "./selectParameterModal";
import { ColorMapContext } from "../context/ColorMapContext";
import ConfirmModal from "./confirmModal";
import { FiImage } from "react-icons/fi";
import Image from "next/image";

export default function MissionBlock({
  missionIndex,
  mission,
  missionTable,
  currentMission,
  strategyNames,
  strategyContents,
  setMissionTable,
  handleStartMission,
  handleStopMission,
  configTable,
  missionResData,
  lastMission,
}: {
  missionIndex: number;
  mission: Mission;
  missionTable: Mission[];
  currentMission: string;
  strategyNames: string[];
  strategyContents: Array<StrategyContent>;
  setMissionTable: Dispatch<SetStateAction<Mission[]>>;
  handleStartMission: (index: number) => void;
  handleStopMission: (index: number) => void;
  configTable: any;
  missionResData: any;
  lastMission: string;
}) {
  const { colorMap, updateColorMap, randomColors } =
    useContext(ColorMapContext);

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
        ID: "Func_" + strategyCount.current++,
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

  const {
    isOpen: isSelectParameterOpen,
    onOpen: onSelectParameterOpen,
    onOpenChange: onSelectParameterOpenChange,
  } = useDisclosure();
  const [currentOpenStrategyName, setCurrentOpenStrategyName] =
    useState<string>("");
  const [currentOpenStrategyID, setCurrentOpenStrategyID] =
    useState<string>("");

  const handleSelectParameter = (args: Array<any>) => {
    let strategyContent =
      strategyContents[strategyNames.indexOf(currentOpenStrategyName)];
    let newMissionTable = [...missionTable];
    let newARGS: any = {};
    for (let i = 0; i < strategyContent.argus.length; i++) {
      newARGS[strategyContent.argus[i].argu_name] = args[i];
    }
    for (
      let i = 0;
      i < newMissionTable[missionIndex].STRATEGY_QUEUE.length;
      i++
    ) {
      if (
        newMissionTable[missionIndex].STRATEGY_QUEUE[i].ID ===
        currentOpenStrategyID
      ) {
        newMissionTable[missionIndex].STRATEGY_QUEUE[i].ARGS = newARGS;
        break;
      }
    }
    setMissionTable(newMissionTable);
  };

  useEffect(() => {
    let originSize = colorMap.size;
    for (let i = 0; i < mission.STRATEGY_QUEUE.length; i++) {
      let strategy = mission.STRATEGY_QUEUE[i];
      if (colorMap.has(strategy.ID)) continue;
      updateColorMap(strategy.ID, randomColors[originSize + i]);
    }
  }, [mission.STRATEGY_QUEUE, colorMap]);

  const convertStrategyARGSValue = (value: any) => {
    if (value === null) return "null";
    if (typeof value === "string") {
      if (value.endsWith("_OUTPUT")) return value.slice(0, -7);
    }
    for (let i = 0; i < Object.keys(configTable).length; i++) {
      if (Object.keys(configTable)[i] === value) {
        return Object.keys(configTable)[i];
      }
    }
    return "null";
  };

  const {
    isOpen: isDeleteMissionOpen,
    onOpen: onDeleteMissionOpen,
    onOpenChange: onDeleteMissionOpenChange,
  } = useDisclosure();
  const handleDeleteMission = () => {
    let newMissionTable = [...missionTable];
    newMissionTable.splice(missionIndex, 1);
    setMissionTable(newMissionTable);
  };

  const {
    isOpen: isDeleteStrategyOpen,
    onOpen: onDeleteStrategyOpen,
    onOpenChange: onDeleteStrategyOpenChange,
  } = useDisclosure();
  const [deleteStrategyID, setDeleteStrategyID] = useState<string>("");
  const handleDeleteStrategy = () => {
    let newMissionTable = [...missionTable];
    newMissionTable[missionIndex].STRATEGY_QUEUE = newMissionTable[
      missionIndex
    ].STRATEGY_QUEUE.filter((strategy) => strategy.ID !== deleteStrategyID);
    setMissionTable(newMissionTable);
  };

  const [showPicture, setShowPicture] = useState(false);
  const [pictureBase64, setPictureBase64] = useState("");

  return (
    <div
      className="relative w-full p-2 rounded-lg shadow-sm transition-height overflow-hidden"
      ref={missionRef}
      style={{
        height: closed ? "36px" : `${missionRef.current?.scrollHeight}px`,
        backgroundColor: "#ffffff33",
      }}
      key={missionIndex}
    >
      <div className="relative w-full h-6 flex justify-between items-center">
        <div className="flex items-center gap-2">
          {currentMission !== mission.name && (
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
          )}
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
          <div
            onClick={onDeleteMissionOpen}
            className="w-5 h-5 flex justify-center items-center cursor-pointer rounded-md text-lg text-[#000]"
          >
            <MdDeleteOutline />
          </div>
        </div>
        <div className="flex items-center">
          <MdExpandMore
            className="cursor-pointer size-8 transition-transform"
            style={{ transform: closed ? "rotate(0)" : "rotate(180deg)" }}
            onClick={() => setClosed(!closed)}
          />
        </div>
      </div>
      <div className="flex flex-col gap-4 mt-2 h-fit">
        {mission.STRATEGY_QUEUE.map((strategy, index) => {
          return (
            <div className={`relative w-full h-fit `} key={index}>
              <div
                className={`relative w-[70%] h-fit p-2 overflow-scroll no-scrollbar flex gap-2 items-center rounded-lg shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] cursor-pointer `}
                onClick={() => {
                  setCurrentOpenStrategyName(strategy.FUNC);
                  setCurrentOpenStrategyID(strategy.ID);
                  onSelectParameterOpen();
                }}
              >
                <div
                  onClick={(e) => {
                    setDeleteStrategyID(strategy.ID);
                    onDeleteStrategyOpen();
                    e.stopPropagation();
                  }}
                  className="w-5 h-5 flex justify-center items-center hover:bg-[#33333333] cursor-pointer rounded-md text-lg text-[#000]"
                >
                  <MdDeleteOutline />
                </div>
                <div className="flex items-center justify-center bg-gradient-to-tr from-[#91bef0] to-[violet] bg-clip-text text-transparent text-lg px-[6px] py-1 shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] rounded-lg">
                  ID: {strategy.ID}
                </div>
                <div
                  className="flex items-center justify-center p-[6px] shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] rounded-lg"
                  style={{
                    backgroundColor: colorMap.get(strategy.ID),
                  }}
                >
                  {strategy.FUNC}
                </div>
                {Object.keys(strategy.ARGS).map((arg) => (
                  <div
                    className="flex items-center justify-center p-[6px] shadow-[0px_0px_2px_0.5px_rgba(0,0,0,0.2)] rounded-lg"
                    key={arg}
                    style={{
                      backgroundColor: colorMap.get(
                        convertStrategyARGSValue(strategy.ARGS[arg])
                      ),
                    }}
                  >
                    {/* {arg}:
                    {typeof strategy.ARGS[arg] === "object"
                      ? JSON.stringify(strategy.ARGS[arg])
                      : String(strategy.ARGS[arg])} */}
                    {arg}
                  </div>
                ))}
                {lastMission === mission.name &&
                  missionResData &&
                  missionResData[strategy.ID] && (
                    <div
                      className="absolute right-1 top-1 h-6 w-6 bg-[#00000044] rounded-md animate-pulse flex justify-center items-center cursor-pointer hover:bg-[#00000077]"
                      onClick={(e) => {
                        setShowPicture(true);
                        setPictureBase64(missionResData[strategy.ID]);
                        e.stopPropagation();
                      }}
                    >
                      <FiImage />
                    </div>
                  )}
              </div>
              {/* select get output */}
              <div className="absolute right-0 top-0 h-full w-[25%] px-2 flex justify-center items-center rounded-lg bg-[#ffffff33]">
                <CheckBox
                  handleClick={handleClickGetOutput(strategy.ID)}
                ></CheckBox>
              </div>
            </div>
          );
        })}
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

      {/* select parameter modal */}
      {currentOpenStrategyName !== "" && (
        <SelectParameterModal
          isOpen={isSelectParameterOpen}
          onOpenChange={onSelectParameterOpenChange}
          handleConfirm={handleSelectParameter}
          strategyNames={strategyNames}
          strategyContents={strategyContents}
          currentOpenStrategyName={currentOpenStrategyName}
          currentOpenStrategyID={currentOpenStrategyID}
          configTable={configTable}
        ></SelectParameterModal>
      )}

      {/* delete mission modal */}
      <ConfirmModal
        isOpen={isDeleteMissionOpen}
        onOpenChange={onDeleteMissionOpenChange}
        handleConfirm={handleDeleteMission}
        title={`确认删除任务${mission.name}?`}
      ></ConfirmModal>

      {/* delete strategy modal */}
      <ConfirmModal
        isOpen={isDeleteStrategyOpen}
        onOpenChange={onDeleteStrategyOpenChange}
        handleConfirm={handleDeleteStrategy}
        title={`确认删除策略${deleteStrategyID}?`}
      ></ConfirmModal>

      {/* show pic */}
      {showPicture && (
        <div
          className="fixed top-0 left-0 w-full h-full flex justify-center items-center bg-[#000000aa]"
          onClick={() => setShowPicture(false)}
        >
          <Image
            src={pictureBase64}
            alt="pic"
            className="max-w-[80%] max-h-[80%] object-contain"
            height={600}
            width={800}
          />
        </div>
      )}
    </div>
  );
}
