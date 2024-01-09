import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useRouter } from "next/router";

const ReportPageComponent = () => {
  const router = useRouter();
  const path = router.asPath;
  const pageId = router.query?.reportPageId
    ? parseInt(router.query?.reportPageId as string)
    : -1;

  const reportPageData = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  ).find((reportPage) => reportPage.id === pageId);

  return (
    <div className="flex flex-col gap-4">
      <div> {path}</div> <div>{reportPageData?.name}</div>
    </div>
  );
};

export default ReportPageComponent;
