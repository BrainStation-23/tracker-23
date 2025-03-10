type Props = {
  children?: any;
  tab: string;
  setActiveTab?: Function;
};
const MyInactiveTab = ({ children, tab, setActiveTab }: Props) => {
  return (
    <div
      key={Math.random()}
      className="flex h-fit cursor-pointer items-center gap-2 rounded-lg border-[1px] border-secondary py-1 px-2"
      onClick={() => setActiveTab(tab)}
    >
      {children && (
        <div className="rounded bg-third px-1 text-xs font-medium text-primary">
          {children}
        </div>
      )}
      <div className="w-max text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );
};

export default MyInactiveTab;
