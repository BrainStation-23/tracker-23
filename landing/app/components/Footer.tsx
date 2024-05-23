import Image from "next/image";

import Facebook from "@/public/footer/fb.png";
import Linkedin from "@/public/footer/linkedin.png";
import LogoImage from "@/public/footer/logo_white.png";

export default function Footer() {
  return (
    <footer className="bg-gradient-to-r from-[#000000] to-main">
      <div className="container mx-auto py-10 px-4 md:px-0 text-white">
        <div className="flex w-full justify-between">
          <Image src={LogoImage} alt="logo" width={250} />
          <div className="flex justify-end gap-3 items-center">
            <Image src={Facebook} alt="Facebook" />
            <Image src={Linkedin} alt="Linkedin" />
          </div>
        </div>
        <ul className="pt-10 md:pt-20 flex flex-col items-center md:flex-row justify-center font-semibold gap-4 md:gap-10 text-2xl">
          <li>
            <a href="#solutions">Solutions</a>
          </li>
          <li>
            <a href="#features">Features</a>
          </li>
          <li>
            <a href="#suitability">Suitability</a>
          </li>
          {/* <li>
            <a href="#price">Price</a>
          </li> */}
        </ul>
        <hr className="md:w-3/4 m-auto my-4" />
        <p className="text-center text-lg font-semibold">
          Copyright © 2024 Brain Station 23 PLC. All right reserved
        </p>
      </div>
    </footer>
  );
}
