// Class constants
const ANIMATION_DURATION = 500;
const MARGIN = { top: 20, right: 40, bottom: 20, left: 40 };
const LINE_CHART_WIDTH = 700 - MARGIN.left - MARGIN.right;
const LINE_CHART_HEIGHT = 500 - MARGIN.bottom - MARGIN.top;

/** Class representing the line chart visualizations.
 */
class LineChartVis {

    /**
     * Creates a Line Chart Visualzation 
     * @param globalApplicationState 
     */
    constructor(globalApplicationState, globalConstants) {
        this.globalApplicationState = globalApplicationState;
        this.globalConstants = globalConstants;
    }

    /**
     * Draws a line chart based on the provided data.
     */
    drawLineChart() {
        const data = d3.filter(this.globalApplicationState.data, d => d.country_code === this.globalApplicationState.selectedLocations[0]).sort((a, b) => new Date(a.year) - new Date(b.year));
        const lineChart = d3.select('#line-chart')
            .attr('width', LINE_CHART_WIDTH + MARGIN.left)
            .attr('height', LINE_CHART_HEIGHT + MARGIN.bottom * 2);
        const lines = lineChart.select('#lines');

        // Add the x-axis
        const xScale = this.drawXAxis(data);

        // Add the y-axis
        const yScale = this.drawYAxis(data);

        // Add the line
        const line = d3.line()
            .x(d => xScale(new Date(d.year)) + MARGIN.left * 2)
            .y(d => yScale(d.value) + MARGIN.bottom * 2);

        lines.selectAll('*').remove();
        lines.append('path')
            .datum(data)
            .attr('d', line)
            .attr('class', 'line-chart-line')
            .transition()
            .duration(ANIMATION_DURATION)
            .attrTween('stroke-dasharray', function () {
                const l = this.getTotalLength(),
                    // Returns an interpolator between the two given strings
                    i = d3.interpolateString('0,' + l, l + ',' + l); // Interpolate between 0,1 and 1,1
                // Return a function that takes a single argument 't' between 0 and 1 representing the progress of the animation
                return function (t) {
                    // Call the interpolator with the current progress of the animation
                    return i(t);
                };
            });

        // Calculate and draw the trendline
        const trendlineData = this.calculateTrendline(data, yScale);
        lines.append('path')
            .datum(trendlineData)
            .attr('d', line)
            .attr('class', 'line-chart-trendline')
            .style('opacity', 0)
            .transition()
            .duration(ANIMATION_DURATION)
            .style('opacity', 1);

        lines.selectAll('circle')
            .data(trendlineData)
            .enter()
            .append('circle')
            .attr('id', 'trendline-circle')
            .attr('cx', d => xScale(new Date(d.year)) + MARGIN.left * 2)
            .attr('cy', d => yScale(d.value) + MARGIN.bottom * 2)
            .attr('r', 2)
            .attr('fill', 'red')
            .attr('stroke', 'red');

        // Add the legend
        const lineChartLegend = d3.select('#line-chart-legend');
        lineChartLegend.selectAll('*').remove();

        lineChartLegend.append('line')
            .attr('class', 'line-chart-line')
            .attr('x1', 0)
            .attr('y1', 10)
            .attr('x2', 30)
            .attr('y2', 10);

        lineChartLegend.append('text')
            .attr('class', 'line-chart-legend-text')
            .attr('x', 40)
            .attr('y', 15)
            .attr('dy', 0)
            .text(this.globalConstants.labels[this.globalApplicationState.selectedFactor]);

        lineChartLegend.append('line')
            .attr('class', 'line-chart-trendline')
            .attr('x1', 0)
            .attr('y1', 40)
            .attr('x2', 30)
            .attr('y2', 40);

        lineChartLegend.append('text')
            .attr('class', 'line-chart-legend-text')
            .attr('x', 40)
            .attr('y', 45)
            .attr('dy', 0)
            .text('Trendline');

        // Timeout is needed to ensure the text is wrapped after it is rendered
        setTimeout(function () {
            d3.selectAll('.line-chart-legend-text').call(wrapText, 125);
        }, 0);

        // Wraps the text in the legend
        function wrapText(text, width) {
            // Split the text into words
            text.each(function () {
                var text = d3.select(this),
                    words = text.text().split(/\s+/).reverse(),
                    word,
                    line = [],
                    lineNumber = 0,
                    lineHeight = 1.1, // ems
                    y = text.attr('y'),
                    dy = parseFloat(text.attr('dy')),
                    tspan = text.text(null).append('tspan').attr('x', 40).attr('y', y).attr('dy', dy + 'em');

                // Add words to the line until the width is exceeded
                while (word = words.pop()) {
                    line.push(word);
                    tspan.text(line.join(' '));

                    // If the width is exceeded, remove the last word and append a new tspan
                    if (tspan.node().getComputedTextLength() > width) {
                        line.pop();
                        tspan.text(line.join(' '));
                        line = [word];
                        tspan = text.append('tspan').attr('x', 40).attr('y', y).attr('dy', ++lineNumber * lineHeight + dy + 'em').text(word);
                    }
                }
            });
        }
    }


