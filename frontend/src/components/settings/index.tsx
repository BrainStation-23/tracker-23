import { Select, Spin, Tooltip, Typography } from "antd";
import { userAPI } from "APIs";
import { useEffect, useState } from "react";
import { LuHelpCircle } from "react-icons/lu";

type TagProps = {
  label: any;
  value: any;
  closable: any;
  onClose: any;
};
const SettingComponent = () => {
  const { Text } = Typography;
  const [syncTime, setSyncTime] = useState<number | null>();
  const [spinning, setSpinning] = useState<boolean>(false);
  const getSettings = async () => {
    const res = await userAPI.getWorkspaceSettings();
    res?.syncTime && setSyncTime(res.syncTime);
    console.log("🚀 ~ file: index.tsx:6 ~ getSettings ~ res:", res);
  };
  const handleSyncTimeChange = async (time: number) => {
    setSpinning(true);
    const res = await userAPI.updateSyncTime(time);
    if (res) setSyncTime(time);
    setSpinning(false);
  };
  const Options = [1, 6, 12].map((v) => {
    return {
      value: v,
      label: v + " Months",
    };
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
        <div className="flex items-center gap-4">
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
      </Spin>
    </div>
  );
};

export default SettingComponent;
