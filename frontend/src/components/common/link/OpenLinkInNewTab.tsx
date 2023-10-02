const OpenLinkInNewTab = ({ children, ...restProps }: any) => {
  return (
    <span className="font-medium underline" {...restProps}>
      {children}
    </span>
  );
};

export default OpenLinkInNewTab;
