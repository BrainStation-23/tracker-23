import { Form, Input } from "antd";

const MyPasswordInput = ({ ...restProps }: any) => {
  return (
    <Input.Password
      {...restProps}
      className="flex rounded-lg border-2 border-secondary px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
    />
  );
};

export default MyPasswordInput;
