import PieChart from "@/components/dashboard/charts/pieChart";
import XYChart from "@/components/dashboard/charts/xyChart";
import MyTasks from "@/components/dashboard/myTasks";

const DashBoard = () => {
  const data = [
    { category: "Frontend", value: 20 },
    { category: "Misc", value: 25 },
    { category: "Testing", value: 15 },
    { category: "UI", value: 10 },
    { category: "Backend", value: 30 },
  ];
  const data2 = [
    { day: 1, hours: 3 },
    { day: 2, hours: 8 },
    { day: 3, hours: 1 },
    { day: 4, hours: 7 },
    { day: 5, hours: 4 },
    { day: 6, hours: 0 },
    { day: 7, hours: 5 },
    { day: 8, hours: 7 },
    { day: 9, hours: 2 },
    { day: 10, hours: 8 },
    { day: 11, hours: 2 },
    { day: 12, hours: 5 },
    { day: 13, hours: 1 },
    { day: 14, hours: 8 },
    { day: 15, hours: 0 },
    { day: 16, hours: 3 },
    { day: 17, hours: 5 },
    { day: 18, hours: 8 },
    { day: 19, hours: 1 },
    { day: 20, hours: 6 },
    { day: 21, hours: 2 },
    { day: 22, hours: 3 },
    { day: 23, hours: 4 },
    { day: 24, hours: 8 },
    { day: 25, hours: 3 },
    { day: 26, hours: 0 },
    { day: 27, hours: 4 },
    { day: 28, hours: 7 },
    { day: 29, hours: 1 },
    { day: 30, hours: 5 },
  ];
  return (
    <>
      <div>
        <h1>Monthly Work Chart</h1>
        <XYChart data={data2} />
      </div>
      <PieChart data={data} title="Work Distribution" />
      <div> Dash Board</div>
      <MyTasks />
    </>
  );
};

export default DashBoard;
