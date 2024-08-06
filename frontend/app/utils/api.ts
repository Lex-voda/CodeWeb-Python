import { type AxiosResponse } from "axios";
import instance from "./request";

interface DirectoryRes {
  message: string;
  data: {
    file_directory: any;
  };
}

const getDirectory = async () =>
  await instance.get<any, AxiosResponse<DirectoryRes>>("/sync/file/directory");

interface ProjectListRes {
  message: string;
  data: {
    project_list: [string];
  };
}
const getProjectList = async () =>
  await instance.get<any, AxiosResponse<ProjectListRes>>(
    "/sync/file/project-list"
  );

interface strategyRes {
  message: string;
  data: {
    strategy_registry: any;
  };
}

const getStrategy = async (project_name: string) =>
  await instance.get<any, AxiosResponse<strategyRes>>("/sync/file/strategy", {
    params: { project_name: project_name },
  });

interface postConfigReq {
  file_path: string;
  project_name: string;
}

interface postConfigRes {
  message: string;
}

const postConfig = async (data: Partial<postConfigReq>) =>
  await instance.post<postConfigReq, AxiosResponse<Partial<postConfigRes>>>(
    `/file/config`,
    data
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

const API = {
  getProjectList,
  getDirectory,
  getStrategy,
  postConfig,
  getConfig,
  putConfig,
  getFileContent,
  putFileContent,
};

export default API;
