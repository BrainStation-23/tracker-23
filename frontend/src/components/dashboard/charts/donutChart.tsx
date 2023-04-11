import React, { useEffect, useRef } from "react";
import * as am4core from "@amcharts/amcharts4/core";
import * as am4charts from "@amcharts/amcharts4/charts";
import am4themes_animated from "@amcharts/amcharts4/themes/animated";

const DonutChart = ({ data, total }: any) => {
  const chartRef = useRef(null);

  useEffect(() => {
    am4core.useTheme(am4themes_animated);

    const chart = am4core.create(chartRef.current, am4charts.PieChart);

    // chart.logo.disabled = true;
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
    pieSeries.dataFields.category = "projectName";
    pieSeries.labels.template.disabled = true;
    pieSeries.ticks.template.disabled = true;
    const label = chart.seriesContainer.createChild(am4core.Label);
    label.text = `Total ${total} hours`;
    label.horizontalCenter = "middle";
    label.verticalCenter = "middle";
    label.fontSize = 20;

    // chart.series.push(new am4charts.PieSeries());
    // const series2 = chart.series.push(new am4charts.PieSeries());
    // series2.dataFields.value = "value";
    // series2.dataFields.projectName = "projectName";
    // series2.slices.template.stroke = am4core.color("#fff");
    // series2.slices.template.strokeWidth = 2;
    // series2.slices.template.strokeOpacity = 1;
    // series2.slices.template.propertyFields.fill = "color";
    // series2.slices.template.propertyFields.isActive = "pulled";
    // series2.slices.template.propertyFields.fillOpacity = "opacity";
    // series2.hiddenState.properties.startAngle = -90;
    // series2.hiddenState.properties.endAngle = 270;

    chart.legend = new am4charts.Legend();
    chart.legend.position = "bottom";
    const legendTemplate = chart.legend.itemContainers.template.createChild(
      am4core.Container
    );
    legendTemplate.width = am4core.percent(20);
    legendTemplate.padding(4, 4, 4, 4);
    legendTemplate.layout = "horizontal";
    chart.innerRadius = am4core.percent(55);

    // chart.chartContainer.zoomable = false;

    return () => {
      chart.dispose();
    };
  }, [data, total]);

  return (
    <div ref={chartRef} className="w-3/4" style={{ height: "500px" }}></div>
  );
};

export default DonutChart;
