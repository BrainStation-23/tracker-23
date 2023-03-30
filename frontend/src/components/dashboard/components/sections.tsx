type Props = { children: any; title: string };
const DashBoardSection = ({ children, title }: Props) => {
  return (
    <>
      <div className="relative flex flex-col gap-2">
        <div className="flex items-center gap-3">
          <div className="text-2xl font-semibold ">{title}</div>
          {/* <div className=" rounded-lg border-2 p-1 px-2 text-sm">This Week</div> */}
        </div>
        <div>{children}</div>
      </div>
    </>
  );
};

export default DashBoardSection;
