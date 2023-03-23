import { Image, Modal, Spin, Tooltip } from "antd";
import axios from "axios";
import { config } from "config";
import Link from "next/link";
import { useState } from "react";

const SocialLogin = () => {
	return (
		<div className="flex w-full flex-col items-center">
			<div>Or login with ..</div>
			<div className="flex gap-6">
				{/* <div className="mt-4" onClick={() => setIsModalOpen(true)}>
          <Tooltip
            placement="bottom"
            title={"Login with Facebook"}
            color="purple"
          >
            <Link href={`${config?.baseUrl}/auth/facebook/login`}>
              <div
                className="rounded-xl bg-blue-200 px-5 
              py-2.5 text-2xl font-extrabold grayscale duration-1000 
              hover:bg-blue-700 
              hover:text-white 
              hover:grayscale-0"
              >
                f
              </div>
            </Link>
          </Tooltip>
        </div> */}

				<div className="mt-4">
					<Tooltip
						placement="bottom"
						title={"Login with Google"}
						color="purple"
					>
						<Link href={`${config?.baseUrl}/auth/google`}>
							<div className="flex flex-col rounded-xl bg-red-100 p-4 grayscale duration-1000 hover:grayscale-0">
								<Image
									height={20}
									width={20}
									preview={false}
									src="/assets/images/googleIcon.png"
									alt="Error"
								/>
							</div>
						</Link>
					</Tooltip>
				</div>
			</div>
		</div>
	);
};

export default SocialLogin;
