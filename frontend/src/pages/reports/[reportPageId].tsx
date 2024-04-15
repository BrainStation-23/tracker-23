import ReportPageComponent from "@/components/report/reportPage";
import { useRouter } from "next/router";

const ReportPage = () => {
  const router = useRouter();
  const pageId: number = router.query.reportPageId
    ? Number(router.query.reportPageId)
    : undefined;

  if (!pageId) {
    router.replace("/reports");
  }
  return <ReportPageComponent pageId={pageId} />;
};

export default ReportPage;
