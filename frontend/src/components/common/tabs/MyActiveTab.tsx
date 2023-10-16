type Props = {
  children: any;
  tab: string;
  setActiveTab?: Function;
};
const MyActiveTab = ({ children, tab, setActiveTab }: Props) => {
  return (
    <div
      key={Math.random()}
      className="flex cursor-pointer items-center gap-2 h-fit rounded-lg border-[1px] border-primary p-[11px] py-2"
    >
      <div className="rounded bg-primary px-1 text-xs font-medium text-white">
        {children}
      </div>
      <div className="text-[15px]">{tab}</div>
    </div>
  );
};

export default MyActiveTab;
