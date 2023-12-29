import { NextResponse, NextRequest } from "next/server";
import { ignoreRoutes, publicRoutes } from "utils/constants";

export function middleware(req: NextRequest) {
  const loginUrl = getUrl(req, "/login");
  const baseUrl = getUrl(req, "/");
  const url = req.url;
  const accessToken = req.cookies.get("access_token");

  if (!ignoreRoutes.some((route) => url.includes(route))) {
    if (publicRoutes.some((route) => url.includes(route))) {
      if (accessToken && accessToken.value) {
        return NextResponse.redirect(baseUrl);
      }
      return NextResponse.next();
    } else {
      if (!accessToken || !accessToken?.value) {
        return NextResponse.redirect(loginUrl);
      } else return NextResponse.next();
    }
  }
  return NextResponse.next();
}

const getUrl = (req: any, pathName: string) => {
  const url = req.nextUrl.clone();
  url.pathname = pathName;
  url.search = "";
  return url;
};
