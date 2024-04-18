import { Spin } from "antd";
import { userAPI } from "APIs";
import { IntegrationDto } from "models/integration";
import { useEffect, useState } from "react";
import { Roles } from "utils/constants";

import { useAppDispatch, useAppSelector } from "@/storage/redux";
import {
  deleteIntegrationsSlice,
  setIntegrationsSlice,
} from "@/storage/redux/integrationsSlice";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";
import { RootState } from "@/storage/redux/store";

import ImportSelect from "./components/importSelect";

const IntegrationsPageComponent = () => {
  const dispatch = useAppDispatch();
  const [integratedTypes, setIntegratedTypes] = useState<string[] | null>(null);
  const [integrations, setIntegrations] = useState<IntegrationDto[] | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState("");

  const userInfo = useAppSelector((state: RootState) => state.userSlice.user);

  const getIntegrations = async () => {
    setLoading(true);
    const tmp: string[] = [];
    const integrations = await userAPI.getIntegrations();
    if (integrations) {
      dispatch(setIntegrationsSlice(integrations));
      setIntegrations(integrations);
      integrations?.forEach((i: any) => {
        tmp.push(i.type);
      });
      setIntegratedTypes(tmp);
    }
    setLoading(false);
  };
  const handleUninstallIntegration = async (id: number) => {
    setLoadingTip("Uninstalling IntegrationDto");
    setLoading(true);
    const res = await userAPI.uninstallIntegration(id);
    if (res) {
      dispatch(deleteIntegrationsSlice(id));
      dispatch(resetProjectsSlice());
    }
    getIntegrations();
    setLoading(false);
    setLoadingTip("");
  };
  const handleDeleteIntegration = async (id: number) => {
    setLoadingTip("Deleting IntegrationDto");

    setLoading(true);
    const res = await userAPI.deleteIntegration(id);
    if (res) {
      dispatch(deleteIntegrationsSlice(id));
      dispatch(resetProjectsSlice());
    }
    getIntegrations();
    setLoading(false);
    setLoadingTip("");
  };

  useEffect(() => {
    getIntegrations();
  }, []);

  return (
    <div className="flex h-full w-full flex-col gap-2 px-8 pt-4">
      <div className="flex flex-col gap-4">
        <div className="flex justify-between">
          <div className="text-2xl font-bold">Select Source of Import</div>
        </div>
        <Spin spinning={loading} tip={loadingTip} className="h-full">
          {integratedTypes ? (
            <ImportSelect
              adminMode={userInfo.role === Roles.ADMIN}
              {...{
                integratedTypes,
                integrations,
                handleUninstallIntegration,
                handleDeleteIntegration,
              }}
              handleUninstallIntegration={handleUninstallIntegration}
              handleDeleteIntegration={handleDeleteIntegration}
            />
          ) : (
            <div className="h-[500px]" />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default IntegrationsPageComponent;
