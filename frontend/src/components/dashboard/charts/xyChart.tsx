import { useEffect } from "react";

import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";
import { useMediaQuery } from "react-responsive";

export default function XYChart({ data }: any) {
  const isMobile = useMediaQuery({ maxWidth: 767 });
  useEffect(() => {
    am4core.useTheme(am4themes_animated);
    const chart = am4core.create("chartDiv", am4charts.XYChart);
    chart.data = data;
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "day";
    categoryAxis.renderer.grid.template.location = null;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;

    categoryAxis.renderer.labels.template.adapter.add("dy", (dy: any) => {
      return dy;
    });

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.min = 0;
    valueAxis.renderer.minGridDistance = 50;
    valueAxis.renderer.labels.template.fontSize = 16; // set font size
    valueAxis.renderer.labels.template.fontWeight = "500"; // set font weight
    valueAxis.renderer.grid.template.strokeDasharray = "3,3";

    const series = chart.series.push(new am4charts.ColumnSeries());
    series.name = "hours";
    series.dataFields.valueY = "hours";
    series.dataFields.categoryX = "day";
    series.columns.template.fillOpacity = 1;
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";

    const columnTemplate = series.columns.template;
    columnTemplate.width = isMobile ? 30 : 100;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    //@ts-ignore
    columnTemplate.fill = "#00A3DE";

    // Clean up
    return () => chart.dispose();
  }, [data]);

  return <div id="chartDiv" style={{ width: "100%", height: "500px" }}></div>;
}
