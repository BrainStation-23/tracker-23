import ReportPageComponent from "@/components/report/reportPage";
import { useRouter } from "next/router";

const ReportPage = () => {
  const router = useRouter();
  let pageId: number | null = null;
  try {
    pageId = router.query?.reportPageId
      ? parseInt(router.query?.reportPageId as string)
      : null;
  } catch (e) {
    router.replace("/reports/");
  }

  if (!pageId) {
    router.replace("/reports/");
  }
  return <ReportPageComponent pageId={pageId} />;
};

export default ReportPage;
