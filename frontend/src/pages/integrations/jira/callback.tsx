import { Spin, message } from "antd";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { userAPI } from "APIs";
import { toast } from "react-toastify";

const CallbackPage = () => {
  const router = useRouter();
  const [status, setStatus] = useState(false);

  const codeFound = async (code: string) => {
    const res = await userAPI.sendJiraCode(code);
    console.log("🚀 ~ file: callback.tsx:12 ~ codeFound ~ res:", res);
    if (res) {
      toast.success(res.message ? res.message : "Integration Successful");
      router.push("/taskList");
    } else router.push("/integrations");
  };

  useEffect(() => {
    const code = router.query.code;
    console.log("🚀 ~ file: callback.tsx:10 ~ useEffect ~ searchTerm:", code);
    if (typeof code === "string") codeFound(code);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  useEffect(() => {
    if (status) {
      router.push("/home");
    }
  }, [router, status]);
  return (
    <>
      <div className="flex justify-center w-full p-40">
        <Spin tip="Integrating Jira" size="large" className="scale-150"></Spin>
      </div>
    </>
  );
};

export default CallbackPage;
