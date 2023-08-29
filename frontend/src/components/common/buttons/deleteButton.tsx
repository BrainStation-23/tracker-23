import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import { Button } from "antd";

type Props = {
  children?: React.ReactNode;
  onClick?: Function;
  htmlType?: "button" | "submit" | "reset";
  className?: string;
};
const DeleteButton = ({ children, onClick, className }: Props) => {
  return (
    <Button
      className={`${className ? className : "flex w-full gap-2 p-1"}`}
      onClick={() => onClick && onClick()}
      type="ghost"
    >
      <DeleteIconSvg /> {children}
    </Button>
  );
};

export default DeleteButton;
