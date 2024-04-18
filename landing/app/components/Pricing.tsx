import Image from "next/image";

import WhiteBox from "@/public/pricing/whiteBox.svg";
import GreenBlueLogo from "@/public/pricing/greenBlueLogo.svg";
import BlackOrangeLogo from "@/public/pricing/blackOrangeLogo.svg";

export default function Pricing() {
  const plans = [
    {
      name: "Project",
      name2: "Time Tracking",
      price: 12,
      name3: "Project Time Tracking Suite",
      topBg: "bg-black",
      icon: BlackOrangeLogo,
      features: [
        {
          line1: "TimeBill",
          line2: "Track project hours for billing",
        },
        {
          line1: "ProjectTime",
          line2: "Manage project hours & costs",
        },
        {
          line1: "Expense",
          line2: "Track project expenses",
        },
        {
          line1: "TimeOff",
          line2: "Manage paid time off",
        },
      ],
    },
    {
      name: "Time",
      name2: "& Attendance",
      name3: "Time and Attendance Product Suite",
      topBg: "bg-gray-600",
      price: 6,
      icon: GreenBlueLogo,
      features: [
        {
          line1: "Workforce Management",
          line2: "Manage your employee time, schedules & compliance",
        },
        {
          line1: "ProjectTime",
          line2: "Manage project hours & costs",
        },
        {
          line1: "Expense",
          line2: "Track project expenses",
        },
        {
          line1: "TimeOff",
          line2: "Manage paid time off",
        },
      ],
    },
    {
      name: "PSA",
      name2: "and PPM",
      price: 29,
      topBg: "bg-[#CC5A3C]",
      name3: "Professional Services Automation Suite",
      icon: GreenBlueLogo,
      features: [
        {
          line1: "Polaris PSA",
          line2: "Professional Services Automation",
        },
        {
          line1: "Polaris PPM",
          line2: "Project Portfolio Management",
        },
      ],
    },
  ];

  return (
    <section id="price" className="my-20 container mx-auto px-4 md:px-0">
      <p className="text-custom-blue text-xl font-medium text-center md:text-start">
        Supported
      </p>
      <h3 className="text-custom-blue text-6xl font-medium text-center md:text-start">
        Integrations
      </h3>
      <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-14">
        {plans.map((item, idx) => (
          <div key={idx} className="flex flex-col rounded-3xl shadow-custom">
            <div
              className={`flex gap-4 items-center justify-center pt-14 pb-4 rounded-t-lg ${item.topBg}`}
            >
              <Image src={WhiteBox} alt="plan" />
              <div className="text-white text-xl">
                <h3 className="font-extrabold leading-3">{item.name}</h3>
                <p className="font-medium ">{item.name2}</p>
              </div>
            </div>
            <div className="text-center text-black text-base font-medium my-5 space-y-2">
              <p>Starts at</p>
              <p className="text-main font-bold text-5xl">${item.price}/mo</p>
              <p>{item.name3}</p>
            </div>
            <div className="px-12 py-8 space-y-3">
              {item.features.map((featureItem, idx) => (
                <div key={idx} className="flex flex-row items-center gap-4">
                  <div className="self-start shrink-0">
                    <Image
                      width={40}
                      height={40}
                      src={item.icon}
                      alt="Gear Icon"
                    />
                  </div>
                  <div className="w-full text-black">
                    <p className="text-xl font-bold">{featureItem.line1}</p>
                    <p className="font-medium w-3/4">{featureItem.line2}</p>
                    <hr className="bg-black h-0.5 my-4" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex-1 flex items-end p-8">
              <a
                href="https://app.timetracker23.com"
                className="py-5 rounded-2xl w-full font-bold text-white bg-main text-center"
              >
                START TRIAL
              </a>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
