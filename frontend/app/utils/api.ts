import { type AxiosResponse } from "axios";
import instance from "./request";

interface DirectoryRes {
  message: string;
  data: {
    file_directory: any;
  };
}

const getDirectory = async (project_name: string) =>
  await instance.get<any, AxiosResponse<DirectoryRes>>("/file/directory", {
    params: { project_name: project_name },
  });

interface ProjectListRes {
  message: string;
  data: {
    project_list: [string];
  };
}

const getProjectList = async () =>
  await instance.get<any, AxiosResponse<ProjectListRes>>("/file/project-list");

interface strategyRes {
  message: string;
  data: {
    strategy_registry: any;
  };
}

const getStrategy = async (project_name: string) =>
  await instance.get<any, AxiosResponse<strategyRes>>("/file/strategy", {
    params: { project_name: project_name },
  });

interface postConfigReq {
  file_path: string;
}

interface postConfigRes {
  message: string;
}

const postConfig = async (file_path: string, project_name: string) =>
  await instance.post<postConfigReq, AxiosResponse<Partial<postConfigRes>>>(
    `/file/config`,
    { file_path },
    { params: { project_name } }
  );

interface getConfigRes {
  message: string;
  data: {
    configuration: any;
  };
}

const getConfig = async (project_name: string) =>
  await instance.get<any, AxiosResponse<Partial<getConfigRes>>>(
    `/file/config`,
    {
      params: { project_name: project_name },
    }
  );

interface putConfigReq {
  data: any;
}

interface putConfigRes {
  message: string;
}

const putConfig = async (project_name: string, content: any) =>
  await instance.put<putConfigReq, AxiosResponse<Partial<putConfigRes>>>(
    `/file/config`,
    { data: content },
    { params: { project_name } }
  );

interface getFileContentRes {
  message: string;
  data: {
    content: string;
  };
}

const getFileContent = async (file_path: string) =>
  await instance.get<any, AxiosResponse<Partial<getFileContentRes>>>(`/file`, {
    params: { file_path },
  });

interface putFileContentReq {
  content: string;
}

interface putFileContentRes {
  message: string;
}

const putFileContent = async (project_name: string, content: string) =>
  await instance.put<
    putFileContentReq,
    AxiosResponse<Partial<putFileContentRes>>
  >(`/file`, { content }, { params: { project_name } });

interface deleteMissionRes {
  message: string;
}

const deleteMission = async (project_name: string) =>
  await instance.delete<any, AxiosResponse<Partial<deleteMissionRes>>>(
    `/mission`,
    { params: { project_name } }
  );

interface getMonitorRes {
  message: string;
  data: {
    CPU: {
      load: string;
      temperature: string;
      power: string;
    };
    RAM: {
      load: string;
    };
    GPU: {
      load: string;
      temperature: string;
      power: string;
    };
    HDD: {
      load: string;
    };
  };
}

const getMonitor = async () =>
  await instance.get<any, AxiosResponse<Partial<getMonitorRes>>>(`/monitor`);

const API = {
  getProjectList,
  getDirectory,
  getStrategy,
  postConfig,
  getConfig,
  putConfig,
  getFileContent,
  putFileContent,
  deleteMission,
  getMonitor,
};

export default API;
