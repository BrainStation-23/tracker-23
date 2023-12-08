import { message } from "antd";
import dayjs from "dayjs";

export function ExcelExport({file,name}:any) {
  const blob = new Blob([file], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  const fileName = `${name} - ${dayjs()}.xlsx`;
  link.setAttribute("download", fileName); // Specify the desired file name
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  message.success("Exported to " + fileName);
}
