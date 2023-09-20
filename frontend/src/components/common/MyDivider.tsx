import { Divider } from "antd";

const MyDivider = ({ children, ...restProps }: any) => {
  return (
    <Divider className="border-secondary " {...restProps}>
      {children}
    </Divider>
  );
};

export default MyDivider;
