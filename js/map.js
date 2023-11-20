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
            .translate([contentWidth / 2, 200]); // This moves the map to the center of the SVG

        const path = d3.geoPath()
            .projection(projection);

        // D3.js in Action, Second Edition, Chapter 10, Listing 10.2
        // This function creates a legend for the map
        d3.mapLegend = () => {
            const ticks = this.colorScale.ticks(10);
            const colorScale = this.colorScale;
            const selectedFactor = this.globalApplicationState.selectedFactor;
            function legend(svgSelection) {
                svgSelection.selectAll('rect').remove();
                svgSelection.selectAll('rect')
                    .data(ticks)
                    .enter()
                    .append('rect')
                    .attr('height', 20)
                    .attr('width', 20)
                    .attr('x', (_d, i) => i * 20)
                    .attr('fill', (d, _i) => colorScale(d));

                svgSelection.selectAll('text').remove();
                svgSelection.selectAll('text')
                    .data(ticks)
                    .enter()
                    .append('text')
                    .attr('x', (_d, i) => i * 20)
                    .attr('y', 30)
                    .text((d, _i) => {
                        if (selectedFactor === 'temperature') {
                            return d3.format('.1f')(d);
                        } else {
                            return d3.format('.2s')(d);
                        }
                    })
                    .attr('class', 'legend-text');
                return this;
            };

            return legend;
        }
        this.drawMap(path);
    }


    /**
     * Draws the map using the provided path and data.
     * @param {function} path - The path generator function.
     * @returns {void}
     */
    drawMap(path) {
        const geoJSON = topojson.feature(this.globalApplicationState.mapData, this.globalApplicationState.mapData.objects.countries);
        this.minValue = d3.min(this.globalApplicationState.data, d => +d.value);
        this.maxValue = d3.max(this.globalApplicationState.data, d => +d.value);
        this.colorScale = d3.scaleSequential(d3.interpolateWarm)
            .domain([this.minValue, this.maxValue]);
        this.countries = d3.select('#countries');

        this.countries.selectAll('path')
            .data(geoJSON.features)
            .enter().append('path')
            .attr('d', path)
            .attr('class', 'country')
            .attr('id', d => d.id)
            .on('mouseover', (event, d) => this.mouseOver(event, d))
            .on('mouseleave', (event, d) => this.mouseLeave(event, d))
            .on('click', (event, _d) => this.displayModal(event));
        this.drawGraticules(path);
        this.updateMap();
    }

    // Adapted from https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
    /**
     * Handles the mouseover event for the map.
     * @param {Event} event - The mouseover event.
     * @param {_d} _d - The data associated with the event.
     */
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
    }

    // Adapted from https://d3-graph-gallery.com/graph/choropleth_hover_effect.html
    /**
     * Handles the mouse leave event for the map.
     * @param {Event} _event - The mouse leave event.
     * @param {Object} _d - The data associated with the event.
     */
    mouseLeave(_event, _d) {
        d3.selectAll('.country')
            .transition()
            .duration(0)
            .style('opacity', 1);
    }

    /**
     * Updates the map based on the selected year.
     * @param {string} sliderYear - The year selected on the slider. If not provided, defaults to '1990'.
     */
    updateMap(sliderYear) {
        this.minValue = d3.min(this.globalApplicationState.data, d => +d.value);
        this.maxValue = d3.max(this.globalApplicationState.data, d => +d.value);
        this.colorScale.domain([this.minValue, this.maxValue]);
        const year = sliderYear || '1990';
        const maxValues = d3.rollup(
            this.globalApplicationState.data.filter(d => d.year === year),
            v => d3.max(v, d => +d.value),
            d => d.country_code
        );

        this.countries.selectAll('.country')
            .style('fill', d => {
                const countrymaxValues = maxValues.get(d.id);
                if (countrymaxValues !== undefined) {
                    return this.colorScale(countrymaxValues);
                } else {
                    return '#ccc';
                }
            });
        d3.select('#map-legend').call(d3.mapLegend());
        this.drawSlider();
    }


    /**
     * Draws the slider and sets up event listeners for user interaction.
     */
    drawSlider() {
        const sliderValue = d3.select('#year-slider-value');
        const yearSlider = d3.select('#year-slider');
        let years;

        if (this.globalApplicationState.selectedFactor === 'deforestation') {
            years = [1990, 2000, 2010, 2015];
            yearSlider.attr('min', Math.min(...years))
                .attr('max', Math.max(...years))
                .attr('step', 5)
                .on('input', () => {
                    const year = yearSlider.property('value');
                    const closest = years.reduce((prev, curr) => (Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev));
                    this.value = closest;
                    this.updateMap(String(closest));
                });
        } else {
            years = [...new Set(this.globalApplicationState.data.map(d => d.year))].filter(d => d % 5 === 0);
            yearSlider.attr('step', 1)
                .attr('max', 2015)
                .on('input', () => {
                    this.updateMap(yearSlider.property('value'));
                });
            years.sort((a, b) => a - b);
        }

        sliderValue.selectAll('div').remove();
        sliderValue.selectAll('div')
            .data(years)
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

    
    /**
     * Displays a modal with information about the selected location.
     * @param {Event} event - The event object triggered by the user action.
     */
    displayModal(event) {
        this.globalApplicationState.selectedLocations = [event.currentTarget.id];
        this.globalApplicationState.lineChart.drawLineChart();

        const countryName = this.globalApplicationState.data.filter(d => d.country_code === event.currentTarget.id)[0].country_name;
        const value = this.globalApplicationState.data.filter(d => d.country_code === event.currentTarget.id)[0].value;

        // TODO: Implement error handling for when countryName is undefined
        // if (countryName != undefined) {
        d3.select('#country-name').text(countryName);
        d3.select('#value').text(value);
        modal.style.display = 'block';
        // }
    }
}