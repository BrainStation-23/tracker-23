type Props = {
  title: string;
  subTitle?: string;
};
const AuthHeader = ({ title, subTitle }: Props) => {
  return (
    <div className="flex flex-col gap-2 text-left">
      <h2 className="text-3xl font-semibold md:text-4xl">{title}</h2>
      <p className="text-base font-normal">{subTitle}</p>
    </div>
  );
};

export default AuthHeader;
