import Image from "next/image";

import LogoImage from "@/public/logo_white.png";
import Facebook from "@/public/fb.png";
import Linkedin from "@/public/linkedin.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#000000] to-main">
      <div className="container mx-auto py-10 w-full">
        <div className="flex w-full justify-between">
          <div>
            <Image src={LogoImage} alt="logo" />
          </div>
          <div className="flex justify-end gap-3 items-center">
            <Image src={Facebook} alt="Facebook" />
            <Image src={Linkedin} alt="Linkedin" />
          </div>
        </div>
        <ul className="flex justify-center font-semibold gap-10 text-2xl">
          <li>Solutions</li>
          <li>Features</li>
          <li>Suitability</li>
          <li>Price</li>
        </ul>
        <hr className="w-3/4 m-auto my-4" />
        <p className="text-center text-lg font-semibold">
          Copyright © 2024 Brain Station 23 PLC. All right reserved
        </p>
      </div>
    </footer>
  );
}
