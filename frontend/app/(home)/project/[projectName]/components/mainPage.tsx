"use client";
import { testStrategy } from "@/app/constants/testStrategy";
import { Mission, StrategyContent } from "@/app/interfaces/project";
import API from "@/app/utils/api";
import { useContext, useEffect, useState } from "react";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { GoFileDirectory } from "react-icons/go";
import StrategyModal from "./strategyModal";
import { useDisclosure } from "@nextui-org/react";
import ConfigModal from "./configModal";
import { error, success } from "@/app/utils/message";
import { testConfig } from "@/app/constants/testConfig";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@nextui-org/react";
import { BiSolidEdit } from "react-icons/bi";
import SingleInputModal from "./singleInputModal";
import useWindow from "@/app/hooks/useWindow";
import MissionBlock from "./missionBlock";
import { IoAddSharp } from "react-icons/io5";
import AddMissionModal from "./addMissionModal";
import { ColorMapContext } from "../context/ColorMapContext";
import CheckFileModal from "./checkFileModal";
import { PiStrategy } from "react-icons/pi";
import { PiPath } from "react-icons/pi";
import io, { Socket } from "socket.io-client";

let socket: Socket | null = null;
if (process.env.NEXT_PUBLIC_TEST !== "test") {
  socket = io(process.env.NEXT_PUBLIC_SOCKET_URL!);
}

