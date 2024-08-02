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

const API = {
  getProjectList,
  getDirectory,
  getStrategy,
  postConfig,
  getConfig,
};

export default API;
