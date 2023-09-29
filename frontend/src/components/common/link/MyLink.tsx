import Link from "next/link";

const MyLink = ({ ...restProps }: any) => {
  return (
    <Link
      className="text-xs font-medium underline hover:text-primary hover:underline 2xl:text-base"
      {...restProps}
    />
  );
};

export default MyLink;
