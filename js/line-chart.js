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
    }

    /**
     * Draws a line chart based on the provided data.
     */
    drawLineChart() {
        const data = d3.filter(this.globalApplicationState.data, d => d.country_code === this.globalApplicationState.selectedLocations[0]);
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
            .attr('d', line)
            // Experimenting with animation
            // Draws backwards for some charts. Need to fix
            .transition()
            .duration(300)
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
    }
}