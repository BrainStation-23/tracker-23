import { AgGridReact, AgGridReactProps } from "@ag-grid-community/react"; // React Grid Logic
import "@ag-grid-community/styles/ag-grid.css"; // Core CSS
import "./../../assets/css/ag-grid-theme-builder.css";
import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
ModuleRegistry.registerModules([ClientSideRowModelModule]); // Theme
export const CustomTable = (props: any) => {
  return (
    <AgGridReact
      {...props}
      suppressColumnVirtualisation={true}
      suppressRowVirtualisation={true}
    />
  );
};
