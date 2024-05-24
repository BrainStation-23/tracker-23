import React, { useEffect, useRef } from "react";

import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { useMediaQuery } from "react-responsive";

const DonutChart = ({ data, total }: any) => {
  const chartRef = useRef(null);
  const isMobile = useMediaQuery({ maxWidth: 767 });

  useEffect(() => {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create(chartRef.current, am4charts.PieChart);
    chart.data = data;

    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.colors.list = [
      am4core.color("#BADF4F"),
      am4core.color("#F26956"),
      am4core.color("#FEBC6F"),
      am4core.color("#1BC5BD"),
      am4core.color("#8D99AE"),
    ];
    pieSeries.dataFields.value = "value";
    pieSeries.ticks.template.disabled = true;
    pieSeries.labels.template.disabled = true;
    pieSeries.dataFields.category = "projectName";

    if(isMobile){
      const label = chart.createChild(am4core.Label);
      label.text = `Total ${total} hours`;
      label.fontSize = 16;
      label.isMeasured = false;
      label.x = am4core.percent(50);
      label.horizontalCenter = "middle";
      label.y = 0;
    }else {
      const label = chart.seriesContainer.createChild(am4core.Label);
      label.verticalCenter = "middle";
      label.horizontalCenter = "middle";
      label.text = `Total ${total} hours`;
      label.fontSize = 20;
    }

    

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";

    const legendTemplate = chart.legend.itemContainers.template.createChild(
      am4core.Container
    );
    legendTemplate.width = am4core.percent(20);
    legendTemplate.padding(4, 4, 4, 4);
    legendTemplate.layout = "horizontal";

    chart.innerRadius = am4core.percent(55);

    return () => chart.dispose();
  }, [data, isMobile, total]);

  return <div ref={chartRef} className="w-full border-gray-200 border" style={{ height: "500px" }} />;
};

export default DonutChart;
