type Props = {
  children: any;
  tab: string;
  setActiveTab?: Function;
};
const MyInactiveTab = ({ children, tab, setActiveTab }: Props) => {
  return (
    <div
      key={Math.random()}
      className="flex h-fit cursor-pointer items-center gap-2 rounded-lg border-[1px] border-secondary p-[11px]"
      onClick={() => setActiveTab(tab)}
    >
      <div
        className="px-1 text-xs font-medium text-white"
        style={{
          background: "#E7E7E7",
          borderRadius: "4px",
          color: "black",
        }}
      >
        {children}
      </div>
      <div className="text-[15px] text-[#4D4E55]">{tab}</div>
    </div>
  );
};

export default MyInactiveTab;
