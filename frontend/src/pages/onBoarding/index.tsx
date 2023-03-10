import OnBoarding from "@/components/onBoarding";
import { userAPI } from "APIs";
import { NextPage } from "next";
var cookie = require("cookie");

const OnBoardingPage: NextPage = ({ integrations }: any) => {
  console.log("🚀 ~ file: index.tsx:7 ~ integrations:", integrations);
  return (
    <>
      <OnBoarding integrations={integrations} />
    </>
  );
};
export async function getServerSideProps({ req }: any) {
  let token = cookie?.parse(req.headers?.cookie);
  console.log(
    "🚀 ~ file: index.tsx:61 ~ getServerSideProps ~ req.headers",
    token.access_token
  );

  const { integrations } = await userAPI.getIntegrations(
    token?.access_token as string
  );
  return {
    props: {
      integrations,
    },
  };
}
export default OnBoardingPage;
