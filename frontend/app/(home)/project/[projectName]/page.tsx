import TempFile from "./components/tempFile";

export default async function Page({ params }: { params: { projectName: string } }) {

    return (
        <div className="w-full h-full flex justify-center items-center">
            <span>{params.projectName}</span>
            <TempFile />
        </div>
    );
}