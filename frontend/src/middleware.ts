import { NextResponse } from "next/server";
import { ignoreRoutes, publicRoutes } from "utils/constants";

export default async function middleware(req: any) {
  const loginUrl = getUrl(req, "/login");
  const baseUrl = getUrl(req, "/");
  const url = req.url;
  const cookies = req.headers.get("cookie");
  const access_token = cookies;

  if (!ignoreRoutes.some((route) => url.includes(route))) {
    if (publicRoutes.some((route) => url.includes(route))) {
      if (access_token) return NextResponse.redirect(baseUrl);
      return NextResponse.next();
    } else {
      if (!access_token) return NextResponse.redirect(loginUrl);
      else return NextResponse.next();
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
