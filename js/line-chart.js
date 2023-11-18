/** Class representing the line chart visualizations.
 */

class LineChartVis {

    /**
     * Creates a Line Chart Visualzation 
     * @param globalApplicationState 
     */
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        this.margin = { top: 20, right: 40, bottom: 20, left: 40 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 500 - this.margin.bottom - this.margin.top;

        this.lineChart = d3.select('#line-chart')
            .attr('width', this.width + this.margin.left)
            .attr('height', this.height + this.margin.bottom * 2);
        // this.ANIMATION_DUATION = 3000;
    }

    drawLineChart() {
        const data = d3.filter(this.globalApplicationState.Data, d => d.country_code === this.globalApplicationState.selectedLocations[0]);


        // Add global average temperature to bring it to actual temperature
        // if (this.globalApplicationState.selectedFactor === 'temperature') {
        //     for (let d of data) {
        //         d.value = parseFloat(d.value) + 14.0;
        //     }
        // }

        const lines = this.lineChart.select('#lines');

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.year)))
            .range([0, this.width - this.margin.left - this.margin.right]);

        const xAxis = d3.select('#x-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.height})`)
            .call(d3.axisBottom(xScale));

        xAxis.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.width / 2 - this.margin.left)
            .attr('y', this.margin.bottom * 2)
            .text('Year');

        console.log(d3.extent(data, d => parseFloat(d.value)));

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d.value)).sort(d3.ascending))
            .range([this.height - this.margin.bottom - this.margin.top, 0]).nice();

        const yAxis = d3.select('#y-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.bottom * 2})`)
            .call(d3.axisLeft(yScale));

        const yAxisLabel = yAxis.select('#y-axis-label')
            .attr('x', -this.height / 2 + this.margin.bottom)
            .attr('y', -this.margin.left - this.margin.left / 2);

        const factor = d3.select('#factor');
        const selectedFactor = this.globalApplicationState.selectedFactor;
        if (selectedFactor === 'co2') {
            factor.text('Annual CO2 Emissions');
            yAxisLabel.text('CO2e')
        } else if (selectedFactor === 'methane') {
            factor.text('Methane Emissions');
            yAxisLabel.text('Mte')
        } else if (selectedFactor === 'deforestation') {
            factor.text('Net Forest Area');
            yAxisLabel.text('Mha')
        } else if (selectedFactor === 'temperature') {
            factor.text('Average Temperature Anomaly');
            yAxisLabel.text('°C')
        }

        const line = d3.line()
            .x(d => xScale(new Date(d.year)) + this.margin.left * 2)
            .y(d => yScale(d.value) + this.margin.bottom * 2);

        lines.selectAll('*').remove();
        lines.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)

            // Experimenting with animation

            // .transition()
            // .duration(this.ANIMATION_DUATION)
            // .attrTween('stroke-dasharray', function () {
            //     const l = this.getTotalLength(),
            //         // Returns an interpolator between the two given strings
            //         i = d3.interpolateString('0,' + l, l + ',' + l); // Interpolate between 0,1 and 1,1
            //     // Return a function that takes a single argument 't' between 0 and 1 representing the progress of the animation
            //     return function (t) {
            //         // Call the interpolator with the current progress of the animation
            //         return i(t);
            //     };
            // })
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('style', 'opacity: 1');

        // // Code for trendline
        // let xSum = 0, ySum = 0, xySum = 0, xxSum = 0;
        // for (let d of data) {
        //     let x = +d.year;
        //     let y = +d.value;
        //     xSum += x;
        //     ySum += y;
        //     xySum += x * y;
        //     xxSum += x * x;
        // }
        // let n = data.length;
        // let xMean = xSum / n;
        // let yMean = ySum / n;
        // let slope = (n * xySum - xSum * ySum) / (n * xxSum - xSum * xSum);
        // let intercept = yMean - slope * xMean;

        // let trendline = d3.line()
        //     .x(d => xScale(new Date(+d.year)))
        //     .y(d => yScale(slope * (+d.value) + intercept));

        // lines.append('path')
        //     .datum(data)
        //     .attr('class', 'trendline')
        //     .attr('d', trendline)
        //     .attr('stroke', 'red')
        //     .attr('stroke-width', 1)
        //     .attr('fill', 'none')
        //     .attr('style', 'opacity: 1');
    }
}