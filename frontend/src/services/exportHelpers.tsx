import { message } from "antd";
import dayjs from "dayjs";

export function ExcelExport({
  file,
  name,
  date,
}: {
  file: any;
  name: string;
  date?: string;
}) {
  const blob = new Blob([file], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const formattedDate = date
    ? dayjs(date).format("ddd, DD MMM YYYY HH_mm_ss [GMT]")
    : dayjs().format("ddd, DD MMM YYYY HH_mm_ss [GMT]");
  const fileName = `${name} - ${formattedDate}.xlsx`;
  link.setAttribute("download", fileName); // Specify the desired file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  message.success("Exported to " + fileName);
}
