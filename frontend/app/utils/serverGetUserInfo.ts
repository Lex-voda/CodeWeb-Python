"server only";
import { cookies } from "next/headers";
import { UserInfo } from "../interfaces/user";

export async function serverGetUserInfo() : Promise<UserInfo|null> {
  const cookie = cookies();

  let userInfoValue = cookie.get("userInfo")?.value;

  if (!userInfoValue) {
    return null;
  } else {
    const userInfo: UserInfo = JSON.parse(userInfoValue);
    return userInfo;
  }
}

export default serverGetUserInfo;
