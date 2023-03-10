import CustomLayout from "@/components/layout/layout";
import Navbar from "@/components/navbar";
import SideBar from "@/components/navbar/sideBar";
import "@/styles/globals.css";
import { Button } from "antd";
import Axios from "axios";
import { config } from "config";
import type { AppProps } from "next/app";
import { useState } from "react";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// Axios.defaults.baseURL = process?.env?.NEXT_PUBLIC_API_PREFIX_REST;
// Axios.defaults.baseURL =
//   "http://ec2-54-172-94-212.compute-1.amazonaws.com:3000";
Axios.defaults.baseURL = config?.baseUrl;
export default function App({ Component, pageProps }: AppProps) {
  return (
    <CustomLayout>
      <Component {...pageProps} />
    </CustomLayout>
  );
}
