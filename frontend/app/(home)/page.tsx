import { testFileDirectory } from "../constants/testFileDirectory";
import API from "../utils/api"

export default async function Home() {

    const getProjectList = async () => {
        const getNames = (files: any) => {
            const rootName = Object.keys(files)[0];
            const rootFileArray = files[rootName];
            let tempArray = [];
            for (let i = 0; i < rootFileArray.length; i++) {
                if (typeof rootFileArray[i] === "string") { }
                else {
                    tempArray.push(Object.keys(rootFileArray[i])[0]);
                }
            }
            return tempArray;
        }
        if (process.env.NEXT_PUBLIC_TEST === "test") {
            return getNames(testFileDirectory);
        }
        else {
            const projectList = API.getProjectList().then((res) => {
                return res.data.data.project_list;
            });
            return projectList;
        }
    }

    const projectList = await getProjectList();

    return (
        <div className="w-screen h-screen p-4 flex justify-center items-center ">
            <div className="w-full max-w-xl h-[600px] no-scrollbar overflow-scroll flex flex-col items-center gap-6">
                {projectList.map((project: string) =>
                (
                    <a href={`/project/${project}`} key={project} className="w-full min-h-32 bg-white rounded-lg shadow-md flex justify-center items-center cursor-pointer">
                        <span >{project}</span>
                    </a>)
                )}
            </div>
        </div>
    )
}
