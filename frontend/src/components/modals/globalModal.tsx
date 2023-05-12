import { Modal } from "antd";
import { useRouter } from "next/router";
type Props = {
  children: any;
  isModalOpen: boolean;
  setIsModalOpen: Function;
  title?: string;
  className?: string;
};
const GlobalMOdal = ({
  children,
  isModalOpen,
  setIsModalOpen,
  title,
  className,
}: Props) => {
  const router = useRouter();
  const handleOk = () => {
    setIsModalOpen(false);
  };
  const handleCancel = () => {
    router.push("/integrations");
    setIsModalOpen(false);
  };
  return (
    <Modal
      title={title}
      open={isModalOpen}
      onOk={handleOk}
      onCancel={handleCancel}
      width={"720px"}
      className={className}
      footer={null}
    >
      {children}
    </Modal>
  );
};

export default GlobalMOdal;
