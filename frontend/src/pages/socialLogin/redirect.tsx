import { SetCookie } from "@/services/cookie.service";
import { setLocalStorage } from "@/storage/storage";
import { Spin } from "antd";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";
import { toast } from "react-toastify";

const GoogleCallbackPage = () => {
  const router = useRouter();
  const [decodedData, setDecodedData] = useState(null);

  useEffect(() => {
    const encodedData = router.query.data as string;
    console.log(
      "🚀 ~ file: googleRedirectCB.tsx:10 ~ useEffect ~ encodedData:",
      encodedData
    );
    if (encodedData) {
      const decoded = JSON.parse(Buffer.from(encodedData, "base64").toString());
      console.log(
        "🚀 ~ file: googleRedirectCB.tsx:16 ~ useEffect ~ decoded:",
        decoded
      );
      if (decoded?.access_token) {
        SetCookie("access_token", decoded?.access_token);
        setLocalStorage("access_token", decoded?.access_token);
        setLocalStorage("userDetails", decoded);
        toast.success("Successfully Logged in");
        router.push("/");
      }
      // const decoded = Buffer.from(encodedData, "base64").toString();
      setDecodedData(decoded);
    }
  }, [router, router.query]);

  return (
    <div className="flex justify-center w-full p-40">
      <Spin tip="Loading" size="large" className="scale-150"></Spin>
    </div>
  );
};

export default GoogleCallbackPage;
