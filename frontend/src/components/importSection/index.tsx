import { Spin } from "antd";
import { userAPI } from "APIs";
import { Integration } from "models/integration";
import { useEffect, useState } from "react";

import ImportSelect from "./importSelect";
import { useAppDispatch, useAppSelector } from "@/storage/redux";
import {
  deleteIntegrationsSlice,
  setIntegrationsSlice,
} from "@/storage/redux/integrationsSlice";
import { resetProjectsSlice } from "@/storage/redux/projectsSlice";

const ImportSection = () => {
  const dispatch = useAppDispatch();
  const [integratedTypes, setIntegratedTypes] = useState<string[] | null>(null);
  const [integrations, setIntegrations] = useState<Integration[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadingTip, setLoadingTip] = useState("");
  const getIntegrations = async () => {
    setLoading(true);
    const tmp: string[] = [];
    const integrations = await userAPI.getIntegrations();
    console.log(
      "🚀 ~ file: index.tsx:29 ~ getIntegrations ~ integrations:",
      integrations
    );
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
  const handleDeleteIntegration = async (id: number) => {
    setLoadingTip("Deleting Integration");
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-col gap-2">
        <div className="text-2xl font-semibold">Select Source of Import</div>
        <Spin spinning={loading} tip={loadingTip} className="h-full">
          {integratedTypes && (
            <ImportSelect
              {...{ integratedTypes, integrations, handleDeleteIntegration }}
            />
          )}
        </Spin>
      </div>
    </div>
  );
};

export default ImportSection;
