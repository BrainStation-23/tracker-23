import { Input } from "antd";
import { useState, useEffect } from "react";
import SearchResults from "./searchResults";
import { toast } from "react-toastify";

const { Search } = Input;
const OnBoarding = ({ integrations }: any) => {
  const [searchText, setSearchText] = useState("");
  
  const [status, setStatus] = useState<"" | "error" | "warning">("");
  const handleOnchange = (text: string) => {
    if (status.length > 0 && text.length > 0) setStatus("");
    setSearchText(text);
  };
  const handleEnter = () => {
    if (searchText.length < 1) {
      toast.error("Input text to Search");
      setStatus("error");
    }
  };
  useEffect(() => {}, [integrations]);
  return (
    <>
      <Search
        placeholder="Search Tasks"
        enterButton="Search"
        size="large"
        status={status}
        required
        onChange={(e) => handleOnchange(e.target.value)}
        className="bg-blue-400 hover:bg-blue-500 rounded-lg"
        loading={false}
        allowClear
        onSearch={handleEnter}
        onPressEnter={handleEnter}
      />
      {integrations && (
        <div>
          {integrations?.map((integration: any) => {
            <div key={integration.id}>dsds{integration.type}</div>;
          })}
        </div>
      )}
      <SearchResults searchText={searchText} />
    </>
  );
};

export default OnBoarding;
