import ReportPageComponent from "@/components/report/reportPage";
import { useRouter } from "next/router";
import { Typography } from "antd";
import { LuNewspaper } from "react-icons/lu";
import MyLink from "@/components/common/link/MyLink";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";
import { useEffect, useState } from "react";

const { Text } = Typography;

const ReportPage = () => {
  const router = useRouter();
  const [pageId, setPageId] = useState<number | undefined>(undefined);

  // Fetch reportPages unconditionally to avoid hook ordering issues
  const reportPages = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  );

  useEffect(() => {
    if (router.query.reportPage) {
      const parsedId = Number(router.query.reportPage);
      if (!isNaN(parsedId)) {
        setPageId(parsedId);
      }
    }
  }, [router.query.reportPage]);

  if (!pageId) {
    return (
      <div className="flex flex-col gap-3 px-8 pt-2">
        <div className="font-semibold">Your Reports</div>
        {reportPages?.length > 0 && (
          <div className="flex flex-col gap-2">
            {reportPages.map((reportPage) => (
              <div
                key={reportPage.id}
                className="group flex w-min items-center justify-between gap-2 rounded px-2 text-black hover:bg-[#ECECED] hover:font-semibold hover:text-primary"
              >
                <MyLink
                  href={`/reports?reportPage=${reportPage.id}`}
                  className="flex items-center gap-2 p-1"
                >
                  <div className="flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary">
                    <LuNewspaper size={16} />
                  </div>
                  <div className="flex w-[120px] items-center">
                    <Text
                      className="m-0 p-0 text-xs"
                      ellipsis={{ tooltip: reportPage.name }}
                    >
                      {reportPage.name}
                    </Text>
                  </div>
                </MyLink>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  return <ReportPageComponent pageId={pageId} />;
};

export default ReportPage;
