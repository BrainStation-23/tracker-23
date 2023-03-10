// import { UserOutlined, MailOutlined, KeyOutlined } from "@ant-design/icons";
import { Card } from "antd";
import Link from "next/link";
import RegistrationForm from "./components/registrationForm";

// export async function getAuthLink() {
//   try {
//     const response = await axios.get("http://localhost:3000/getLink");
//     console.log("Auth url ", response);
//     return response;
//   } catch (error) {
//     console.error(error);
//   }
// }

const Registration = () => {
  // const handleSubmit = () => {
  //   console.log("submit");
  // };
  const getLink = async () => {
    // const res = await getAuthLink();
    // console.log("$$$$$$$$$$$$$$", res);
    // window.open(res?.data);
  };
  return (
    <div className="w-[500px] mx-auto">
      <Card title="Credentials" bordered={false}>
        <RegistrationForm />
      </Card>
      <div className="mx-auto w-max p-2">
        Already have an account? ...{" "}
        <Link href="/login">
          <span className="hover:text-green-600"> Login</span>
        </Link>
      </div>
    </div>
  );
};
export default Registration;
