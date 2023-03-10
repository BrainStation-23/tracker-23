import ImportCard from "./importCard";

const IntegratedServices = ({ data }: any) => {
  return (
    <div className="w-full flex flex-col gap-2">
      <div className="mx-auto">Imported</div>
      <div className="p-4 border-2 rounded flex gap-4">
        {data.map((d: any) => (
          <ImportCard
            key={Math.random()}
            data={d}
            selected={d.title}
            setSelected={() => {}}
          />
        ))}
      </div>
    </div>
  );
};

export default IntegratedServices;
