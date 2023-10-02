import { Switch } from "antd";
type Props = { adminMode: boolean; changeAdminMode: Function };

const AdminModeSwitch = ({ adminMode, changeAdminMode }: Props) => {
  return (
    <div className="bg flex w-[150px] justify-between">
      <div>Admin Mode </div>
      <Switch
        checked={adminMode}
        onChange={() => changeAdminMode()}
        style={{
          backgroundColor: adminMode ? "#18d925" : "#f01818",
        }}
      />
    </div>
  );
};

export default AdminModeSwitch;
