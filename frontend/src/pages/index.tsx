import Link from "next/link";
import { menuOptions } from "utils/constants";
import GlobalMOdal from "@/components/modals/globalModal";
import { useState } from "react";
import { Button, Modal } from "antd";

export default function Home() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    return (
        <div className="mx-auto mt-5 w-max">
            <h1 className="text-3xl font-bold ">Welcome!!</h1>
            <h1 className="flex flex-col gap-3 pt-5">
                {menuOptions.map((option, index) => (
                    <Link key={index} href={option.link}>
                        Go to {option.title}
                    </Link>
                ))}
            </h1>
            <Button onClick={() => setIsModalOpen(!isModalOpen)}>
                Click to see Demo
            </Button>
            <Modal
                // title={"title"}
                open={isModalOpen}
                // onOk={handleOk}
                onCancel={() => setIsModalOpen(false)}
                width={"full"}
                className="inset-0 top-6 my-auto h-min w-[calc(90vw)] bg-gray-400 p-0"
                footer={null}
            >
                <div className="m-auto h-min w-min">
                    <iframe
                        src="https://demo.arcade.software/x7mVsaFBX4EIrgV76AQH?embed"
                        frameBorder="0"
                        loading="lazy"
                        className="m-0 rounded-lg border-2 border-black"
                        allowFullScreen
                        style={{
                            width: "calc(85vw)",
                            height: "calc(90vh)",
                            colorScheme: "dark",
                        }}
                        title="Tracker23 Demo"
                    ></iframe>
                </div>
            </Modal>
            {/* <div>
        <iframe
          src="https://demo.arcade.software/x7mVsaFBX4EIrgV76AQH?embed"
          frameBorder="0"
          loading="lazy"
          // className="h-screen-30px"
          allowFullScreen
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "calc(90vw)",
            height: "calc(90vh)",
            colorScheme: "light",
          }}
          title="Tracker23 Demo"
        ></iframe>
      </div> */}
        </div>
    );
}
