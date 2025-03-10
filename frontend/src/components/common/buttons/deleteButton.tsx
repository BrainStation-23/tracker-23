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
      type="text"
      className={`${className ? className : "flex items-center gap-2 p-1"}`}
      onClick={() => onClick && onClick()}
    >
      <DeleteIconSvg /> {children}
    </Button>
  );
};

export default DeleteButton;
