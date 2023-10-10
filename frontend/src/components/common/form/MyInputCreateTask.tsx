import { Form, Input } from "antd";
// type Props = {
//   rules?: any;
//   children?: any;
//   name?: string;
//   label?: any;
//   type?: string;
//   placeholder?: string;
// };

const MyInputCreateTask = ({
  rules = [],
  name,
  label,
  type,
  placeholder,
  children,
  ...restProps
}: any) => {
  const { TextArea } = Input;
  let myLabel = label;

  if (rules.some((rule: any) => rule.required)) {
    myLabel = (
      <div className="">
        {myLabel}
        <span style={{ color: "red" }}>*</span>
      </div>
    );
  }
  return (
    <Form.Item
      rules={rules}
      name={name}
      label={myLabel}
      // rules={[{ required: true }]}
      labelCol={{ span: 24 }}
      {...restProps}
      className="mb-1"
    >
      {children ? (
        children
      ) : type === "TextArea" ? (
        <TextArea placeholder="Enter text here..." />
      ) : (
        <Input placeholder={placeholder} />
      )}
    </Form.Item>
  );
};

export default MyInputCreateTask;
