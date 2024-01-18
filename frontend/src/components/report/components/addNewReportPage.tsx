import PrimaryButton from "@/components/common/buttons/primaryButton";
import GlobalModal from "@/components/modals/globalModal";
import { addReportPage } from "@/storage/redux/reportsSlice";
import { userAPI } from "APIs";
import { Form, Input, Spin } from "antd";
import { useState } from "react";
import { useDispatch } from "react-redux";
type Props = {
  setIsModalOpen: Function;
  isModalOpen: boolean;
};

const AddNewReportPage = ({ isModalOpen, setIsModalOpen }: Props) => {
  const dispatch = useDispatch();
  const [spinning, setSpinning] = useState(false);

  const createReportPage = async (data: { name: string }) => {
    setSpinning(true);
    const res = await userAPI.createReportPage(data);
    if (res) {
      console.log(res);
      dispatch(addReportPage(res));
      setIsModalOpen(false);
    }
    setSpinning(false);
  };
  const onFinish = (data: { name: string }) => {
    createReportPage(data);
  };

  return (
    <GlobalModal
      title="Add New Report Page"
      isModalOpen={isModalOpen}
      width={500}
      setIsModalOpen={setIsModalOpen}
    >
      <Spin spinning={spinning}>
        <Form onFinish={onFinish}>
          <Form.Item
            label="Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter a name",
              },
            ]}
          >
            <Input />
          </Form.Item>
          <PrimaryButton htmlType="submit" className="mx-auto">
            Create
          </PrimaryButton>
        </Form>
      </Spin>
    </GlobalModal>
  );
};

export default AddNewReportPage;
