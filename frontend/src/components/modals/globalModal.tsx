import { Modal } from "antd";
import { Children } from "react";
type Props = {
  children: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  title?: string;
};
const GlobalMOdal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  title,
}: Props) => {
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    setIsModalOpen(false);
  };
  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={"720px"}
      footer={null}
    >
      {children}
    </Modal>
  );
};

export default GlobalMOdal;
