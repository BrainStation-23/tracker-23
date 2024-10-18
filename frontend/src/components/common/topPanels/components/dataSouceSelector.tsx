import { Select, Tooltip, Typography } from "antd";
import { integrationName, IntegrationType } from "models/integration";
import { StatusDto } from "models/tasks";
import { LuBringToFront } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { integrationIcons } from "@/components/integrations/components/importCard";
import { useRouter } from "next/router";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useEffect, useState } from "react";

const { Text } = Typography;

type Props = {
  selectedSource?: string[];
  setSelectedSource?: Function;
  className?: string;
};

export default function SourceSelectorComponent({
  selectedSource,
  setSelectedSource,
  className,
}: Props) {
  const router = useRouter();
  const path = router.asPath;

  const reportsSliceIntegrationTypes = useAppSelector(
    (state: RootState) => state.reportsSlice.integrationTypes
  );

  const integrationTypes = useAppSelector(
    (state: RootState) => state.integrations.integrationTypes
  );

  const [options, setOptions] = useState<{
        value: IntegrationType;
        label: JSX.Element;
      }[]>([])

  useEffect(() => {
    if(path.includes("report")){
      setOptions(reportsSliceIntegrationTypes?.map((source) => {
        return {
          value: source,
          label: (
            <div className="flex items-center gap-2 text-sm">
              {integrationIcons[source as IntegrationType]}
              <div>{integrationName[source as IntegrationType]}</div>
            </div>
          ),
        };
      }));
    }else {
      setOptions(integrationTypes?.map((source) => {
        return {
          value: source,
          label: (
            <div className="flex items-center gap-2 text-sm">
              {integrationIcons[source as IntegrationType]}
              <div>{integrationName[source as IntegrationType]}</div>
            </div>
          ),
        };
      }));
    }
  }, [path, reportsSliceIntegrationTypes, integrationTypes])

  return (
    <div
      className={`flex min-w-[210px] items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
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
