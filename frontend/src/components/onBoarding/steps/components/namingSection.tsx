import { Form, Input, Radio, RadioChangeEvent, Space } from "antd";

const NamingStep = () => {
  return (
    <div className="flex flex-col gap-4 px-2">
      <div className="px-1 text-xl font-semibold text-black">
        What would you like to name your account?
      </div>
      <Form.Item
        className=" w-full"
        name="account"
        rules={[
          { required: true, message: "Please enter your account name" },
          {
            min: 0,
            max: 40,
            message: "Length should be less than 40",
          },
        ]}
      >
        <Input
          type="text"
          placeholder="Account Name"
          className="flex w-[300px] rounded-lg border-2 border-[#E0E0E0] p-[10px] font-medium text-[#4D4E55] placeholder:font-normal "
        />
      </Form.Item>
    </div>
  );
};

export default NamingStep;
