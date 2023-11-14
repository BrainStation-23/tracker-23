import { formatHoursToDay } from "@/services/timeActions";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
type Props = {
  time: number | undefined;
};
const FormatTimeForSettings = ({ time }: Props) => {
  console.log(
    "🚀 ~ file: taskHooks.ts:24 ~ getSettingFormattedTime ~ time:",
    time
  );
  if (typeof time !== "number") return <>---</>;
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );
  return (
    <>
      {time
        ? timeFormat === "Day"
          ? formatHoursToDay(time)
          : time + "h"
        : "-"}
    </>
  );
};

export default FormatTimeForSettings;
