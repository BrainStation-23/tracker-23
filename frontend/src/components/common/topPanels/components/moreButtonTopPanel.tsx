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
      open={dropdownOpen}
      placement="bottomRight"
      onOpenChange={(open) => {
        setDropdownOpen(open);
      }}
      dropdownRender={(menu: React.ReactNode) => (
        <div className="custom-dropdown-bg float-right">{menu}</div>
      )}
      trigger={["click"]}
      className="custom-dropdown-bg flex h-8 items-center justify-center rounded-lg border p-2"
    >
      <div className="flex items-center justify-center">
        <LuMoreVertical />
      </div>
    </Dropdown>
  );
};

export default MoreButtonTopPanel;
