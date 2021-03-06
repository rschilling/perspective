/******************************************************************************
 *
 * Copyright (c) 2017, the Perspective Authors.
 *
 * This file is part of the Perspective library, distributed under the terms of
 * the Apache License 2.0.  The full license can be found in the LICENSE file.
 *
 */
import * as fc from "d3fc";
import * as crossAxis from "../axis/crossAxis";
import * as mainAxis from "../axis/mainAxis";
import {barSeries} from "../series/barSeries";
import {seriesColors} from "../series/seriesColors";
import {groupAndStackData} from "../data/groupData";
import {colorLegend} from "../legend/legend";
import {filterData} from "../legend/filter";
import {withGridLines} from "../gridlines/gridlines";
import {hardLimitZeroPadding} from "../d3fc/padding/hardLimitZero";
import zoomableChart from "../zoom/zoomableChart";

function columnChart(container, settings) {
    const data = groupAndStackData(settings, filterData(settings));
    const color = seriesColors(settings);

    const legend = colorLegend()
        .settings(settings)
        .scale(color);

    const series = fc
        .seriesSvgMulti()
        .mapping((data, index) => data[index])
        .series(
            data.map(() =>
                barSeries(settings, color)
                    .align("left")
                    .orient("vertical")
            )
        );

    const xDomain = crossAxis.domain(settings)(data);
    const xScale = crossAxis.scale(settings);
    const xAxis = crossAxis.axisFactory(settings).domain(xDomain)();

    const chart = fc
        .chartSvgCartesian({
            xScale,
            yScale: mainAxis.scale(settings),
            xAxis
        })
        .xDomain(xDomain)
        .xLabel(crossAxis.label(settings))
        .xAxisHeight(xAxis.size)
        .xDecorate(xAxis.decorate)
        .yDomain(
            mainAxis
                .domain(settings)
                .include([0])
                .paddingStrategy(hardLimitZeroPadding())(data)
        )
        .yLabel(mainAxis.label(settings))
        .yOrient("left")
        .yNice()
        .plotArea(withGridLines(series).orient("vertical"));

    chart.xPaddingInner && chart.xPaddingInner(0.5);
    chart.xPaddingOuter && chart.xPaddingOuter(0.25);

    const zoomChart = zoomableChart()
        .chart(chart)
        .settings(settings)
        .xScale(xScale);

    // render
    container.datum(data).call(zoomChart);
    container.call(legend);
}
columnChart.plugin = {
    type: "d3_y_bar",
    name: "[d3fc] Y Bar Chart",
    max_size: 25000
};

export default columnChart;
