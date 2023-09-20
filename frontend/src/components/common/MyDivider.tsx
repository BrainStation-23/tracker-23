import { Divider } from "antd";

const MyDivider = ({ children, ...restProps }: any) => {
  return (
    <div
      className="flex items-center justify-between border-secondary"
      {...restProps}
    >
      <div className="h-1 w-[49%] bg-secondary" />
      <div className="2xl:text-2xl"> {children}</div>
      <div className="h-1 w-[40%] bg-secondary" />
    </div>
  );
};

export default MyDivider;
