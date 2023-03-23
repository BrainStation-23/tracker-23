import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const DonutChart = ({ data }: any) => {
  const chartRef = useRef(null);

  useEffect(() => {
    am4core.useTheme(am4themes_animated);

    const chart = am4core.create(chartRef.current, am4charts.PieChart);

    // chart.logo.disabled = true;
    chart.data = data;

    const pieSeries = chart.series.push(new am4charts.PieSeries());
    pieSeries.dataFields.value = "value";
    pieSeries.dataFields.category = "category";
    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;
    const label = chart.seriesContainer.createChild(am4core.Label);
    label.text = "Total : 40 hrs";
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.fontSize = 20;

    // chart.series.push(new am4charts.PieSeries());
    // const series2 = chart.series.push(new am4charts.PieSeries());
    // series2.dataFields.value = "value";
    // series2.dataFields.category = "category";
    // series2.slices.template.stroke = am4core.color("#fff");
    // series2.slices.template.strokeWidth = 2;
    // series2.slices.template.strokeOpacity = 1;
    // series2.slices.template.propertyFields.fill = "color";
    // series2.slices.template.propertyFields.isActive = "pulled";
    // series2.slices.template.propertyFields.fillOpacity = "opacity";
    // series2.hiddenState.properties.startAngle = -90;
    // series2.hiddenState.properties.endAngle = 270;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "right";

    chart.innerRadius = am4core.percent(40);

    // chart.chartContainer.zoomable = false;

    return () => {
      chart.dispose();
    };
  }, [data]);

  return <div ref={chartRef} style={{ width: "100%", height: "500px" }}></div>;
};

export default DonutChart;
