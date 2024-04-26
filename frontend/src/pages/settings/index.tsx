import { userAPI } from "APIs";
import { useDispatch } from "react-redux";
import { useEffect, useState } from "react";
import { Button, Select, Spin, Tooltip, message } from "antd";
import { LuHelpCircle } from "react-icons/lu";

import {
  setSettingsReducer,
  setSyncTimeReducer,
  setTimeFormatReducer,
} from "@/storage/redux/settingsSlice";
import { SyncOutlined } from "@ant-design/icons";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { setSyncRunning, setSyncStatus } from "@/storage/redux/syncSlice";

const Options = [1, 6, 12].map((v) => ({
  value: v,
  label: v + " Months",
}));

const TimeFormatOptions = ["Day", "Hour"].map((v) => {
  const retValue: any = {
    value: v,
    label: v,
  };
  if (v === "Day") retValue["tip"] = "1d 2h 15m";
  if (v === "Hour") retValue["tip"] = "10h 15m";
  return retValue;
});

const SettingsPage = () => {
  const dispatch = useDispatch();

  const [spinning, setSpinning] = useState<boolean>(false);
  const [syncTime, setSyncTime] = useState<number | null>();
  const [timeFormat, setTimeFormat] = useState<string | null>();

  const syncing = useAppSelector(
    (state: RootState) => state.syncStatus.syncRunning
  );

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
  const handleClick = async () => {
    try {
      const response = await userAPI.taskReload();
      if (response) {
        dispatch(setSyncRunning(true));
        dispatch(setSyncStatus(response));
      }
    } catch (err) {
      console.error("error in taskReload", err);
      message.error("Something is wrong!!");
    }
  };

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <div className="px-8 pt-2">
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
              value={syncTime}
              defaultValue={1}
              options={Options}
              className="w-[200px]"
              placeholder="Select Sprint"
              onChange={(value) => handleSyncTimeChange(value)}
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
              value={timeFormat}
              defaultValue={"Day"}
              className="w-[200px]"
              placeholder="Select Sprint"
              options={TimeFormatOptions}
              onChange={(value: any) => handleTimeFormatChange(value)}
            />
          </div>
          <div className="flex gap-2">
            <div className="flex w-max items-center gap-2 text-lg">
              Sync all task from last {syncTime} month
              <Tooltip placement="bottom" title="Sync whole workspace task">
                <LuHelpCircle />
              </Tooltip>
              :
            </div>
            <Button
              type="ghost"
              disabled={syncing}
              onClick={handleClick}
              className="flex w-fit items-center gap-2 border-none bg-primary py-4 text-base text-white hover:text-white"
            >
              <SyncOutlined spin={syncing} />
              Sync All Task
            </Button>
          </div>
        </div>
      </Spin>
    </div>
  );
};

export default SettingsPage;
