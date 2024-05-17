import Image from "next/image";
import Logo from "@/public/header/logo.png";
import Link from "next/link";

export default function Header() {
  return (
    <div className="w-full bg-[url('/header/landing.png')] bg-no-repeat bg-cover">
      <div className="container mx-auto pt-4 pb-10 px-4 md:px-0">
        <div className="flex items-center justify-between">
          <Image src={Logo} alt="Logo" width={250} />
          <div className="flex gap-1 text-lg font-medium">
            <Link
              href="https://app.timetracker23.com/registration"
              className="text-[#4A3B5C] px-2 md:px-7 py-1 rounded-full hover:text-white hover:bg-main"
            >
              Sign Up
            </Link>
            <Link
              href="https://app.timetracker23.com/login"
              className="bg-main px-4 md:px-7 py-1 rounded-full text-white"
            >
              Sign In
            </Link>
          </div>
        </div>
        <div className="md:pl-28 py-20 md:py-40 w-full md:w-2/5 text-center md:text-start">
          <p className="text-main text-4xl font-bold mb-5">
            Effortlessly master your day
          </p>
          <p className="md:w-5/6 text-black text-xl font-semibold mb-5 leading-6">
            One click to track, manage, and elevate your tasks to new heights
            with our software.
          </p>
          <Link
            href="https://app.timetracker23.com"
            className="bg-main w-2/3 px-10 py-1.5 rounded-full text-white"
          >
            GET STARTED
          </Link>
        </div>
      </div>
    </div>
  );
}
