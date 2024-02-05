import { Typography } from "antd";
import { LuNewspaper } from "react-icons/lu";

import MyLink from "@/components/common/link/MyLink";
import { useAppSelector } from "@/storage/redux";
import { RootState } from "@/storage/redux/store";

const { Text } = Typography;

//Temporary Design. This will change based on requirements7

const ReportPage = () => {
  const reportPages = useAppSelector(
    (state: RootState) => state.reportsSlice.reportPages
  );
  return (
    <div className="flex flex-col gap-3">
      <div className="font-semibold">Your Reports</div>
      {reportPages?.length > 0 && (
        <div className="flex flex-col gap-2">
          {reportPages?.map((reportPage) => {
            return (
              <div
                className={`group flex w-min items-center justify-between gap-2 rounded px-2 text-black hover:bg-[#ECECED] hover:font-semibold hover:text-primary `}
              >
                <MyLink
                  href={"/reports/" + reportPage.id}
                  className="flex items-center  gap-2 p-1"
                >
                  <div
                    className={`flex w-5 items-center text-xl group-hover:stroke-primary group-hover:text-primary`}
                  >
                    <LuNewspaper size={16} />
                  </div>
                  <div className="flex w-[120px] items-center">
                    <Text
                      className="m-0 p-0 text-xs "
                      ellipsis={{ tooltip: reportPage.name }}
                    >
                      {reportPage.name}
                    </Text>
                  </div>
                </MyLink>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ReportPage;
