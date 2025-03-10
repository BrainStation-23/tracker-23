import { Button } from "antd";
type Props = {
  children: React.ReactNode;
  onClick?: Function;
  htmlType?: "button" | "submit" | "reset";
};
const PrimaryButton2 = ({ children, onClick, htmlType }: Props) => {
  return (
    <Button
      htmlType={htmlType}
      className="flex w-min items-center rounded-lg bg-white px-5 py-6 font-semibold transition-all duration-100 hover:scale-105 hover:text-primary md:py-8"
      onClick={() => onClick && onClick()}
    >
      {children}
    </Button>
  );
};

export default PrimaryButton2;
