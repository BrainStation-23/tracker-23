import { Modal } from "antd";
type Props = {
  children: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleCancel?: Function;
  title?: string;
  className?: string;
  width?: number;
};
const GlobalModal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  title,
  className,
  handleCancel,
  width,
}: Props) => {
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleOnCancel = () => {
    if (handleCancel) handleCancel();
    setIsModalOpen(false);
  };
  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleOnCancel}
      width={width ? width : "720px"}
      className={className}
      footer={null}
    >
      {children}
    </Modal>
  );
};

export default GlobalModal;
