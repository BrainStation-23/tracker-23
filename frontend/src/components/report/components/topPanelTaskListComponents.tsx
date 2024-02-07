import { Input } from "antd";
import { debounce } from "lodash";

import SearchIconSvg from "@/assets/svg/searchIconSvg";

type Props = {
  setSearchText: Function;
};
const TopPanelTaskListComponents = ({ setSearchText }: Props) => {
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
    </>
  );
};

export default TopPanelTaskListComponents;
