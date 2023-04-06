import { Form, Input } from "antd";
const OnBoardingForm = () => {
  return (
    <div className="mt-[10%]">
      <Form
        name="basic"
        // labelCol={{ span: 8 }}
        // wrapperCol={{ span: 16 }}
        initialValues={{ remember: true }}
        // onFinish={onFinish}
        // onFinishFailed={onFinishFailed}
        autoComplete="off"
        className="mx-auto w-60"
      >
        <Form.Item
          className=" w-full"
          name="account"
          rules={[
            { required: true, message: "Please enter your account name" },
            {
              // type: "text",
              min: 0,
              max: 40,
              message: "Length should be less than 40",
            },
          ]}
        >
          <Input
            type="text"
            placeholder="Account Name"
            className="flex w-full rounded-lg border-2 border-black px-3 py-2 font-medium placeholder:font-normal md:px-4 md:py-3"
          />
          {/* <Input type="email" className="" /> */}
        </Form.Item>

        <Form.Item>
          <button className="flex w-full flex-none items-center justify-center rounded-lg border-2 border-black bg-black px-3 py-2 font-medium text-white md:px-4 md:py-3">
            Submit
          </button>
        </Form.Item>
      </Form>
    </div>
  );
};

export default OnBoardingForm;
