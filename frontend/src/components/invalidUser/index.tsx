import ALertCircleIconSvg from "@/assets/svg/ALertCircleIconSvg";
import { getLocalStorage } from "@/storage/storage";

const InvalidUserPage = () => {
  const userDetails = getLocalStorage("userDetails");
  return (
    <div className="m-auto flex h-screen w-full flex-col items-center justify-center">
      <div className=" m-auto mt-[10%] flex w-[540px] flex-col gap-4 rounded-md border-2 border-[#F26956] bg-[#FFF7F5] p-4">
        <ALertCircleIconSvg />
        <div className="flex flex-col gap-4 text-base font-medium">
          <span>
            Dear {userDetails?.firstName + " " + userDetails?.lastName},
          </span>
          <span>
            Thank you for joining the Tracker23 waitlist! Our team is working
            hard to bring our product to life and we will keep you updated on
            our progress. Thank you for being an early adopter and supporting
            us.
          </span>
          <span> Best, Tracker23 Team</span>
        </div>
      </div>
    </div>
  );
};

export default InvalidUserPage;
