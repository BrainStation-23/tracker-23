import { NextRequest } from "next/server";

export function getFullUrl(req: NextRequest, pathName: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathName;
  url.search = "";
  return url;
}
