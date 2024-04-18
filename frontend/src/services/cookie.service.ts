import Cookie from "js-cookie";

const SetCookie = (cookieName: string, value: any) => {
  Cookie.set(cookieName, value, {
    expires: 1,
    secure: true,
    sameSite: "strict",
    path: "/",
  });
};

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
  const cookieNames = getCookieNames();
  cookieNames.map((cookieName: string) => RemoveCookie(cookieName));
};

const getCookieNames = () => {
  const cookies = document.cookie.split(";");
  const cookieNames = [];

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i].trim().split("=");
    const cookieName = cookie[0];
    cookieNames.push(cookieName);
  }

  return cookieNames;
};

export { RemoveAllCookies, GetCookie, RemoveCookie, SetCookie };