    /**
     * Calculates the trendline data for a line chart.
     * 
     * @param {Array} data - The data array containing objects with year and value properties.
     * @param {Object} yScale - The y-axis scale object.
     * @returns {Array} - The trendline data array containing objects with year and value properties.
     */
    calculateTrendline(data, yScale) {
        let xSum = 0, ySum = 0, xySum = 0, xxSum = 0;
        const n = data.length;

        // Calculate the sums of x, y, x*y, and x*x
        data.forEach(d => {
            const x = new Date(d.year).getTime();
            const y = +d.value;
            xSum += x;
            ySum += y;
            xySum += x * y;
            xxSum += x * x;
        });

        // Calculate the mean x and y values
        const xMean = xSum / n;
        const yMean = ySum / n;

        // Calculate slope (m) and y-intercept (b) for y = mx + b
        const slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        const intercept = yMean - slope * xMean;

        // Adjust start and end points to be within the y-axis scale range
        const startY = Math.max(slope * new Date(data[0].year).getTime() + intercept, yScale.domain()[0]);
        const endY = Math.max(slope * new Date(data[data.length - 1].year).getTime() + intercept, yScale.domain()[0]);

        // Create the trendline data array
        const trendlineData = [
            { year: data[0].year, value: startY },
            { year: data[data.length - 1].year, value: endY }
        ];

        return trendlineData;
    }


    /**
     * Draws the x-axis for the line chart.
     * 
     * @param {Array} data - The data used to determine the domain of the x-axis scale.
     * @returns {Function} - The x-axis scale function.
     */
    drawXAxis(data) {
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.year)))
            .range([0, LINE_CHART_WIDTH - MARGIN.left - MARGIN.right]);

        const xAxis = d3.select('#x-axis')
            .attr('transform', `translate(${MARGIN.left * 2}, ${LINE_CHART_HEIGHT})`)
            .call(d3.axisBottom(xScale));

        // Add the x-axis label
        xAxis.append('text')
            .attr('class', 'axis-label')
            .attr('x', LINE_CHART_WIDTH / 2 - MARGIN.left)
            .attr('y', MARGIN.bottom * 2)
            .text('Year');
        return xScale;
    }


    /**
     * Draws the y-axis for the line chart.
     * 
     * @param {Array} data - The data used to determine the y-axis scale.
     * @returns {Function} - The y-axis scale function.
     */
    drawYAxis(data) {
        let format;

        if (this.globalApplicationState.selectedFactor === 'temperature') {
            format = d3.format('.1f');
        } else {
            format = d3.format('.2s');
        }

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d.value)).sort(d3.ascending))
            .range([LINE_CHART_HEIGHT - MARGIN.bottom - MARGIN.top, 0]).nice();

        const yAxis = d3.select('#y-axis')
            .attr('transform', `translate(${MARGIN.left * 2}, ${MARGIN.bottom * 2})`)
            .call(d3.axisLeft(yScale).tickFormat(format));

        // Add the y-axis label
        const yAxisLabel = yAxis.select('#y-axis-label')
            .attr('x', -LINE_CHART_HEIGHT / 2 + MARGIN.bottom)
            .attr('y', -MARGIN.left - MARGIN.left / 2);
        const factor = d3.select('#modal-title');
        const selectedFactor = this.globalApplicationState.selectedFactor;
        const title = this.globalConstants.titles[selectedFactor] + ' in ' + data[0].country_name;

        factor.text(title); // Update the title
        yAxisLabel.text(this.globalConstants.labels[selectedFactor])
        return yScale;
    }
}