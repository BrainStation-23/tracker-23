import Image from "next/image";

import NGOWorkforceLogo from "@/public/suitables/NGOLogo.svg";
import AgenciesLogo from "@/public/suitables/AgenciesLogo.svg";
import ProductTeamLogo from "@/public/suitables/ProductLogo.svg";
import StartupTeamLogo from "@/public/suitables/StartupLogo.svg";
import StartupTeamLogo2 from "@/public/suitables/Startup2Logo.svg";
import ProjectManagerLogo from "@/public/suitables/ProjectLogo.svg";
import FreelancerTeamLogo from "@/public/suitables/FreelancerLogo.svg";
import EducationalInstituteLogo from "@/public/suitables/EducationalLogo.svg";
import LargeCorporationLogo from "@/public/suitables/LargeCorporationLogo.svg";

export default function Suitables() {
  const suitables = [
    {
      name: "Agencies &",
      line2: "Professional Services",
      icon: AgenciesLogo,
    },
    {
      name: "Product",
      line2: "Team",
      icon: ProductTeamLogo,
    },
    {
      name: "Startup",
      line2: "Team",
      icon: StartupTeamLogo,
    },
    {
      name: "Freelancer",
      line2: "Team",
      icon: FreelancerTeamLogo,
    },
    {
      name: "Project",
      line2: "Manager",
      icon: ProjectManagerLogo,
    },
    {
      name: "Large",
      line2: "Corporation",
      icon: LargeCorporationLogo,
    },
    {
      name: "Startup",
      line2: "Team",
      icon: StartupTeamLogo2,
    },
    {
      name: "Educational",
      line2: "Institute",
      icon: EducationalInstituteLogo,
    },
    {
      name: "NGO",
      line2: "Workforce",
      icon: NGOWorkforceLogo,
    },
  ];

  return (
    <section id="suitability" className="my-20 container mx-auto px-4 md:px-0">
      <p className="text-custom-blue text-xl font-medium text-center md:text-start">
        Who are
      </p>
      <h3 className="text-custom-blue text-6xl font-medium text-center md:text-start">
        Suitable
      </h3>
      <div className="mt-12 grid gap-12 grid-cols-1 lg:grid-cols-3">
        {suitables.map((item, idx) => (
          <div
            key={idx}
            className="rounded-2xl py-10 min-h-52 shadow-custom flex justify-center items-center gap-4"
          >
            <Image src={item.icon} alt="product icon" />
            <div>
              <h4 className="text-black font-extrabold text-2xl">
                {item.name}
              </h4>
              {item.line2.split(" ").map((word, idx) => (
                <p key={idx} className="text-black text-2xl font-medium">
                  {word}
                </p>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
