import { Select, Spin, Tooltip } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { LuHelpCircle } from "react-icons/lu";
import { useDispatch } from "react-redux";

import {
  setSettingsReducer,
  setSyncTimeReducer,
  setTimeFormatReducer,
} from "@/storage/redux/settingsSlice";

const SettingComponent = () => {
  const dispatch = useDispatch();
  const [syncTime, setSyncTime] = useState<number | null>();
  const [timeFormat, setTimeFormat] = useState<string | null>();
  const [spinning, setSpinning] = useState<boolean>(false);
  const getSettings = async () => {
    const res = await userAPI.getWorkspaceSettings();
    res?.syncTime && setSyncTime(res.syncTime);
    res?.timeFormat && setTimeFormat(res.timeFormat);
    res && dispatch(setSettingsReducer(res));
  };
  const handleSyncTimeChange = async (time: number) => {
    setSpinning(true);
    const res = await userAPI.updateSyncTime(time);
    if (res) {
      setSyncTime(time);
      dispatch(setSyncTimeReducer(time));
    }
    setSpinning(false);
  };
  const handleTimeFormatChange = async (time: "Day" | "Hour") => {
    setSpinning(true);
    const res = await userAPI.updateTimeFormat(time);
    if (res) {
      dispatch(setTimeFormatReducer(time));
      setTimeFormat(time);
    }
    setSpinning(false);
  };
  const Options = [1, 6, 12].map((v) => {
    return {
      value: v,
      label: v + " Months",
    };
  });
  const TimeFormatOptions = ["Day", "Hour"].map((v) => {
    const retValue: any = {
      value: v,
      label: v,
    };
    if (v === "Day") retValue["tip"] = "1d 2h 15m";
    if (v === "Hour") retValue["tip"] = "10h 15m";
    return retValue;
  });
  useEffect(() => {
    getSettings();
  }, []);
  return (
    <div>
      <div className="mb-4 flex justify-between">
        <h2 className="text-2xl font-bold">Settings</h2>
      </div>
      <Spin spinning={spinning}>
        <div className="flex flex-col gap-4">
          <div className="grid w-[400px] grid-cols-2 gap-4">
            <div className="flex w-max items-center gap-2 text-lg">
              Sync Range{" "}
              <Tooltip
                placement="bottom"
                title="Choose the time period for data synchronization"
              >
                <LuHelpCircle />
              </Tooltip>
              :
            </div>
            <Select
              placeholder="Select Sprint"
              value={syncTime}
              defaultValue={1}
              className="w-[200px]"
              showArrow
              options={Options}
              onChange={(value) => {
                handleSyncTimeChange(value);
              }}
            />
          </div>
          <div className="grid w-[400px] grid-cols-2 gap-4">
            <div className="flex w-max items-center gap-2 text-lg">
              Time Format
              <Tooltip
                placement="bottom"
                title="Choose the time period for data synchronization"
              >
                <LuHelpCircle />
              </Tooltip>
              :
            </div>
            <Select
              placeholder="Select Sprint"
              value={timeFormat}
              defaultValue={"Day"}
              className="w-[200px]"
              showArrow
              options={TimeFormatOptions}
              onChange={(value: any) => {
                handleTimeFormatChange(value);
              }}
            />
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default SettingComponent;
