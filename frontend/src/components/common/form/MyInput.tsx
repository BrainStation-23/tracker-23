import { Form, Input } from "antd";

const MyInput = ({ ...restProps }: any) => {
  return (
    <Input
      {...restProps}
      className="flex w-full rounded-lg border-2 border-secondary px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3 2xl:text-xl"
    />
  );
};

export default MyInput;
