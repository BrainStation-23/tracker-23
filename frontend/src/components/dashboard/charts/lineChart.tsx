import React, { useEffect, useMemo, useState } from "react";

import * as am4charts from "@amcharts/amcharts4/charts";
import * as am4core from "@amcharts/amcharts4/core";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

am4core.addLicense("CH255140929");
am4core.useTheme(am4themes_animated);

const Line = ({ data }: any) => {
  const id = useMemo(() => "chart-" + Math.random(), []);
  const [chartData, setChartData] = useState(null);
  useEffect(() => {
    setChartData(data);
  }, []);

  useEffect(() => {
    var chart = am4core.create(id, am4charts.XYChart);
    chart.paddingLeft = -10;
    //

    // Increase contrast by taking evey second color
    chart.colors.step = 2;

    // Add data
    // chart.data = generateChartData();
    chart.data = chartData;

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());
    dateAxis.renderer.grid.template.disabled = true;

    dateAxis.renderer.minGridDistance = 50;

    // Create series
    function createAxisAndSeries(
      field: any,
      name: any,
      opposite: any,
      bullet: any,
      color: any
    ) {
      var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
      if (chart.yAxes.indexOf(valueAxis) != 0) {
        // @ts-ignore
        valueAxis.syncWithAxis = chart.yAxes.getIndex(0);
      }
      var series = chart.series.push(new am4charts.LineSeries());
      series.dataFields.valueY = field;
      series.dataFields.dateX = "date";
      series.strokeWidth = 2;
      series.yAxis = valueAxis;
      series.stroke = color;
      series.name = name;
      series.tooltipText = "{name}: [bold]{valueY}[/]";
      series.tensionX = 0.8;
      series.showOnInit = true;

      valueAxis.renderer.line.strokeOpacity = 1;
      valueAxis.renderer.line.strokeWidth = 1;
      valueAxis.renderer.line.disabled = true;
      valueAxis.renderer.grid.template.disabled = true;
      valueAxis.renderer.labels.template.disabled = true;

      valueAxis.renderer.labels.template.disabled = false; // enable labels
      valueAxis.renderer.labels.template.fontSize = 16; // set font size
      valueAxis.renderer.labels.template.fontWeight = "500"; // set font weight
      if (chart.series.indexOf(series) != 0) {
        valueAxis.renderer.labels.template.disabled = true;
        // @ts-ignore
        valueAxis.syncWithAxis = chart.yAxes.getIndex(0);
      } else {
        valueAxis.renderer.grid.template.disabled = false;
        valueAxis.renderer.grid.template.strokeDasharray = "3,3";
        valueAxis.renderer.minGridDistance = 50;
        valueAxis.min = 0;
      }
    }

    createAxisAndSeries("Actual", "Actual", false, "circle", "#FEBC6F");
    createAxisAndSeries("Estimate", "Estimate", false, "rectangle", "#F26956");

    // Add legend
    chart.legend = new am4charts.Legend();

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    // Clean up
    return () => {
      chart.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  });
  return <div id={id} style={{ width: "100%", height: "500px" }}></div>;
};

export default Line;
