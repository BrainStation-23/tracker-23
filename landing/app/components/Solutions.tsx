import Image from "next/image";

import TimeInOutLogo from "@/public/solutions/timeInOut.svg";
import TimeTrackingLogo from "@/public/solutions/timeTracking.svg";
import GranularReportingLogo from "@/public/solutions/granularReporting.svg";
import BuildingBudgetingLogo from "@/public/solutions/buildingAndBudgeting.svg";
import UnifiedTimeAnalysisLogo from "@/public/solutions/unifiedTimeAnalysis.svg";
import RecurringEventPlanningLogo from "@/public/solutions/recurringEventPlanning.svg";

export default function Solutions() {
  const solutions = [
    {
      name: "Time",
      line2: "Tracking",
      icon: TimeTrackingLogo,
    },
    {
      name: "Unified",
      line2: "Time Analysis",
      icon: UnifiedTimeAnalysisLogo,
    },
    {
      name: "Granular",
      line2: "Reporting",
      icon: GranularReportingLogo,
    },
    {
      name: "Time In",
      line2: "Time Out",
      icon: TimeInOutLogo,
    },
    {
      name: "Recurring",
      line2: "Event Planning",
      icon: RecurringEventPlanningLogo,
    },
    {
      name: "Building",
      line2: "& Budgeting",
      icon: BuildingBudgetingLogo,
    },
  ];

  return (
    <section id="solutions" className="pt-16 px-4 md:px-0 container mx-auto">
      <p className="text-black font-medium text-xl leading-3 text-center md:text-start">
        Empowering your success with
      </p>
      <p className="text-main text-6xl text-center md:text-start">Solutions</p>
      <div className="pt-10">
        <ul className="grid gap-8 grid-cols-1 md:grid-cols-3">
          {solutions.map((item) => (
            <li key={item.name} className="rounded-3xl py-20 shadow-custom">
              <div className="flex items-start justify-center p-4">
                <div className="flex items-center justify-self-center self-center me-1">
                  <Image src={item.icon} alt="product icon" />
                </div>
                <div className="self-center pt-2">
                  <h4 className="text-black text-2xl font-extrabold leading-3">
                    {item.name}
                  </h4>
                  <p className="text-gray-800 font-semibold text-2xl">
                    {item.line2}
                  </p>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
