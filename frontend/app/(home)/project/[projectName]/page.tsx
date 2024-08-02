
import MainPage from "./components/mainPage";
import RootDirLayout from "./context/RootDirContext";

export default async function Page({ params }: { params: { projectName: string } }) {
    return (
        <>
            <RootDirLayout>
                <MainPage projectName={params.projectName} />
            </RootDirLayout>
        </>
    );
}