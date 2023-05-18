import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import SortStatusIconSvg from "@/assets/svg/sortIcons/SortStatusIconSvg";
import { useAppSelector } from "@/storage/redux";
import { StatusType } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";
import { Select } from "antd";
import { StatusDto } from "models/tasks";
import { useEffect, useState } from "react";
import {
  statusBGColorEnum,
  statusBorderColorEnum,
  taskStatusEnum,
} from "utils/constants";
type Props = {
  status: string[];
  setStatus: Function;
};
type TagProps = {
  label: any;
  value: StatusDto;
  closable: any;
  onClose: any;
};
const StatusSelectorComponent = ({ status, setStatus }: Props) => {
  const [statusValues, setStatusValues] = useState<any>();
  const statuses = useAppSelector(
    (state: RootState) => state.projectList.statuses
  );
  const Options = statuses?.map((st) => {
    return {
      value: JSON.stringify(st),
      label: st.name,
    };
  });

  const tagRender = (props: TagProps) => {
    const { label, value, closable, onClose } = props;
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
        <div
          className="flex h-2 w-2 items-center rounded-full"
          // style={{
          //   backgroundColor: statusBorderColorEnum[value],
          // }}
        />
        <div>{label}</div> <CrossIconSvg />
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
    setStatusValues(tmpArray);
  }, [status]);
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <SortStatusIconSvg />
      {/* <span className="font-normal">Status</span> */}
      <Select
        placeholder="Select Status"
        mode="multiple"
        tagRender={(props) => tagRender(props)}
        value={status}
        defaultValue={[
          '{"name":"To Do","statusCategoryName":"TO_DO"}',
          '{"name":"In Progress","statusCategoryName":"IN_PROGRESS"}',
        ]}
        className="w-full"
        showArrow
        options={Options}
        // options={[
        //   { value: "TO_DO", label: "Todo" },
        //   { value: "IN_PROGRESS", label: "In Progress" },
        //   { value: "DONE", label: "Done" },
        // ]}
        onChange={(value) => {
          console.log(
            "🚀 ~ file: statusSelector.tsx:90 ~ StatusSelectorComponent ~ value:",
            value
          );
          setStatus(value);
          setStatusValues(value);
        }}
      />
    </div>
  );
};

export default StatusSelectorComponent;
