import { Dropdown } from "antd";
import { LuMoreVertical } from "react-icons/lu";

const MoreButtonTopPanel = ({
  menuProps,
  dropdownOpen,
  setDropdownOpen,
}: {
  menuProps: any;
  dropdownOpen: boolean;
  setDropdownOpen: Function;
}) => {
  return (
    <Dropdown
      menu={menuProps}
      placement="bottomRight"
      open={dropdownOpen}
      onOpenChange={(open) => {
        setDropdownOpen(open);
      }}
      dropdownRender={(menu: React.ReactNode) => (
        <div className="custom-dropdown-bg float-right">{menu}</div>
      )}
      trigger={["click"]}
      className="custom-dropdown-bg flex h-[33px] items-center rounded-lg border-[1px] border-secondary p-2"
    >
      <div>
        <LuMoreVertical />
      </div>
    </Dropdown>
  );
};

export default MoreButtonTopPanel;
