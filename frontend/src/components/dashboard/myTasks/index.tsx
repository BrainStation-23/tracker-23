import { Tabs } from "antd";
import ToDoComponent from "./todo";
const { TabPane } = Tabs;
const MyTasks = () => {
  const tabs = [
    { title: "To do", children: <ToDoComponent /> },
    { title: " Comments" },
    { title: "Done" },
    { title: "Delegated" },
  ];
  return (
    <div className="flex flex-col gap-4">
      <div className="font-bold mt-4"> My Work</div>
      <div className="border-2 rounded-xl">
        <Tabs
          defaultActiveKey="1"
          type="card"
          size={"small"}
          tabBarGutter={10}
          className="border-b-2 border-transparent"
          items={tabs.map((tab, i) => {
            const id = String(i + 1);
            return {
              label: tab.title,
              key: id,
              children: tab.children
                ? tab.children
                : `Content of card tab ${id}`,
            };
          })}
          tabBarStyle={{
            paddingLeft: "10px",
            borderBottom: "2px solid transparent",
          }}
        ></Tabs>
      </div>
    </div>
  );
};

export default MyTasks;
