import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect } from "react";
import { menuOptions } from "utils/constants";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    if (router.pathname === "/") {
      router.replace("/taskList");
    }
  }, [router]);

  return (
    <div className="mx-auto mt-5 w-max">
      <h1 className="text-3xl font-bold ">Welcome!</h1>
      <h1 className="flex flex-col gap-3 pt-5">
        {menuOptions.map((option, index) => (
          <Link key={index} href={option.link}>
            Go to {option.title}
          </Link>
        ))}
      </h1>
    </div>
  );
}
