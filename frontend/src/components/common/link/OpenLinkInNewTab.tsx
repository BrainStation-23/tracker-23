const OpenLinkInNewTab = ({ children, ...restProps }: any) => {
  return (
    <span
      className="cursor-pointer whitespace-normal break-all font-medium underline"
      {...restProps}
    >
      {children}
    </span>
  );
};

export default OpenLinkInNewTab;
