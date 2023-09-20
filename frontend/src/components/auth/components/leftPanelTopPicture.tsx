import AuthPageLeftPanelLeftPicture from "@/assets/svg/AuthPageLeftPanelLeftPicture";
import AuthPageLeftPanelMiddlePicture from "@/assets/svg/AuthPageLeftPanelMiddlePicture";
import AuthPageLeftPanelRightPicture from "@/assets/svg/AuthPageLeftPanelRightPicture";

const LeftPanelTopPicture = () => {
  return (
    <div className="relative w-full">
      <div className="mt-10 flex scale-[80%] justify-center xl:mt-14 xl:scale-100 2xl:mt-16 2xl:scale-[120%]">
        <AuthPageLeftPanelMiddlePicture className="" />
      </div>
      <div className="absolute left-[-3%]  top-5 scale-[80%] xl:left-[0%] xl:top-4 xl:scale-100 2xl:scale-110">
        <AuthPageLeftPanelLeftPicture />
      </div>
      <div className="absolute right-[-8%] top-0 flex scale-[80%] justify-end xl:right-[-4%] xl:scale-100 2xl:right-[2%] 2xl:scale-110">
        <AuthPageLeftPanelRightPicture />
      </div>
    </div>
  );
};

export default LeftPanelTopPicture;
