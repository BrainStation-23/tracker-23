import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

import React, { useEffect, useLayoutEffect, useMemo } from "react";
import { Empty } from "antd";

am4core.addLicense("CH255140929");
am4core.useTheme(am4themes_animated);

const Line = () => {
  const id = useMemo(() => "chart-" + Math.random(), []);

  useEffect(() => {
    var chart = am4core.create(id, am4charts.XYChart);

    //

    // Increase contrast by taking evey second color
    chart.colors.step = 2;

    // Add data
    chart.data = generateChartData();

    // Create axes
    var dateAxis = chart.xAxes.push(new am4charts.DateAxis());

    dateAxis.renderer.grid.template.disabled = true;

    dateAxis.renderer.minGridDistance = 50;

    // Create series
    function createAxisAndSeries(
      field: any,
      name: any,
      opposite: any,
      bullet: any
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
      series.name = name;
      series.tooltipText = "{name}: [bold]{valueY}[/]";
      series.tensionX = 0.8;
      series.showOnInit = true;

      var interfaceColors = new am4core.InterfaceColorSet();

      valueAxis.renderer.line.strokeOpacity = 1;
      valueAxis.renderer.line.strokeWidth = 1;
      // valueAxis.renderer.line.stroke = series.stroke;
      valueAxis.renderer.grid.template.disabled = true;
      valueAxis.renderer.labels.template.disabled = true;
      // valueAxis.renderer.opposite = opposite;
    }

    createAxisAndSeries("Actual", "Actual", false, "circle");
    // createAxisAndSeries("BsCommerce", "BsCommerce", true, "triangle");
    createAxisAndSeries("Estimate", "Estimate", true, "rectangle");

    // Add legend
    chart.legend = new am4charts.Legend();

    // Add cursor
    chart.cursor = new am4charts.XYCursor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div id={id} style={{ width: "100%", height: "500px" }}></div>;
};

export default Line;
function generateChartData() {
  var chartData = [];
  var firstDate = new Date();
  firstDate.setDate(firstDate.getDate() - 100);
  firstDate.setHours(0, 0, 0, 0);

  var Actual = 8;
  var Estimate = 7;
  var BsCommerce = 8700;

  for (var i = 0; i < 7; i++) {
    // we create date objects here. In your data, you can have date strings
    // and then set format of your dates using chart.dataDateFormat property,
    // however when possible, use date objects, as this will speed up chart rendering.
    var newDate = new Date(firstDate);
    newDate.setDate(newDate.getDate() + i);

    Actual += Math.round((Math.random() < 0.5 ? 2 : -1) * Math.random());
    Estimate += Math.round((Math.random() < 0.5 ? 2 : -1) * Math.random());
    BsCommerce += Math.round(
      (Math.random() < 0.5 ? 1 : -1) * Math.random() * 10
    );

    chartData.push({
      date: newDate,
      Actual: Actual,
      Estimate: Estimate,
    });
  }
  return chartData;
}
