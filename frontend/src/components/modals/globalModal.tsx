import { Input, Modal, Space } from "antd";
type Props = {
  children: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  handleCancel?: Function;
  title?: string;
  className?: string;
  width?: number;
  search?: boolean;
  setQueryData?: Function
};
const GlobalModal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  title,
  className,
  handleCancel,
  width,
  search,
  setQueryData
}: Props) => {
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleOnCancel = () => {
    if (handleCancel) handleCancel();
    setIsModalOpen(false);
  };
  return search ? (
    <Modal
      title={
        <Space style={{ width: "90%", justifyContent: "space-between" }}>
          <span>{title}</span>
          <Input
            placeholder="Search..."
            onChange={(e) => setQueryData(e.target.value)}
            style={{ width: "110%" }}
          />
        </Space>
      }
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleOnCancel}
      width={width ? width : "720px"}
      className={className}
      footer={null}
    >
      {children}
    </Modal>
  ) : (
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
