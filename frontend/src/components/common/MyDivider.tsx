const MyDivider = ({ children, ...restProps }: any) => {
  return (
    <div
      className="flex items-center justify-between border-secondary"
      {...restProps}
    >
      <div className="h-[1px] w-[45%] bg-secondary" />
      <div className="2xl:text-xl"> {children}</div>
      <div className="h-[1px] w-[45%] bg-secondary" />
    </div>
  );
};

export default MyDivider;
