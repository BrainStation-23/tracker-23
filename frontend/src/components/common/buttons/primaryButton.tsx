import { Button } from "antd";
type Props = {
  children: React.ReactNode;
  onClick?: Function;
  className?: string;
  htmlType?: "button" | "submit" | "reset";
};
const PrimaryButton = ({ children, onClick, htmlType, className }: Props) => {
  return (
    <Button
      type="ghost"
      htmlType={htmlType}
      className={` ${className} flex items-center gap-2 border-none bg-primary py-4 text-[15px] text-white hover:text-white `}
      onClick={() => onClick && onClick()}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton;
