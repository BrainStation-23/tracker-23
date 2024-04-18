import { Form } from "antd";

const MyFormItem = ({ rules = [], label, noStar, ...restProps }: any) => {
  let myLabel = label;

  if (rules.some((rule: any) => rule.required)) {
    myLabel = (
      <div className="2xl:text-base">
        {myLabel}
        {!noStar && <span style={{ color: "red" }}>*</span>}
      </div>
    );
  }

  return (
    <Form.Item
      rules={rules}
      label={myLabel}
      {...restProps}
      style={{ borderColor: "red" }}
    />
  );
};

export default MyFormItem;
