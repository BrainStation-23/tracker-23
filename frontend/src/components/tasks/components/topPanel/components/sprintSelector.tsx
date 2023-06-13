import CrossIconSvg from "@/assets/svg/CrossIconSvg";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { Select } from "antd";
import { SprintDto } from "models/tasks";
import { useEffect, useState } from "react";
import { GiSprint } from "react-icons/gi";
type Props = {
  sprints: any[];
  setSprints: Function;
};
type TagProps = {
  label: any;
  value: SprintDto;
  closable: any;
  onClose: any;
};
const SprintSelectorComponent = ({ sprints, setSprints }: Props) => {
  const defaultValues: any = [];
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );
  const Options: { value: number; label: string }[] = [];
  for (const st of sprintList) {
    Options.push({
      value: st.id,
      label: st.name,
    });
  }

  if (Options?.length === 0) {
    for (const val of defaultValues) {
      Options.push({
        value: val.id,
        label: val.name,
      });
    }
  }
  // const tagRender = (props: TagProps) => {
  //   const { label, value, closable, onClose } = props;
  //   const SprintObj: SprintType = value && JSON.parse(value);

  //   const onPreventMouseDown = (event: React.MouseEvent<HTMLSpanElement>) => {
  //     event.preventDefault();
  //     event.stopPropagation();
  //   };
  //   return (
  //     <div
  //       style={{
  //         backgroundColor: SprintBGColorEnum[SprintObj?.SprintCategoryName],
  //         border: `1px solid ${
  //           SprintBorderColorEnum[SprintObj?.SprintCategoryName]
  //         }`,
  //         borderRadius: "36px",
  //       }}
  //       onClick={onClose}
  //       className="m-1 flex w-max cursor-pointer items-center gap-1 px-2 py-0.5 text-xs font-medium text-black"
  //     >
  //       <div
  //         className="flex h-2 w-2 items-center rounded-full"
  //         // style={{
  //         //   backgroundColor: SprintBorderColorEnum[value],
  //         // }}
  //       />
  //       <div>{label}</div> <CrossIconSvg />
  //     </div>
  //   );
  // };
  useEffect(() => {
    const tmpArray: any[] = [];
    sprints?.map((st) => {
      for (const option of Options) {
        if (option.label === JSON.parse(st).label) tmpArray.push(option.value);
      }
    });
  }, [sprints]);
  return (
    <div
      className={`flex w-full items-center gap-2 text-sm font-normal text-black `}
      // style={{
      //   color: active === "Sort" ? "#00A3DE" : "black",
      //   // backgroundColor: "#00A3DE",
      // }}
      // onClick={() => setActive("Sort")}
    >
      <GiSprint size={24} />
      {/* <span className="font-normal">Sprint</span> */}
      <Select
        placeholder="Select Sprint"
        mode="multiple"
        // tagRender={(props) => tagRender(props)}
        value={sprints}
        defaultValue={[]}
        className="w-full"
        showArrow
        options={Options}
        // options={[
        // ]}
        onChange={(value) => {
          setSprints(value);
        }}
      />
    </div>
  );
};

export default SprintSelectorComponent;
