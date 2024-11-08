import ReportPageComponent from "@/components/report/reportPage";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ReportPage = () => {
  const router = useRouter();
  const [pageId, setPageId] = useState(
    router.query.reportPageId ? Number(router.query.reportPageId) : undefined
  );

  useEffect(() => {
    if (router.isReady) {
      setPageId(Number(router.query.reportPageId));
    }
  }, [router]);

  if (!router.isReady) return null;

  if (!pageId) {
    router.replace("/reports");
  }
  return <ReportPageComponent pageId={pageId} />;
};

export default ReportPage;
