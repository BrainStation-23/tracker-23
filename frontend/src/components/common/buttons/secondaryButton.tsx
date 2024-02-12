import { Button } from "antd";

type Props = {
  children: React.ReactNode;
  onClick?: Function;
  htmlType?: "button" | "submit" | "reset";
  type?: "link" | "text" | "ghost" | "default" | "primary" | "dashed";
  className?: string;
};
const SecondaryButton = ({
  children,
  onClick,
  htmlType,
  type,
  className,
}: Props) => {
  return (
    <Button
      type={type}
      htmlType={htmlType}
      className={`flex items-center gap-2 py-3 text-[15px] ${className}`}
      onClick={() => onClick && onClick()}
    >
      {children}
    </Button>
  );
};

export default SecondaryButton;
