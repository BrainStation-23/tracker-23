import { Select, Tooltip, Typography } from "antd";
import { StatusDto } from "models/tasks";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { LuCalendarDays } from "react-icons/lu";

import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { Project } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import classNames from "classnames";
const { Text } = Typography;

type Props = {
  calendarIds: number[];
  setCalendarIds: Function;
  className?: string;
  mode?: "multi" | "single";
  readonly?: boolean;
};

export default function CalendarSelectorComponent({
  calendarIds,
  setCalendarIds,
  className,
  mode = "multi",
  readonly,
}: Props) {
  const defaultValues: any = [];

  const router = useRouter();
  const path = router.asPath;

  const reportProjects = useAppSelector(
    (state: RootState) => state.projectList.reportProjects
  );
  const projectListProjects = useAppSelector(
    (state: RootState) => state.projectList.projects
  );

  const calendars = (
    path.includes("report") ? reportProjects : projectListProjects
  )?.filter((project) => project.integrationType === "OUTLOOK");
  const Options = calendars
    ? calendars?.map((calendars) => {
        return {
          value: calendars.id,
          label: calendars.projectName,
        };
      })
    : [];
  if (Options?.length === 0) {
    defaultValues.forEach((val: Project) => {
      Options.push({
        value: val.id,
        label: val.projectName,
      });
    });
  }

  useEffect(() => {
    const tmpArray: any[] = [];
    calendarIds?.map((projectId) => {
      Options?.map((option) => {
        if (option.value === projectId) tmpArray.push(option.value);
      });
    });
  }, [calendarIds]);

  return readonly ? (
    <div
      className={classNames("flex items-center justify-center gap-1", {
        ["hidden"]: !calendarIds || !(calendarIds?.length > 0),
      })}
    >
      <Tooltip title="Calendar(s)">
        <LuCalendarDays size={16} />
      </Tooltip>
      <div>
        {calendarIds.length}{" "}
        {calendarIds.length === 1 ? "Calendar" : "Calendars"}
      </div>
    </div>
  ) : (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black ${
        className ? className : ""
      }`}
    >
      <LuCalendarDays size={20} />
      {mode == "single" ? (
        <Select
          placeholder="Select Calendar"
          tagRender={(props) => tagRender(props, calendarIds)}
          value={calendarIds[0] ? calendarIds : null}
          className="w-full"
          showArrow
          maxTagCount={1}
          options={Options}
          onChange={(value) => {
            setCalendarIds(value);
          }}
        />
      ) : (
        <Select
          placeholder="Select Calendars"
          mode="multiple"
          tagRender={(props) => tagRender(props, calendarIds)}
          value={calendarIds}
          className="w-full"
          showArrow
          maxTagCount={1}
          options={Options}
          onChange={(value) => {
            setCalendarIds(value);
          }}
        />
      )}
    </div>
  );
}

type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};

const tagRender = (props: TagProps, calendarIds: number[]) => {
  const { label, onClose } = props;

  return (
    <div
      onClick={onClose}
      className="m-1 flex w-max cursor-pointer items-center gap-1 rounded border-[1px] border-secondary px-2 py-0.5 text-xs font-medium text-black"
    >
      {calendarIds.length > 1 ? (
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
      )}
      <CrossIconSvg />
    </div>
  );
};
