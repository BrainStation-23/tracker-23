import Image from "next/image";

import MembersLogo from "@/public/features/MembersLogo.svg";
import SupportLogo from "@/public/features/SupportLogo.svg";
import TaskViewLogo from "@/public/features/TaskViewLogo.svg";
import SettingsLogo from "@/public/features/SettingsLogo.svg";
import DashboardLogo from "@/public/features/DashboardLogo.svg";
import InvitationsLogo from "@/public/features/InvitationsLogo.svg";
import ProjectViewLogo from "@/public/features/ProjectViewLogo.svg";
import SourceIntegrationLogo from "@/public/features/SourceIntegrationLogo.svg";

export default function Features() {
  const features = [
    {
      name: "Dashboard",
      description:
        "Your command center for insights and action: Navigate, analyze, and make informed decisions with ease.",
      icon: DashboardLogo,
    },
    {
      name: "Task View",
      description:
        "Get a unified view of all your tasks and projectsSeize the day, one task at a time - Explore your productivity in Task View",
      icon: TaskViewLogo,
    },
    {
      name: "Source Integration",
      description:
        "Streamline your workflow: Time-tracking with effortless source integration.",
      icon: SourceIntegrationLogo,
    },
    {
      name: "Project View",
      description:
        "Your Gateway to Streamlined Task Tracking and Project Management.",
      icon: ProjectViewLogo,
    },
    {
      name: "Invitations",
      description:
        "Join us to master your time: Your exclusive invite to our time tracking tool awaits.",
      icon: InvitationsLogo,
    },
    {
      name: "Members",
      description:
        "Streamline your team's productivity with Members Task Tracker: Where collaboration meets efficiency.",
      icon: MembersLogo,
    },
    {
      name: "Settings",
      description:
        "Customize Your Time, Tailor Your Experience: Dive into Settings.",
      icon: SettingsLogo,
    },
    {
      name: "Support",
      description:
        "Streamline your support with ease: The one-stop task tracker for seamless ticket management and resolution.",
      icon: SupportLogo,
    },
  ];

  return (
    <section id="features" className="my-20 container mx-auto px-4 md:px-0">
      <p className="text-black text-lg leading-3 font-medium text-center md:text-start">
        Tracker 23
      </p>
      <h3 className="text-main font-medium text-6xl text-center md:text-start">
        Features
      </h3>
      <div className="pt-10 grid gap-8 grid-cols-1 md:grid-cols-2">
        {features.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl bg-white flex justify-start items-start gap-6"
          >
            <Image className="pt-2.5" src={item.icon} alt="product icon" />
            <div>
              <p className="text-black text-2xl font-extrabold">{item.name}</p>
              <p className="text-black text-lg font-medium">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
