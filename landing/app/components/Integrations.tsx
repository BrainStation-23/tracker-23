import Image from "next/image";

import JiraLogo from "@/public/integrations/jira.svg";
import TrelloLogo from "@/public/integrations/trello.svg";
import ManualLogo from "@/public/integrations/manual.svg";
import OutlookLogo from "@/public/integrations/outlook.svg";
// import PhoneFrameContain from "@/public/integrations/phone_frame_contain.png";

export default function Integrations() {
  const integrations = [
    {
      name: "Jira",
      icon: JiraLogo,
    },
    {
      name: "Outlook",
      icon: OutlookLogo,
    },
    {
      name: "Trello",
      icon: TrelloLogo,
    },
    {
      name: "Manual",
      icon: ManualLogo,
    },
  ];

  return (
    <section className="mt-20 bg-[url('/integrations/integration_bg.png')] bg-no-repeat bg-cover px-4 md:px-0">
      <div className="py-20 md:pt-60 md:pb-96 container mx-auto">
        <p className="text-black font-medium text-5xl leading-10 text-center md:text-start">
          Supported
        </p>
        <p className="text-white text-6xl text-center md:text-start">
          Integrations
        </p>
        <div className="py-14 grid gap-8 grid-cols-1 md:grid-cols-4">
          {integrations.map((item, idx) => (
            <div
              key={idx}
              className="rounded-2xl shadow-custom bg-white px-20 py-10 flex justify-center items-center min-h-32"
            >
              <Image src={item.icon} alt={item.name} />
            </div>
          ))}
        </div>
      </div>
      {/* <div className="hidden md:flex justify-end bg-[url('/integrations/phone_frame.png')] bg-no-repeat bg-right pb-6">
        <Image className="pt-6" alt="phone_frame" src={PhoneFrameContain} />
      </div> */}
    </section>
  );
}
