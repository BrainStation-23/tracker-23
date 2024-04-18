import IntersectionComponent from "@/components/common/observer";
import { ReportData } from "@/storage/redux/reportsSlice";
import { useState } from "react";

const IntersectionWrapper = ({
  report,
  reportToRender,
}: {
  report: ReportData;
  reportToRender: Function;
}) => {
  const [inView, setInView] = useState(false);
  return (
    <IntersectionComponent setInView={setInView}>
      {reportToRender(report, inView)}
    </IntersectionComponent>
  );
};
export default IntersectionWrapper;
