import Cookie from "js-cookie";

const SetCookie = (cookieName: string, value: any) => {
  Cookie.set(cookieName, value, {
    expires: 1,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
  console.log(cookieName, "set");
};

const CookieNames = ["access_token"];

const RemoveCookie = (cookieName: string) => {
  try {
    Cookie.remove(cookieName);
  } catch (error) {
    console.log("Failed to remove cookie ", cookieName);
  }
};

const GetCookie = (cookieName: string) => {
  return Cookie.get(cookieName);
};

const RemoveAllCookies = () => {
  CookieNames.map((cookieName: string) => RemoveCookie(cookieName));
  // RemoveCookie("accessToken");
  // RemoveCookie("refreshToken");
  // RemoveCookie("user");

  console.log("Cookies Removed");
};

export { RemoveAllCookies, GetCookie, RemoveCookie, SetCookie };
