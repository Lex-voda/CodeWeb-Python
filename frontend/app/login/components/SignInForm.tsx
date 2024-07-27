"use client";

import { Button, Input, Link, Spinner } from "@nextui-org/react";
import { EyeFilledIcon } from "./EyeFilledIcon";
import { EyeSlashFilledIcon } from "./EyeSlashFilledIcon";
import { Dispatch, SetStateAction } from "react";

function SignInForm({
  email,
  setEmail,
  password,
  setPassword,
  submitLogin,
  isVisible,
  toggleVisibility,
  isLoading,
  setSelected,
}: {
  submitLogin: (event: any) => Promise<void>;
  email: string;
  setEmail: Dispatch<SetStateAction<string>>;
  toggleVisibility: () => void;
  isVisible: boolean;
  password: string;
  setPassword: Dispatch<SetStateAction<string>>;
  isLoading: boolean;
  setSelected: Dispatch<SetStateAction<string>>;
}) {
  return (
    <form className="flex flex-col gap-4" onSubmit={submitLogin}>
      <Input
        isRequired
        label="Username"
        placeholder="Enter your username"
        type="text"
        autoComplete="username"
        value={email}
        onValueChange={setEmail}
      />
      <Input
        isRequired
        label="Password"
        placeholder="Enter your password"
        type={isVisible ? "text" : "password"}
        name="pass"
        autoComplete="current-password"
        value={password}
        onValueChange={setPassword}
        endContent={
          <button className="focus:outline-none" type="button" onClick={toggleVisibility}>
            {isVisible ? (
              <EyeFilledIcon className="pointer-events-none text-2xl text-default-400" />
            ) : (
              <EyeSlashFilledIcon className="pointer-events-none text-2xl text-default-400" />
            )}
          </button>
        }
      />
      <div className="mt-3 flex justify-end gap-2">
        <Button fullWidth className="z-[1] cursor-pointer text-white p-0 rounded-full" type="submit">
          <div className=" bg-streamer-color bg-[length:200%] h-full w-full rounded-full gap-2 flex justify-center items-center font-bold text-lg">
            {isLoading && (
              <Spinner
                size="sm"
                classNames={{
                  circle1: "border-b-[white]",
                  circle2: "border-b-[white]",
                }}
              ></Spinner>
            )}
            <span>Sign in</span>
          </div>
        </Button>
      </div>
      <p className="text-center text-small">
        Need to create an account?{" "}
        <Link size="sm" onPress={() => setSelected("sign-up")} className=" text-[#71F9E1] cursor-pointer">
          Sign up
        </Link>
      </p>
    </form>
  );
}

export default SignInForm;
