"use client";

import { Card, CardBody, Tab, Tabs } from "@nextui-org/react";
import { useState } from "react";
import SignInForm from "./SignInForm";
import SignUpForm from "./SignUpForm";
import { useRouter } from "next/navigation";
import { signInClicked, signUpClicked } from "../../utils/login";

const LoginCard = () => {
    const [selected, setSelected] = useState("login");
    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const router = useRouter();

    const toggleVisibility = () => setIsVisible(!isVisible);

    const submitLogin = async (event: any) => {
        event.preventDefault();
        if (!userName || !password) {
            return;
        }
        setIsLoading(true);
        let success = await signInClicked(userName, password);
        if (success) {
            router.push("/");
        }
        setIsLoading(false);
    };

    const submitSignup = async (event: any) => {
        event.preventDefault();
        if (!userName || !password) {
            return;
        }
        setIsLoading(true);
        let success = await signUpClicked(userName, password);
        if (success) {
            setUserName("");
            setPassword("");
            setSelected("login");
        }
        setIsLoading(false);
    };

    return (

        <div
            className="relative flex w-full flex-col h-screen justify-center"
            style={{ pointerEvents: isLoading ? "none" : "auto" }}
        >
            <Card className="w-full self-center rounded-lg px-4 sm:px-8 py-8 max-w-[340px] sm:max-w-md lg:w-2/5">
                <CardBody className="gap-5 overflow-hidden relative">
                    <Tabs
                        fullWidth
                        size="md"
                        aria-label="Tabs form"
                        selectedKey={selected}
                        onSelectionChange={(key) => {
                            setSelected(key.toString());
                        }}
                    >
                        <Tab key="login" title="Login">
                            <SignInForm
                                submitLogin={submitLogin}
                                setEmail={setUserName}
                                email={userName}
                                toggleVisibility={toggleVisibility}
                                isVisible={isVisible}
                                password={password}
                                setPassword={setPassword}
                                isLoading={isLoading}
                                setSelected={setSelected}
                            />
                        </Tab>
                        <Tab key="sign-up" title="Sign up">
                            <SignUpForm
                                submitSignup={submitSignup}
                                setEmail={setUserName}
                                email={userName}
                                toggleVisibility={toggleVisibility}
                                isVisible={isVisible}
                                password={password}
                                setPassword={setPassword}
                                isLoading={isLoading}
                                setSelected={setSelected}
                            />
                        </Tab>
                    </Tabs>
                </CardBody>
            </Card>
        </div>
    );
};

export default LoginCard;