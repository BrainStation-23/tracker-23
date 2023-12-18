type Props = {
  children?: any;
  tab: string;
  setActiveTab?: Function;
};
const MyActiveTab = ({ children, tab, setActiveTab }: Props) => {
  return (
    <div
      key={Math.random()}
      className="flex h-fit cursor-pointer items-center gap-2 rounded-lg border-[1px] border-primary p-[11px] py-2"
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
