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
        this.lineChart = d3.select('#line-chart');
    }

    renderLineChart() {
        const data = d3.filter(this.globalApplicationState.Data, d => d.country_code === this.globalApplicationState.selectedLocations[0]);
        const width = 700 - this.margin.left - this.margin.right;
        const height = 800 - this.margin.top - this.margin.bottom;

        this.lineChart
            .attr('width', width + this.margin.left + this.margin.right)
            .attr('height', height + this.margin.top + this.margin.bottom)
            // .attr('transform', `translate(${0}, ${0})`)
            ;

        const svg = this.lineChart.select('#lines');

        svg.selectAll('*').remove();

        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(d.year)))
            .range([0, width - this.margin.left - this.margin.right]);

        const yScale = d3.scaleLinear()
            .domain(d3.extent(data, d => d.value))
            .range([height - this.margin.top - this.margin.bottom, 0]).nice();            

        const xAxis = d3.select('#x-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${height})`)
            .call(d3.axisBottom(xScale));


        const yAxis = d3.select('#y-axis')
            .attr('transform', `translate(${this.margin.left * 2}, ${this.margin.top * 2})`)
            .call(d3.axisLeft(yScale));

        const line = d3.line()
            .x(d => xScale(new Date(d.year)) + this.margin.left * 2)
            .y(d => yScale(d.value) + this.margin.top * 2);

            svg.append('path')
            .datum(data)
            .attr('class', 'line')
            .attr('d', line)
            .attr('fill', 'none')
            .attr('stroke', 'steelblue')
            .attr('stroke-width', 2)
            .attr('style', 'opacity: 1');
    }



}