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
    }

    /**
     * Draws a line chart based on the provided data.
     */
    drawLineChart() {
        const data = d3.filter(this.globalApplicationState.data, d => d.country_code === this.globalApplicationState.selectedLocations[0]);
        const lineChart = d3.select('#line-chart')
            .attr('width', this.width + this.margin.left)
            .attr('height', this.height + this.margin.bottom * 2);
        const lines = lineChart.select('#lines');

        // Add the x-axis
        const xScale = this.drawXAxis(data);

        // Add the y-axis
        const yScale = this.drawYAxis(data);

        // Add the line
        const line = d3.line()
            .x(d => xScale(new Date(d.year)) + this.margin.left * 2)
            .y(d => yScale(d.value) + this.margin.bottom * 2);

        lines.selectAll('*').remove();
        lines.append('path')
            .datum(data)
            .attr('d', line)
            // Experimenting with animation
            // Draws backwards for some charts. Need to fix
            // .transition()
            // .duration(300)
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
            ;
    }

    /**
     * Draws the y-axis for the line chart.
     * 
     * @param {Array} data - The data used to determine the y-axis scale.
     * @returns {Function} - The y-axis scale function.
     */
    drawYAxis(data) {
        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => parseFloat(d.value)).sort(d3.ascending))
            .range([this.height - this.margin.bottom - this.margin.top, 0]).nice();

        const yAxis = d3.select('#y-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.bottom * 2})`)
            .call(d3.axisLeft(yScale));

        // Add the y-axis label
        const yAxisLabel = yAxis.select('#y-axis-label')
            .attr('x', -this.height / 2 + this.margin.bottom)
            .attr('y', -this.margin.left - this.margin.left / 2);
        const factor = d3.select('#factor');
        const selectedFactor = this.globalApplicationState.selectedFactor;
        const title = this.globalApplicationState.titles[selectedFactor] + ' in ' + data[0].country_name;

        factor.text(title); // Update the title
        if (selectedFactor === 'co2') {
            yAxisLabel.text('CO2 Emissions (kt)');
        } else if (selectedFactor === 'methane') {
            yAxisLabel.text('Methane Emissions (CO2 equivalents)');
        } else if (selectedFactor === 'deforestation') {
            yAxisLabel.text('Mha');
        } else if (selectedFactor === 'temperature') {
            yAxisLabel.text('°C');
        }
        return yScale;
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
            .range([0, this.width - this.margin.left - this.margin.right]);

        const xAxis = d3.select('#x-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.height})`)
            .call(d3.axisBottom(xScale));

        // Add the x-axis label
        xAxis.append('text')
            .attr('class', 'axis-label')
            .attr('x', this.width / 2 - this.margin.left)
            .attr('y', this.margin.bottom * 2)
            .text('Year');
        return xScale;
    }
}