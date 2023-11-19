/** Class representing the map view.
 * Adapted from Visualization for Data Science Homework 4
 */
class MapVis {
    /**
     * Creates a Map Visuzation
     * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
     */
    constructor(globalApplicationState) {
        this.globalApplicationState = globalApplicationState;

        const contentWidth = d3.select('#content').node().clientWidth;

        // Set up the map projection
        const projection = d3.geoWinkel3()
            .scale(125) // This set the size of the map
            .translate([contentWidth / 2, 250]); // This moves the map to the center of the SVG

        const path = d3.geoPath()
            .projection(projection);

        // this.co2MaxValues = d3.rollup(
        //     this.globalApplicationState.Data.filter(d => d.year === year),
        //     v => d3.max(v, d => +d.value),
        //     d => d.country_code
        // );

        this.drawGraticules(path);
        this.drawMap(path);
    }


    /**
     * Updates the map with data for a given year.
     * @param {number} year - The year to update the map with.
     */
    slider(year) {

        // TODO: Clean up this code and make it reusable
        const maxValues = d3.rollup(
            this.globalApplicationState.Data.filter(d => d.year === year),
            v => d3.max(v, d => +d.value),
            d => d.country_code
        );

        const overallValues = d3.max(this.globalApplicationState.Data, d => +d.value);

        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, overallValues]);

        // Experimenting with transitions
        const countries = this.countries.selectAll('.country');
        // countries
        //     .transition()
        //     .duration(30)
        //     .style('opacity', 0);

        countries
            // .transition()
            // .duration(300)
            .style('fill', d => {
                const countrymaxValues = maxValues.get(d.id);
                if (countrymaxValues !== undefined) {
                    return colorScale(countrymaxValues);
                } else {
                    return '#ccc';
                }
            })

        // .style('opacity', 1);
    }


    /**
     * Draws a map using the provided path and data.
     * @param {string} path - The path to use for drawing the map.
     */
    drawMap(path) {
        const geoJSON = topojson.feature(this.globalApplicationState.mapData, this.globalApplicationState.mapData.objects.countries);
        // const maxValues = d3.rollup(
        //     this.globalApplicationState.Data,
        //     v => d3.max(v, d => +d.value),
        //     d => d.country_code
        // );

        const year = d3.select('#year-slider').property('value');

        const maxValues = d3.rollup(
            this.globalApplicationState.Data.filter(d => d.year === year),
            v => d3.max(v, d => +d.value),
            d => d.country_code
        );

        const overallValues = d3.max(this.globalApplicationState.Data, d => +d.value);
        const colorScale = d3.scaleSequential(d3.interpolateReds)
            .domain([0, overallValues]);

        this.countries = d3.select('#map')
            .select('#countries');

        this.countries.selectAll('path')
            .data(geoJSON.features)
            .enter().append('path')
            .attr('d', path)
            .attr('class', 'country')
            .attr('id', d => d.id)
            .on('mouseover', (event, d) => this.mouseOver(event, d))
            .on('mouseleave', (event, d) => this.mouseLeave(event, d))
            .on('click', (event, _d) => this.displayModal(event));

        this.countries.selectAll('.country')
            .style('fill', d => {
                const countrymaxValues = maxValues.get(d.id);
                if (countrymaxValues !== undefined) {
                    return colorScale(countrymaxValues);
                } else {
                    return '#ccc';
                }
            });

        this.drawMapLegend(overallValues, colorScale);

        this.drawSlider();
    }


    
    /**
     * Draws the legend for the map based on the overall values and color scale.
     * 
     * @param {number} overallValues - The overall values used to determine the domain of the scale.
     * @param {function} colorScale - The color scale used to determine the fill color of the legend rectangles.
     */
    drawMapLegend(overallValues, colorScale) {

        console.log(overallValues);

        // The scale is not redrawing correctly when switching between factors
        const mapScale = d3.select('#map-legend').append('g')
            .attr('transform', 'translate(0,0)');
        const scaleText = d3.select('#map-legend-labels');
        const scaleWidth = d3.select('#map-legend-container').node().clientWidth;
        const scaleHeight = 20;
        const scale = d3.scaleLinear()
            .domain([0, overallValues])
            .range([0, scaleWidth]); // Fix the width
        const scaleValues = scale.ticks(10);

        scaleText.selectAll('rect').remove();
        mapScale.selectAll('rect')
            .data(scaleValues)
            .enter().append('rect')
            .attr('x', d => scale(d))
            .attr('y', 0)
            .attr('width', scaleWidth / scaleValues.length)
            .attr('height', scaleHeight)
            .style('fill', d => colorScale(d));

        scaleText.selectAll('div').remove();
        scaleText.selectAll('div')
            .data(scaleValues)
            .enter().append('div')
            // .attr('x', d => scale(d))
            // .attr('y', scaleHeight * 2)
            .attr('x', 10)
            .attr('y', 5)
            .text(d => d)
            .attr('class', 'legend-text');
    }


    /**
     * Draws a slider based on the selected factor in the global application state.
     */
    drawSlider() {
        const sliderValue = d3.select('#year-slider-value');
        const slider = d3.select('#year-slider');
        let a;

        if (this.globalApplicationState.selectedFactor === 'deforestation') {
            slider.attr('step', 10);
            slider.attr('max', 2010);
            a = [...new Set(this.globalApplicationState.Data.map(d => d.year))].filter(d => (d >= 1990 && d <= 2010) && d % 5 === 0);
        } else {
            slider.attr('step', 1);
            slider.attr('max', 2015);
            a = [...new Set(this.globalApplicationState.Data.map(d => d.year))].filter(d => (d >= 1990 && d <= 2015) && d % 5 === 0);
        }
        a.sort((a, b) => a - b);

        sliderValue.selectAll('div').remove();
        sliderValue.selectAll('div')
            .data(a)
            .enter().append('div')
            .attr('x', 10)
            .attr('y', 5)
            .text(d => d)
            .attr('class', 'slider-text');
    }

    
    /**
     * Draws graticules on the map using the provided path.
     * @param {function} path - The path generator function.
     */
    drawGraticules(path) {
        const graticules = d3.select('#map')
            .select('#graticules');
        const grat = d3.geoGraticule();

        graticules.selectAll('.graticule-line')
            .data(grat.lines())
            .enter().append('path')
            .attr('class', 'graticule-line')
            .attr('d', path)

        graticules.append('path')
            .datum(grat.outline())
            .attr('class', 'graticule outline')
            .attr('d', path)
    }

    // Adapted from https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
    mouseOver(event, _d) {
        d3.selectAll('.country')
            .transition()
            .duration(0)
            .style('opacity', 0.75);

        // Highlight country under mouse
        d3.select(event.currentTarget)
            .transition()
            .duration(0)
            .style('opacity', 1);
        // .style("stroke", "black")
        // .style("stroke-width", "2px")
        // .style("stroke-opacity", 1);        
    }

    // Adapted from https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
    mouseLeave(_event, _d) {
        d3.selectAll('.country')
            .transition()
            .duration(0)
            .style('opacity', 1);
        // .style('opacity', 1)
        // .style("stroke", "none");
    }

    displayModal(event) {

        this.globalApplicationState.selectedLocations = [event.currentTarget.id];
        this.globalApplicationState.lineChart.drawLineChart();

        // TODO: Implement error handling for when countryName is undefined
        const countryName = this.globalApplicationState.Data.filter(d => d.country_code === event.currentTarget.id)[0].country_name;
        const value = this.globalApplicationState.Data.filter(d => d.country_code === event.currentTarget.id)[0].value;




        // if (countryName != undefined) {
        d3.select('#country_name').text(countryName);
        d3.select('#value').text(value);
        modal.style.display = 'block';
        // }
    }
}