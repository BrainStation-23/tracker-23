import BSLogoWhiteSvg from "@/assets/svg/BSLogoWhiteSvg";

const SideBanner = () => {
  return (
    <div className="relative h-screen">
      <img className="h-screen" src="assets/images/bannerImage.png"></img>
      <div className="absolute top-[30px] left-[56px]">
        <BSLogoWhiteSvg />
      </div>
      <div className="font-bold absolute bottom-[30px] left-[32px] text-xl text-white">
        Brain Station 23 | Talent @ Your Service
      </div>
    </div>
  );
};

export default SideBanner;
