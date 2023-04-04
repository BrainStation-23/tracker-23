
import { NextResponse } from "next/server";
import { ignoreRoutes, publicRoutes } from "utils/constants";
import { GetCookie } from "./services/cookie.service";

export default async function middleware(req: any) {
  const loginUrl = req.nextUrl.clone();
  loginUrl.pathname = "/login";
  const baseUrl = req.nextUrl.clone();
  baseUrl.pathname = "/";
  const url = req.url;
  const cookies = req.headers.get("cookie");
  const access_token = cookies;
  // if (!url.includes("/_next"))

  // console.log(
  //   "🚀 ~ file: _middleware.js:6 ~ middleware ~ cookies",
  //   access_token,
  //   url,
  //   publicRoutes.some((route) => url.includes(route))
  // );
  // if (publicRoutes.includes(url))
  if (!ignoreRoutes.some((route) => url.includes(route))) {
    if (publicRoutes.some((route) => url.includes(route))) {
      console.log("inf", access_token, url);
      if (access_token) return NextResponse.redirect(baseUrl);
      return NextResponse.next();
    } else {
      if (!access_token) return NextResponse.redirect(loginUrl);
      else return NextResponse.next();
    }
  }
  return NextResponse.next();
}
