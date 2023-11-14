/** Class representing the line chart visualizations.
 */

class LineChartVis {

    /**
     * Creates a Line Chart Visualzation 
     * @param globalApplicationState 
     */
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;
        this.margin = { top: 20, right: 20, bottom: 20, left: 35 };
        this.width = 700 - this.margin.left - this.margin.right;
        this.height = 800 - this.margin.top - this.margin.bottom;
        this.lineChart = d3.select('#line-chart')
            .attr('width', this.width + this.margin.left + this.margin.right)
            .attr('height', this.height + this.margin.top + this.margin.bottom);
    }

    renderLineChart() {
        const data = d3.filter(this.globalApplicationState.Data, d => d.country_code === this.globalApplicationState.selectedLocations[0]);

        // Add global average temperature to bring it to actual temperature
        if (this.globalApplicationState.selectedFactor === 'temperature') {
            for (let d of data) {
                d.value = parseFloat(d.value) + 15.0; // 15 is a placeholder. Get global average temperature
            }
        }

        const lines = this.lineChart.select('#lines');

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.year)))
            .range([0, this.width - this.margin.left - this.margin.right]);

        d3.select('#x-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.height})`)
            .call(d3.axisBottom(xScale));

        console.log(d3.extent(data, d => parseFloat(d.value)));

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d.value)).sort(d3.ascending))
            .range([this.height - this.margin.top - this.margin.bottom, 0]).nice();

        d3.select('#y-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.top * 2})`)
            .call(d3.axisLeft(yScale));

        const line = d3.line()
            .x(d => xScale(new Date(d.year)) + this.margin.left * 2)
            .y(d => yScale(d.value) + this.margin.top * 2);

        lines.selectAll('*').remove();
        lines.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
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