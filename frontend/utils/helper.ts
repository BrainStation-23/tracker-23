import { NextRequest } from "next/server";

export function getFullUrl(req: NextRequest, pathName: string) {
  const url = req.nextUrl.clone();
  url.pathname = pathName;
  url.search = "";
  return url;
}

export function formatDate(dateString: string) {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  // Format the date as 'MM-DD-YYYY'
  const formattedDate = `${month}-${day}-${year}`;

  return formattedDate;
}

export function convertToISO(dateString : string) {
  const [month, day, year] = dateString.split('-');
  const date = new Date(`${year}-${month}-${day}`);
  const now = new Date();

  date.setHours(now.getUTCHours());
  date.setMinutes(now.getUTCMinutes());
  date.setSeconds(now.getUTCSeconds());
  date.setMilliseconds(now.getUTCMilliseconds());

  const isoString = date.toISOString();
  return isoString;
}


