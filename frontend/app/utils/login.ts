import axios from "axios";
import { error, success } from "./message";
import sha256 from './sha256.js';

async function signUpClicked(username: string, password: string) {
  try {
    // console.log(sha256(password));
    if (process.env.NEXT_PUBLIC_TEST != "test") {
      return "success";
    }
    let result = 'failed';
    await axios
      .post(`${process.env.NEXT_PUBLIC_HOST}/auth/register`, {
        username: username,
        password: sha256(password),
      })
      .then((res) => {
        console.log(res)
        if (res.status === 200) {
          success("注册成功");
          result = "success";
        }
      })
      .catch((err: any) => {
        console.log("signup: ", err);
        error("Signup Error: " + err);
      });
    return result;
  } catch (err: any) {
    console.log("signup: ", err);
    error("Signup Error: " + err);
  }
}


async function signInClicked(username: string, password: string) {
  try {
    // console.log(sha256(password));
    if (process.env.NEXT_PUBLIC_TEST != "test") {
      return "success";
    }
    let result = 'failed';
    await axios
      .post(`${process.env.NEXT_PUBLIC_HOST}/auth/login`, {
        username: username,
        password: sha256(password),
      })
      .then((res) => {
        console.log(res)
        if (res.status === 200) {
          success("登陆成功");
          localStorage.setItem(
            "cvwebuserInfo",
            JSON.stringify({
              username: username,
              status: res.data.status,
            })
          );
          localStorage.setItem("cvwebAuthorization", res.data.access_token);
          result = "success";
        }
      })
      .catch((err: any) => {
        console.log("signin: ", err);
        error("Signin Error: " + err);
      });
    return result;
  } catch (err: any) {
    console.log("signin: ", err);
    error("Signin Error: " + err);
  }
}

async function logoutClicked() {
  if (process.env.NEXT_PUBLIC_TEST !== "test") {
    localStorage.removeItem("cvwebuserInfo");
    localStorage.removeItem("cvwebAuthorization");
  }
  window.location.href = "/";
}

export { logoutClicked, signUpClicked, signInClicked };
