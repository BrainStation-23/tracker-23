import { Select, Typography } from "antd";
import { integrationName, IntegrationType } from "models/integration";
import { StatusDto } from "models/tasks";
import { LuBringToFront } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { integrationIcons } from "@/components/importSection/importCard";

type Props = {
  selectedSource?: string[];
  setSelectedSource?: Function;
  className?: string;
  allSouce?: string[];
};

type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const SourceSelectorComponent = ({
  selectedSource,
  setSelectedSource,
  className,
  allSouce = ["JIRA", "OUTLOOK"],
}: Props) => {
  const { Text } = Typography;

  const Options = allSouce?.map((source) => {
    return {
      value: source,
      label: (
        <div className="flex items-center gap-2 text-sm">
          {integrationIcons[source as IntegrationType]}
          <div>{integrationName[source as IntegrationType]}</div>
        </div>
      ),
    };
  });

  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <div
        onClick={onClose}
        className="m-1 flex cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
      >
        {selectedSource.length > 1 ? (
          <div className="flex w-max max-w-[50px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              <div className="flex items-center gap-2 text-sm">
                <div>{integrationIcons[value as IntegrationType]}</div>
                {integrationName[value as IntegrationType]}
              </div>
            </Text>
          </div>
        ) : (
          <div className="flex w-max max-w-[90px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              <div className="flex items-center gap-2 text-sm">
                {integrationIcons[value as IntegrationType]}
                <div>{integrationName[value as IntegrationType]}</div>
              </div>
            </Text>
          </div>
        )}
        <CrossIconSvg />
      </div>
    );
    <div
      onClick={onClose}
      className="m-1 flex cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
    >
      <div className="flex items-center gap-2 text-sm">
        {integrationIcons[value as IntegrationType]}
        <div>{integrationName[value as IntegrationType]}</div>
      </div>

      <CrossIconSvg />
    </div>;
  };

  return (
    <div
      className={`flex w-[210px] items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuBringToFront size={20} />
      <Select
        mode="multiple"
        placeholder="Select Source"
        tagRender={(props) => tagRender(props)}
        value={selectedSource}
        className="w-full"
        showArrow
        maxTagCount={1}
        options={Options}
        onChange={(value) => {
          setSelectedSource && setSelectedSource(value);
        }}
      />
    </div>
  );
};

export default SourceSelectorComponent;
