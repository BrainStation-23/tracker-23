import { formatHoursToDay } from "@/services/timeActions";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
type Props = {
  time: number | undefined;
};
const FormatTimeForSettings = ({ time }: Props) => {
  const timeFormat = useAppSelector(
    (state: RootState) => state.settingsSlice.timeFormat
  );
  if (typeof time !== "number") return <>---</>;
  return (
    <>
      {time
        ? timeFormat === "Day"
          ? formatHoursToDay(time)
          : Math.round(time * 100) / 100 + "h"
        : time}
    </>
  );
};

export default FormatTimeForSettings;
