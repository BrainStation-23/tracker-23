import { useEffect } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

export default function XYChart({ data }: any) {
  useEffect(() => {
    // Themes begin
    am4core.useTheme(am4themes_animated);
    // Themes end

    // Create chart instance
    const chart = am4core.create("chartDiv", am4charts.XYChart);
    // chart.logo.disabled = true;

    // Add data
    chart.data = data;

    // Create axes
    const categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "day";
    categoryAxis.renderer.grid.template.location = null;
    categoryAxis.renderer.grid.template.strokeOpacity = 0;
    // categoryAxis.renderer.minGridDistance = 30;

    categoryAxis.renderer.labels.template.adapter.add(
      "dy",
      (dy: any, target) => {
        return dy;
      }
    );

    const valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.labels.template.fontSize = 16; // set font size
    valueAxis.renderer.labels.template.fontWeight = "500"; // set font weight

    valueAxis.renderer.grid.template.strokeDasharray = "3,3";
    valueAxis.renderer.minGridDistance = 50;
    valueAxis.min = 0;
    // Create series
    const series = chart.series.push(new am4charts.ColumnSeries());
    series.dataFields.valueY = "hours";
    series.dataFields.categoryX = "day";
    series.name = "hours";
    series.columns.template.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.fillOpacity = 1;

    const columnTemplate = series.columns.template;
    columnTemplate.strokeWidth = 2;
    columnTemplate.strokeOpacity = 1;
    columnTemplate.width = 19;
    //@ts-ignore
    columnTemplate.fill = "#00A3DE";

    // Clean up
    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div id="chartDiv" style={{ width: "90%", height: "500px" }}></div>;
}
