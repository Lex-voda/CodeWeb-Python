import { testProjectList } from "../constants/testProjectList";
import API from "../utils/api";

export default async function Home() {
  const getProjectList = async () => {
    if (process.env.NEXT_PUBLIC_TEST === "test") {
      return testProjectList;
    } else {
      const projectList = API.getProjectList().then((res) => {
        return res.data.data.project_list;
      });
      return projectList;
    }
  };

  const projectList = await getProjectList();

  return (
    <div className="w-full h-screen p-4 flex justify-center items-center ">
      <div className="w-full max-w-xl h-[600px] no-scrollbar overflow-scroll flex flex-col items-center gap-8">
        {projectList.map((project: string) => (
          <a
            href={`/project/${project}`}
            key={project}
            className="w-full min-h-28 bg-white hover:opacity-70 transition-opacity rounded-lg shadow-md flex justify-center items-center cursor-pointer"
          >
            <span>{project}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
