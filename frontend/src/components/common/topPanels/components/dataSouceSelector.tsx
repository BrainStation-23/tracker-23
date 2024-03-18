import { Select, Tooltip, Typography } from "antd";
import { integrationName, IntegrationType } from "models/integration";
import { StatusDto } from "models/tasks";
import { LuBringToFront } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { integrationIcons } from "@/components/integrations/components/importCard";
import { useRouter } from "next/router";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import classNames from "classnames";

const { Text } = Typography;

type Props = {
  selectedSource?: string[];
  setSelectedSource?: Function;
  className?: string;
  readonly?: boolean;
};

export default function SourceSelectorComponent({
  selectedSource,
  setSelectedSource,
  className,
  readonly,
}: Props) {
  const router = useRouter();
  const path = router.asPath;

  const reportsSliceIntegrationTypes = useAppSelector(
    (state: RootState) => state.reportsSlice.integrationTypes
  );

  const integrationTypes = useAppSelector(
    (state: RootState) => state.integrations.integrationTypes
  );

  const allSource = path.includes("report")
    ? reportsSliceIntegrationTypes
    : integrationTypes;

  const Options = allSource?.map((source) => {
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

  return readonly ? (
    <div
      className={classNames("flex items-center justify-center gap-1", {
        ["hidden"]: !selectedSource || !(selectedSource?.length > 0),
      })}
    >
      <Tooltip title="Source">
        <LuBringToFront size={16} />
      </Tooltip>
      <Text
        ellipsis={{
          tooltip:
            selectedSource.length === 1
              ? selectedSource[0]
              : selectedSource.length > 1
              ? `${selectedSource.join(", ")}`
              : "No source selected",
        }}
        className="max-w-[210px]"
      >
        {selectedSource.length === 1
          ? selectedSource[0]
          : selectedSource.length > 1
          ? `${selectedSource.join(", ")}`
          : ""}{" "}
      </Text>
    </div>
  ) : (
    <div
      className={`flex w-[210px] items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <Tooltip title="Source">
        <LuBringToFront size={20} />
      </Tooltip>
      <Select
        mode="multiple"
        placeholder="Select Source"
        tagRender={(props) => tagRender(props, selectedSource)}
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
}

type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};

const tagRender = (props: TagProps, selectedSource: string[]) => {
  const { label, value, onClose } = props;
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
};
