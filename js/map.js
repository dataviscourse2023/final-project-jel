/** Class representing the map view.
 * Adapted from Visualization for Data Science Homework 4
 */
class MapVis {
    /**
     * Creates a Map Visuzation
     * @param globalApplicationState The shared global application state (has the data and the line chart instance in it)
     */
    constructor(globalApplicationState, globalConstants) {
        this.globalApplicationState = globalApplicationState;
        this.globalConstants = globalConstants;
        this.countries = d3.select('#countries');
        this.yearSlider = d3.select('#year-slider');
        this.sliderLabels = d3.select('#year-slider-labels');
        this.sliderWidth = this.yearSlider.node().clientWidth;
        const contentWidth = d3.select('#content').node().clientWidth;
        const legendContainerWidth = d3.select('#map-legend-container').node().clientWidth;
        this.body = d3.select('body');

        // Set up the map projection
        const projection = d3.geoWinkel3()
            .scale(125) // This set the size of the map
            .translate([contentWidth / 2, 200]); // This moves the map to the center of the SVG

        const path = d3.geoPath()
            .projection(projection);

        // D3.js in Action, Second Edition, Chapter 10, Listing 10.2
        // Creates a legend for the map
        d3.mapLegend = () => {
            const ticks = this.colorScale.ticks(10);
            const colorScale = this.colorScale;
            const selectedFactor = this.globalApplicationState.selectedFactor;
            const labels = this.globalConstants.labels;
            const elementWidth = legendContainerWidth / ticks.length;
            function legend(svgSelection) {

                const rects = svgSelection.selectAll('rect')
                    .data(ticks);
                rects.exit().remove();
                rects.enter().append('rect')
                    .merge(rects)
                    .attr('height', 10)
                    .attr('width', elementWidth)
                    .attr('x', (_d, i) => i * elementWidth)
                    .attr('y', 10)
                    .attr('fill', (d, _i) => colorScale(d));

                const texts = svgSelection.selectAll('text')
                    .data(ticks);
                texts.exit().remove();
                texts.enter().append('text')
                    .merge(texts)
                    .attr('x', (_d, i) => i * elementWidth)
                    .attr('y', 35)
                    .text((d, _i) => {
                        if (selectedFactor === 'temperature') {
                            return d3.format('.1f')(d);
                        } else {
                            return d3.format('.2s')(d);
                        }
                    })
                    .attr('class', 'legend-text');

                // Create a group to hold the title and the SVG
                const titleGroup = d3.select('#map-legend-title').selectAll('g')
                    .data([null]); // Only one group needed

                titleGroup.exit().remove();
                const titleGroupEnter = titleGroup.enter()
                    .append('g')
                    .attr('class', 'legend-title-group');

                // Append title text
                titleGroupEnter.append('text')
                    .merge(titleGroup.select('text'))
                    .text(() => labels[selectedFactor])
                    .attr('class', 'legend-title-text');

                if (titleGroup.select('svg').empty()) {
                    drawInfoIcon();
                } else {
                    titleGroup.select('svg')
                        .attr('transform', `translate(5, 0)`);
                };


                /**
                 * Draws an info icon using SVG.
                 */
                function drawInfoIcon() {
                    const infoIcon = titleGroupEnter.append('svg')
                        .attr('width', 16)
                        .attr('height', 16)
                        .attr('class', 'bi bi-info-circle')
                        .attr('viewBox', '0 0 16 16')
                        .merge(titleGroup.select('svg'))
                        .attr('transform', `translate(5, 0)`)
                        .on('mouseover', function (event) {
                            showTooltip(event);
                        });

                    // https://icons.getbootstrap.com/icons/info-circle/
                    // Append the first path to the SVG
                    infoIcon.append('path')
                        .attr('d', 'M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16')
                        .attr('fill', 'currentColor');

                    // Append the second path to the same SVG
                    infoIcon.append('path')
                        .attr('d', 'm8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0')
                        .attr('fill', 'currentColor');
                }


                /**
                 * Displays a tooltip with content when the info icon is clicked.
                 * 
                 * @param {Event} event - The click event that triggered the tooltip display.
                 */
                function showTooltip(event) {

                    // Stop propagation to prevent the document click handler from immediately hiding the tooltip
                    event.stopPropagation();

                    // Get the position of the info icon
                    const iconX = d3.select('.bi').node().getBoundingClientRect().x;
                    const iconY = d3.select('.bi').node().getBoundingClientRect().y;

                    d3.select('#tooltip')
                        .style('display', 'block')
                        .style('left', iconX + window.scrollX + 10 + 'px')
                        .style('top', iconY + window.scrollY - 125 + 'px')
                        .html('<b>C02 Emissions in (kt):</b> Kilitons of country output of C02 emissions per year.' + '<br>' +
                        '<b>Methane Emissions(CO₂ equivalents):</b> Methane measured in Metric tons of its C02 equivalent damage.' + '<br>' +
                        '<b>Net Forest Conversion (Mha):</b> Net Change in Forest Area (Downward graphs mean declining forest area)' + '<br>' +
                        '<b>Surface Temperature Anomaly (°C):</b> The annual surface temperature (in degrees Celsius) for the corresponding year and country.'
                         )
                        .transition()
                        .duration(250)
                        .style('opacity', 1);
                }

                // Hide tooltip
                d3.select('body').on('mouseout', function (event) {
                    const outsideTooltip = !document.getElementById('tooltip').contains(event.target);
                    const notIconClick = !d3.select(event.target).classed('bi-info-circle');

                    if (outsideTooltip && notIconClick) {
                        d3.select('#tooltip')
                            .transition()
                            .duration(250)
                            .style('opacity', 0)
                            .on('end', function () {
                                d3.select(this).style('display', 'none');
                            });
                    }
                });

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
        const countries = this.countries.selectAll('path')
            .data(geoJSON.features);

        countries.exit().remove();
        countries.enter().append('path')
            .merge(countries)
            .attr('d', path)
            .attr('class', 'country')
            .attr('id', d => d.id)
            .on('click', (event, _d) => this.displayModal(event));

        this.drawGraticules(path);
        this.updateMap();
    }


    /**
     * Updates the map based on the selected year.
     * @param {string} sliderYear - The year selected on the slider. If not provided, defaults to '1990'.
     */
    updateMap(sliderYear) {
        const yearSlider = this.yearSlider;
        const year = sliderYear || yearSlider.property('value');
        const countries = this.countries.selectAll('.country');
        this.getMinMaxValues();

        if (!this.colorScale) {
            this.colorScale = d3.scaleSequential(d3.interpolateWarm) // Try d3.interpolateTurbo
                .domain([this.minValue, this.maxValue]);
        } else {
            this.colorScale.domain([this.minValue, this.maxValue]);
        }

        countries.style('fill', d => {
            const countryMaxValue = this.calculateMaxValues(year).get(d.id);
            if (countryMaxValue !== undefined) {
                return this.colorScale(countryMaxValue);
            } else {
                return '#ccc';
            }
        });

        d3.select('#map-legend').call(d3.mapLegend());
        this.drawSlider();
    }


    /**
     * Calculates the maximum values based on the selected year and factor.
     * @param {number} year - The year for which to calculate the maximum values.
     * @returns {Map<string, number>} - A map of country codes to maximum values.
     */
    calculateMaxValues(year) {
        const allowedYears = [1990, 2000, 2010, 2015];
        if (this.globalApplicationState.selectedFactor === 'deforestation') {
            const closest = allowedYears.reduce((prev, curr) => (Math.abs(curr - year) < Math.abs(prev - year) ? curr : prev));
            return d3.rollup(
                this.globalApplicationState.data.filter(d => +d.year === closest),
                v => d3.max(v, d => +d.value),
                d => d.country_code
            );
        } else {
            return d3.rollup(
                this.globalApplicationState.data.filter(d => d.year === year),
                v => d3.max(v, d => +d.value),
                d => d.country_code
            );
        }
    }


    /**
     * Calculates the minimum and maximum values for the selected factor.
     */
    getMinMaxValues() {
        this.minValue = d3.min(this.globalApplicationState.data, d => +d.value);
        this.maxValue = d3.max(this.globalApplicationState.data, d => +d.value);
    }


    /**
     * Draws the slider and sets up event listeners for user interaction.
     */
    drawSlider() {
        const yearSlider = this.yearSlider;
        const sliderLabels = this.sliderLabels;
        const sliderWidth = this.sliderWidth;
        const selectedFactor = this.globalApplicationState.selectedFactor;
        let years;

        if (selectedFactor === 'deforestation') {
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

        const texts = sliderLabels.selectAll('text')
            .data(years);
        texts.exit().remove();
        texts.enter().append('text')
            .merge(texts)
            .attr('x', (d, i) => {
                if (selectedFactor === 'deforestation') {
                    if (d < 2015) {
                        return i * (sliderWidth - 21.03) / 2.5;
                    } else {
                        return i * (sliderWidth - 21.03) / 3;
                    }
                } else {
                    return i * (sliderWidth - 21.03) / 5;
                }
            })
            .attr('y', 10)
            .text(d => d)
            .attr('class', 'slider-text');
    }


    /**
     * Draws graticules on the map using the provided path.
     * @param {function} path - The path generator function.
     */
    drawGraticules(path) {
        const graticules = d3.select('#map').select('#graticules');
        const graticule = d3.geoGraticule();

        const graticuleLines = graticules.selectAll('.graticule-line')
            .data(graticule.lines());

        graticuleLines.exit().remove();

        graticuleLines.enter().append('path')
            .merge(graticuleLines)
            .attr('class', 'graticule-line')
            .attr('d', path);

        graticules.append('path')
            .datum(graticule.outline())
            .attr('class', 'graticule outline')
            .attr('d', path);
    }


    /**
     * Displays a modal with information about the selected location.
     * @param {Event} event - The event object triggered by the user action.
     */
    displayModal(event) {
        this.globalApplicationState.selectedLocations = [event.currentTarget.id];

        // If the user clicks on a country that is not in the data, do nothing
        if (!this.globalApplicationState.data.find(d => d.country_code === this.globalApplicationState.selectedLocations[0])) {
            return;
        }

        this.globalApplicationState.lineChart.drawLineChart();
        modal.style.display = 'block';
    }
}