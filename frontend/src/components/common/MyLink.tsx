import Link from "next/link";

const MyLink = ({ ...restProps }: any) => {
  return (
    <Link
      className="text-xs font-medium underline  hover:text-[#070eff] 2xl:text-lg"
      {...restProps}
    />
  );
};

export default MyLink;
