import Link from "next/link";

const MyLink = ({ ...restProps }: any) => {
  return (
    <Link
      className="text-xs font-medium underline 2xl:text-base"
      {...restProps}
    />
  );
};

export default MyLink;
