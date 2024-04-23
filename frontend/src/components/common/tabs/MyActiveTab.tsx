type Props = {
  tab: string;
  children?: any;
  setActiveTab?: Function;
};
const MyActiveTab = ({ children, tab }: Props) => {
  return (
    <div
      key={tab}
      className="flex h-fit cursor-pointer items-center gap-2 rounded-lg border-[1px] border-primary px-2 py-1"
    >
      {children && (
        <div className="rounded bg-primary px-1 text-xs font-medium text-white">
          {children}
        </div>
      )}
      <div
        className={`w-max text-[15px] text-[#4D4E55] ${
          children ? "" : "font-bold"
        }`}
      >
        {tab}
      </div>
    </div>
  );
};

export default MyActiveTab;