export default function MainPage({ projectName }: { projectName: string }) {
  const [closed, setClosed] = useState(false);
  const { width: windowWidth } = useWindow();
  const { colorMap, updateColorMap, randomColors } =
    useContext(ColorMapContext);

  // message list
  const [messageList, setMessageList] = useState<Array<string>>([]);

  const [strategyTable, setStrategyTable] = useState<any>({});
  const [strategyContents, setStrategyContents] = useState<
    Array<StrategyContent>
  >([]);
  const [strategyNames, setStrategyNames] = useState<string[]>([]);

  const [configTable, setConfigTable] = useState<any>({});

  // 配置项颜色
  useEffect(() => {
    let originSize = colorMap.size;
    for (let i = 0; i < Object.keys(configTable).length; i++) {
      updateColorMap(Object.keys(configTable)[i], randomColors[originSize + i]);
    }
  }, [configTable]);

  // 获取配置表
  const getConfigTable = async () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setConfigTable(testConfig);
      setMessageList([...messageList, "test: 获取配置文件成功！"]);
      return;
    }
    API.getConfig(projectName).then((res) => {
      if (res.status === 200) {
        if (res.data.message)
          setMessageList([...messageList, res.data.message]);
        success("获取配置文件成功！");
        setConfigTable(res.data.data?.configuration);
      } else {
        error("获取配置文件失败！");
      }
    });
  };
  // 获取策略注册表
  const getStrategyTable = async () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setStrategyTable(testStrategy);
      setMessageList([...messageList, "test: 获取策略注册表成功！"]);
    } else {
      const strategytable = API.getStrategy(projectName).then((res) => {
        if (res.status === 200) {
          success("获取策略注册表成功！");
          setMessageList([...messageList, res.data.message]);
          // return res.data.data.strategy_registry;
          setStrategyTable(res.data.data.strategy_registry);
        } else {
          error("获取策略注册表失败！");
        }
      });
      // setStrategyTable(strategytable);
    }
  };
  useEffect(() => {
    getConfigTable();
    getStrategyTable();
  }, []);

  // 查看策略注册表
  const {
    isOpen: isStrategyOpen,
    onOpen: onStrategyOpen,
    onOpenChange: onStrategyOpenChange,
  } = useDisclosure();

  // 更新可用策略
  useEffect(() => {
    setStrategyNames(Object.keys(strategyTable));
    let strategyCons: Array<StrategyContent> = [];
    for (let i = 0; i < Object.keys(strategyTable).length; i++) {
      strategyCons.push(strategyTable[Object.keys(strategyTable)[i]]);
    }
    setStrategyContents(strategyCons);
  }, [strategyTable]);

  // 选择配置文件
  const {
    isOpen: isConfigOpen,
    onOpen: onConfigOpen,
    onOpenChange: onConfigOpenChange,
  } = useDisclosure();
  const handleConfig = async (path: string) => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      success("配置文件路径成功!");
      setMessageList([...messageList, "test: 配置文件路径成功！"]);
      return;
    }
    API.postConfig(path, projectName).then((res) => {
      if (res.status != 200) {
        error("配置文件路径失败!");
      } else {
        success("配置文件路径成功!");
        if (res.data.message)
          setMessageList([...messageList, res.data.message]);
      }
    });
    API.getConfig(projectName).then((res) => {
      if (res.status === 200) {
        if (res.data.message)
          setMessageList([...messageList, res.data.message]);
        success("获取配置文件成功！");
        setConfigTable(res.data.data?.configuration);
      } else {
        error("获取配置文件失败！");
      }
    });
  };

  // 修改配置项
  const [modifyConfigKey, setModifyConfigKey] = useState<string>("");
  const {
    isOpen: isModifyConfigOpen,
    onOpen: onModifyConfigOpen,
    onOpenChange: onModifyConfigOpenChange,
  } = useDisclosure();
  const handleModifyConfig = async (newValue: string) => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      success("修改配置项成功!");
      setMessageList([...messageList, "test: 修改配置项成功！"]);
      return;
    }
    let tempConfigTable = configTable;
    tempConfigTable[modifyConfigKey] = newValue;
    API.putConfig(projectName, tempConfigTable).then((res) => {
      if (res.status != 200) {
        error("修改配置项失败!");
      } else {
        if (res.data.message)
          setMessageList([...messageList, res.data.message]);
        success("修改配置项成功！");
        setConfigTable(tempConfigTable);
      }
    });
  };

  // 任务表
  const [missionTable, setMissionTable] = useState<Array<Mission>>([]);
  const {
    isOpen: isAddMissionOpen,
    onOpen: onAddMissionOpen,
    onOpenChange: onAddMissionOpenChange,
  } = useDisclosure();

  const [missionResData, setMissionResData] = useState<any | null>(null);
  useEffect(() => {
    if (socket) {
      // 监听任务状态
      // socket.on("mission_status_response", (data) => {
      //   if (data.message) setMessageList([...messageList, data.message]);
      //   if (data.status)
      //     for (let i = 0; i < Object.keys(data.status).length; i++) {
      //       if (projectName === Object.keys(data.status)[i]) {
      //         if (data.status[Object.keys(data.status)[i]] != true) {
      //           setCurrentMission("");
      //         }
      //       }
      //     }
      // });

      // 监听任务执行结果
      socket.on("mission_response", (data) => {
        // console.log("%cSOCKET", "color: violet; font-size:30px", data);
        if (data.message) setMessageList([...messageList, ...data.message]);
        // if (data.status)
        //   for (let i = 0; i < Object.keys(data.status).length; i++) {
        //     if (projectName === Object.keys(data.status)[i]) {
        //       if (data.status[Object.keys(data.status)[i]] != true) {
        //         setCurrentMission("");
        //       }
        //     }
        //   }
        if (typeof data.status === "boolean") {
          if (data.status === false) {
            setCurrentMission("");
          }
        }
        if (data.data) setMissionResData(data.data);
      });

      // 清理事件监听器
      return () => {
        // socket.off("mission_status_response");
        socket.off("mission_response");
      };
    }
  }, []);

  const handleAddMission = (missionName: string, iterable: boolean) => {
    setMissionTable((prev) => {
      return [
        ...prev,
        {
          name: missionName,
          STRATEGY_QUEUE: [],
          ITER: iterable,
          GET_OUTPUT: [],
        },
      ];
    });
  };
  const handleStartMission = (index: number) => {
    // posted mission: missionTable[index]
    let missionData: any = {};
    let tempMission: any = { ...missionTable[index] };
    delete tempMission["name"];
    missionData[projectName] = {};
    missionData[projectName][missionTable[index].name] = tempMission;
    console.log("posted mission: ", missionData);
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([...messageList, "test: 开始任务成功！"]);
      setCurrentMission(missionTable[index].name);
      setLastMission(missionTable[index].name);
    } else {
      if (socket) {
        socket.emit("send_mission", missionData);
        setCurrentMission(missionTable[index].name);
        setLastMission(missionTable[index].name);
      }
    }
  };

  const getMissionStatus = () => {
    if (socket)
      socket.emit("get_mission_status", { project_name: projectName });
  };

  const handleStopMission = (index: number) => {
    console.log("stop mission: ", missionTable[index].name);
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      setMessageList([...messageList, "test: 停止任务成功！"]);
      setLastMission(currentMission);
      setCurrentMission("");
    } else {
      API.deleteMission(projectName).then((res) => {
        if (res.status === 200) {
          if (res.data.message)
            setMessageList([...messageList, res.data.message]);
          setLastMission(currentMission);
          setCurrentMission("");
        } else {
          error("停止任务失败！");
        }
      });
    }
  };

  // 当前运行任务
  const [currentMission, setCurrentMission] = useState<string>("");
  const [lastMission, setLastMission] = useState<string>("");

  // check file
  const {
    isOpen: isCheckFileOpen,
    onOpen: onCheckFileOpen,
    onOpenChange: onCheckFileOpenChange,
  } = useDisclosure();

  return (
    <>
      {/* side bar */}
      <div
        className="fixed h-screen w-40 right-0 top-0 z-50 flex flex-col justify-between py-3 overflow-hidden transition-all bg-[#33333322] text-white"
        style={{
          width: closed ? "0" : "160px",
          paddingLeft: closed ? "0" : "12px",
          paddingRight: closed ? "0" : "12px",
        }}
      >
        {/* top part */}
        <div className="min-w-[136px] flex flex-col gap-2 text-sm">
          <div
            className="w-full flex gap-2 items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={onStrategyOpen}
          >
            <PiStrategy />
            <span>查看策略注册表</span>
          </div>
          <div
            className="w-full flex gap-2 items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={onConfigOpen}
          >
            <PiPath />
            <span>配置文件路径</span>
          </div>
          <div
            className="w-full flex gap-2 items-center cursor-pointer p-2 bg-[#33333322] hover:bg-[#33333377] transition-background rounded-lg"
            onClick={onCheckFileOpen}
          >
            <GoFileDirectory />
            <span>文件管理</span>
          </div>
        </div>
        {/* bottom part */}
        <div className="min-w-[136px] flex flex-col gap-2"></div>
      </div>

      {/* open or close button */}
      <div
        className=" bg-[#19191966] fixed top-2/3 w-10 h-10 right-[-20px] z-50 rounded-full transition-transform [clip-path:_polygon(0_0,_50%_0%,_50%_100%,_0%_100%);] flex items-center pl-[5px] text-white cursor-pointer"
        style={{ transform: closed ? "translateX(0px)" : "translateX(-160px)" }}
        onClick={(e) => setClosed(!closed)}
      >
        {closed ? <FaChevronLeft /> : <FaChevronRight />}
      </div>

      <div className="flex h-screen w-full">
        {/* main part */}
        <div
          className="w-full h-screen p-10 flex justify-between transition-[clip-path] mx-10"
          // style={{
          //   clipPath: closed
          //     ? "polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)"
          //     : `polygon(0% 0%, ${windowWidth - 170}px 0%, ${
          //         windowWidth - 170
          //       }px 100%, 0% 100%)`,
          // }}
        >
          {/* left part */}
          <div className="w-[55%] h-full flex flex-col justify-between">
            {/* config part */}
            <div className="w-fit h-[35%] flex flex-col gap-2 p-4 rounded-xl bg-[#66666622]">
              <p>配置块：</p>
              <Table
                aria-label="Example static collection table"
                className=" max-h-full overflow-scroll no-scrollbar"
                classNames={{
                  wrapper:
                    " max-h-full overflow-scroll no-scrollbar bg-[#ffffff66]",
                }}
                isHeaderSticky={true}
              >
                <TableHeader>
                  <TableColumn className="bg-[#ffffff22]">Key</TableColumn>
                  <TableColumn className="bg-[#ffffff22]">Value</TableColumn>
                </TableHeader>
                <TableBody>
                  {Object.keys(configTable).map((configName, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell className="p-0">
                          <div
                            className="p-1 rounded-lg flex items-center justify-center"
                            style={{
                              backgroundColor: colorMap.get(configName),
                            }}
                          >
                            {configName}
                          </div>
                        </TableCell>
                        <TableCell className="relative w-full pr-6">
                          <span>
                            {typeof configTable[configName] === "object"
                              ? JSON.stringify(configTable[configName])
                              : String(configTable[configName])}
                          </span>
                          <BiSolidEdit
                            className="!absolute h-full flex items-center top-0 right-2 cursor-pointer"
                            onClick={() => {
                              setModifyConfigKey(configName);
                              onModifyConfigOpen();
                            }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
            {/* mission part */}
            <div className="w-full h-[60%] flex flex-col gap-2 p-4 rounded-xl bg-[#66666622] overflow-scroll no-scrollbar">
              <p>任务块：</p>
              <div className="w-full h-fit flex flex-col gap-2">
                {missionTable.map((mission, index) => (
                  <MissionBlock
                    missionIndex={index}
                    mission={mission}
                    missionTable={missionTable}
                    currentMission={currentMission}
                    strategyNames={strategyNames}
                    strategyContents={strategyContents}
                    setMissionTable={setMissionTable}
                    handleStartMission={handleStartMission}
                    handleStopMission={handleStopMission}
                    configTable={configTable}
                    missionResData={missionResData}
                    lastMission={lastMission}
                  />
                ))}
                {/* add mission */}
                <div
                  className="w-20 h-20 flex justify-center items-center border-dashed border-2 border-[#ffffff66] cursor-pointer"
                  onClick={onAddMissionOpen}
                >
                  <IoAddSharp className="size-14 text-[#ffffff66]" />
                </div>
              </div>
            </div>
          </div>
          {/* right part */}
          <div className="w-[40%] h-full flex flex-col justify-between gap-2 p-4 rounded-xl bg-[#66666622]">
            <p>消息列表：</p>
            <div className="w-full h-full flex flex-col gap-1 overflow-scroll no-scrollbar bg-[#ffffff66] rounded-lg p-2">
              {messageList.map((message, index) => (
                <div key={index} className="text-xs">
                  {message}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* right block */}
        <div
          className="w-[160px] h-full transition-width"
          style={{ width: closed ? "0px" : "160px" }}
        ></div>
      </div>

      {/* strategy modal */}
      <StrategyModal
        isOpen={isStrategyOpen}
        onOpenChange={onStrategyOpenChange}
        content={strategyTable}
        getStrategyTable={getStrategyTable}
      />

      {/* modify config item modal */}
      <SingleInputModal
        isOpen={isModifyConfigOpen}
        onOpenChange={onModifyConfigOpenChange}
        handleConfirm={handleModifyConfig}
        title={`输入配置项${modifyConfigKey}新的值`}
      />

      {/* config modal */}
      <ConfigModal
        isOpen={isConfigOpen}
        onOpenChange={onConfigOpenChange}
        handleConfig={handleConfig}
      />

      {/* add mission modal */}
      <AddMissionModal
        isOpen={isAddMissionOpen}
        onOpenChange={onAddMissionOpenChange}
        handleConfirm={handleAddMission}
      />

      {/* check file */}
      <CheckFileModal
        isOpen={isCheckFileOpen}
        onOpenChange={onCheckFileOpenChange}
        messageList={messageList}
        setMessageList={setMessageList}
        projectName={projectName}
      ></CheckFileModal>
    </>
  );
}
