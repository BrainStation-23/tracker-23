import AuthPageLeftPanelLeftPicture from "@/assets/svg/AuthPageLeftPanelLeftPicture";
import AuthPageLeftPanelMiddlePicture from "@/assets/svg/AuthPageLeftPanelMiddlePicture";

const LeftPanelTopPictureOnboarding = () => {
  return (
    <div className="relative w-min">
      <div className="flex justify-center">
        <AuthPageLeftPanelMiddlePicture className="h-max w-max pl-5" />
      </div>
      <div className="absolute top-[-45px] left-[-30px] w-2">
        <AuthPageLeftPanelLeftPicture />
      </div>
    </div>
  );
};

export default LeftPanelTopPictureOnboarding;
