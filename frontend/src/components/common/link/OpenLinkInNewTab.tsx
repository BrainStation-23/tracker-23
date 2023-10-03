const OpenLinkInNewTab = ({ children, ...restProps }: any) => {
  return (
    <span className="cursor-pointer font-medium underline" {...restProps}>
      {children}
    </span>
  );
};

export default OpenLinkInNewTab;
