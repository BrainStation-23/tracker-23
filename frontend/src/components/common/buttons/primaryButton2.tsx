import { Button } from "antd";
type Props = {
  children: React.ReactNode;
  onClick?: Function;
  htmlType?: "button" | "submit" | "reset";
};
const PrimaryButton2 = ({ children, onClick, htmlType }: Props) => {
  return (
    <Button
      type="ghost"
      htmlType={htmlType}
      className="flex w-min items-center rounded-lg bg-white py-8 px-5 font-semibold transition-all duration-100 hover:scale-105 hover:text-primary"
      onClick={() => onClick && onClick()}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton2;
