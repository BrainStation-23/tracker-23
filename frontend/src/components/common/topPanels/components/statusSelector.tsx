import { Select, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useEffect } from "react";
import { statusBGColorEnum, statusBorderColorEnum } from "utils/constants";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortStatusIconSvg from "@/assets/svg/sortIcons/SortStatusIconSvg";
import { useAppSelector } from "@/storage/redux";
import { StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";

type Props = {
  status: string[];
  setStatus: Function;
  className?: string;
};
type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const StatusSelectorComponent = ({ status, setStatus, className }: Props) => {
  const defaultValues: any = [
    // { name: "To Do", statusCategoryName: "TO_DO" },
    // { name: "In Progress", statusCategoryName: "IN_PROGRESS" },
  ];

  const router = useRouter();
  const path = router.asPath;

  const statuses = path.includes("report")
    ? useAppSelector((state: RootState) => state.projectList.reportStatuses)
    : useAppSelector((state: RootState) => state.projectList.statuses);

  const Options = statuses
    ? statuses?.map((st) => {
        return {
          value: JSON.stringify(st),
          label: st.name,
        };
      })
    : [];
  if (Options?.length === 0) {
    defaultValues.forEach((val: any) => {
      Options.push({
        value: JSON.stringify(val),
        label: val.name,
      });
    });
  }
  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;
    const { Text } = Typography;
    const statusObj: StatusType = value && JSON.parse(value);

    const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
      event.preventDefault();
      event.stopPropagation();
    };
    return (
      <div
        style={{
          backgroundColor: statusBGColorEnum[statusObj?.statusCategoryName],
          border: `1px solid ${
            statusBorderColorEnum[statusObj?.statusCategoryName]
          }`,
          borderRadius: "36px",
        }}
        onClick={onClose}
        className="m-1 flex w-max cursor-pointer items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
      >
        <div className="flex h-2 w-2 items-center rounded-full" />
        {status.length > 1 ? (
          <div className="flex w-max max-w-[30px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {label}
            </Text>
          </div>
        ) : (
          <div className="flex w-max max-w-[90px] items-center text-sm">
            <Text className="m-0 p-0 text-xs" ellipsis={{ tooltip: label }}>
              {label}
            </Text>
          </div>
        )}
        <CrossIconSvg />
      </div>
    );
  };
  useEffect(() => {
    const tmpArray: any[] = [];
    status.map((st) => {
      Options?.map((option) => {
        if (option.label === JSON.parse(st).label) tmpArray.push(option.value);
      });
    });
  }, [status]);
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <SortStatusIconSvg />
      <Select
        placeholder="Select Status"
        mode="multiple"
        tagRender={(props) => tagRender(props)}
        value={status}
        className="w-full"
        showArrow
        maxTagCount={1}
        options={Options}
        onChange={(value) => {
          setStatus(value);
        }}
      />
    </div>
  );
};

export default StatusSelectorComponent;
