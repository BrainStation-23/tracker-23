import Icon from "@ant-design/icons";
import { Card, Image } from "antd";
import SvgIcons from "public/assets/icons";
// import { SubtaskIcon } from "public/assets/icons";
import { useEffect, useState } from "react";
const SearchResults = ({ searchText }: any) => {
  const [tasks, setTasks] = useState<number[]>([]);

  useEffect(() => {
    const tmp: number[] = [];
    for (let index = 0; index < 10; index++) {
      tmp.push(index);
    }
    setTasks(tmp);
  }, []);

  return (
    <div className="mt-1 flex flex-col gap-2 pl-2">
      {tasks.length > 0 &&
        tasks.map((task: any) => (
          <div
            className="flex items-center gap-4 rounded border-2 p-1 hover:border-emerald-500"
            key={task}
          >
            <Icon component={SvgIcons["storyIcon"]} className="p-2" alt="noo" />
            <div>
              <div className="flex gap-3">
                <div> OV-{task}</div>
                <div> Frontend - Task Create UI</div>
              </div>
              <div className="flex gap-2 text-sm">
                <div> Project: OV-{task}</div>
                <div> Status: In Progress</div>
              </div>
            </div>
          </div>
        ))}
    </div>
  );
};

export default SearchResults;
