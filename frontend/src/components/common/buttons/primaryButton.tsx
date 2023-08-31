import { Button } from "antd";
type Props = {
  children: React.ReactNode;
  onClick?: Function;
  htmlType?: "button" | "submit" | "reset";
};
const PrimaryButton = ({ children, onClick, htmlType }: Props) => {
  return (
    <Button
      type="primary"
      htmlType={htmlType}
      className="flex items-center gap-2 py-3 text-[15px] text-white"
      onClick={() => onClick && onClick()}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
