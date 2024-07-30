"use client";
import Cookies from "js-cookie";

export function useUserInfo() {
  const cachedData = Cookies.get("cvwebuserInfo");

  if (cachedData) {
    try {
      const cachedUserInfo = JSON.parse(cachedData);
      return cachedUserInfo;
    } catch (error) {
      console.error("Error parsing userInfo cookie:", error);
      return null;
    }
  } else {
    return null
  }
}

export default useUserInfo;