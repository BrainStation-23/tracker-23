import { Collapse } from "antd";

const ToDoComponent = () => {
  const components = [
    {
      title: "Today",
      children: <></>,
    },
    {
      title: "Overdue",
      children: <></>,
    },
    {
      title: "Next",
      children: <></>,
    },
    {
      title: "Unscheduled",
      children: <></>,
    },
  ];

  return (
    <>
      {components.map((component) => (
        <Sections title={component.title} key={Math.random()}>
          {component.children}
        </Sections>
      ))}
    </>
  );
};

const Sections = ({ title, Children }: any) => {
  const { Panel } = Collapse;
  return (
    <Collapse className="m-1">
      <Panel header={title} key="1">
        {Children}
      </Panel>
    </Collapse>
  );
};
export default ToDoComponent;
