import { Input } from "antd";
import { debounce } from "lodash";

import SearchIconSvg from "@/assets/svg/searchIconSvg";
import PrioritySelectorComponent from "@/components/common/topPanels/components/prioritySelector";
import StatusSelectorComponent from "@/components/common/topPanels/components/statusSelector";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

type Props = {
  searchText: string;
  setSearchText: Function;
  status: any;
  setStatus: Function;
  priority: any;
  setPriority: Function;
};
const TopPanelTaskListComponents = ({
  searchText,
  setSearchText,
  status,
  setStatus,
  priority,
  setPriority,
}: Props) => {
  const sprintList = useAppSelector(
    (state: RootState) => state.tasksSlice.sprintList
  );

  const handleInputChange = (event: any) => {
    setSearchText(event.target.value);
  };
  const debouncedHandleInputChange = debounce(handleInputChange, 500);

  return (
    <>
      <Input
        placeholder="Search"
        prefix={<SearchIconSvg />}
        onChange={(event) => {
          event.persist();
          debouncedHandleInputChange(event);
        }}
        allowClear
        className="w-[210px]"
      />
      <PrioritySelectorComponent
        key={Math.random()}
        {...{ priority, setPriority }}
        className="w-[210px]"
      />
      <StatusSelectorComponent
        key={Math.random()}
        {...{ status, setStatus }}
        className="w-[210px]"
      />
    </>
  );
};

export default TopPanelTaskListComponents;
