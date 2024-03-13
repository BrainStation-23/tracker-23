import Image from "next/image";
import Logo from "@/public/logo_black.png";

export default function Header() {
  return (
    <div className="w-full bg-[url('/top_image.jpg')] bg-no-repeat bg-cover">
      <div className="container mx-auto py-10">
        <div className="flex justify-between">
          <div>
            <Image src={Logo} alt="Logo" />
          </div>
          <div className="flex gap-1 text-lg font-medium">
            <button className="text-[#4A3B5C] px-7 py-1 rounded-full hover:text-white hover:bg-main">
              Sign Up
            </button>
            <button className="bg-main px-7 py-1 rounded-full">Sign In</button>
          </div>
        </div>
        <div className="pl-28 py-40 w-full md:w-2/5">
          <p className="text-main text-4xl font-bold mb-5">
            Effortlessly master your day
          </p>
          <p className="w-5/6 text-black text-xl font-semibold mb-5 leading-6">
            One click to track, manage, and elevate your tasks to new heights
            with our software.
          </p>
          <button className="bg-main w-2/3 px-10 py-1.5 rounded-full">
            GET STARTED
          </button>
        </div>
      </div>
    </div>
  );
}
