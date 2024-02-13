import React from "react";

import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.useTheme(am4themes_animated);

type PieChartData = {
  category: string;
  value: number;
};

type Props = {
  data: PieChartData[];
  title?: string;
};

const PieChart: React.FC<Props> = ({ data, title }) => {
  const chartRef = React.useRef(null);

  React.useEffect(() => {
    const chart = am4core.create(chartRef.current!, am4charts.PieChart);

    chart.data = data;

    const series = chart.series.push(new am4charts.PieSeries());
    series.dataFields.value = "value";
    series.dataFields.category = "category";
    series.slices.template.stroke = am4core.color("#fff");
    series.slices.template.strokeWidth = 2;
    series.slices.template.strokeOpacity = 1;

    return () => {
      chart.dispose();
    };
  }, [data]);

  return (
    <div className="w-full">
      {title && <h2 className="text-lg font-bold">{title}</h2>}
      <div ref={chartRef} className="h-[450px] w-5/6" />
    </div>
  );
};

export default PieChart;
