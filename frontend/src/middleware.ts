import { NextResponse, NextRequest } from "next/server";
import { ignoreRoutes, publicRoutes } from "utils/constants";

import { getFullUrl } from "utils/helper";

export function middleware(req: NextRequest) {
  const url = req.url;
  const baseUrl = getFullUrl(req, "/");
  const loginUrl = getFullUrl(req, "/login");
  const accessToken = req.cookies.get("access_token");

  if (!ignoreRoutes.some((route) => url.includes(route))) {
    if (publicRoutes.some((route) => url.includes(route))) {
      if (accessToken && accessToken.value) {
        return NextResponse.redirect(baseUrl);
      } else {
        return NextResponse.next();
      }
    } else {
      if (!accessToken || !accessToken?.value) {
        return NextResponse.redirect(loginUrl);
      } else return NextResponse.next();
    }
  }
  return NextResponse.next();
}
