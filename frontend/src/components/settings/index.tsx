import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { userAPI } from "APIs";
import { Select, Typography } from "antd";
import { useEffect } from "react";

type TagProps = {
  label: any;
  value: any;
  closable: any;
  onClose: any;
};
const SettingComponent = () => {
  const { Text } = Typography;
  const getSettings = async () => {
    const res = await userAPI.getWorkspaceSettings();
    console.log("🚀 ~ file: index.tsx:6 ~ getSettings ~ res:", res);
  };
  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <div
        onClick={onClose}
        className="m-1 flex w-max cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
      >
        {/* {sprints.length > 1 ? (
          <div className="flex w-max max-w-[30px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {label}
            </Text>
          </div>
        ) : (
          <div className="flex w-max max-w-[100px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {label}
            </Text>
          </div>
        )} */}
        <CrossIconSvg />
      </div>
    );
  };
  useEffect(() => {
    getSettings();
  }, []);
  return (
    <div >
      Sync Range :{" "}
      <Select
        placeholder="Select Sprint"
        mode="multiple"
        tagRender={(props) => tagRender(props)}
        // value={sprints}
        defaultValue={[]}
        className="w-full"
        showArrow
        maxTagCount={1}
        // options={Options}
        onChange={(value) => {
          // setSprints(value);
        }}
      />
    </div>
  );
};

export default SettingComponent;
