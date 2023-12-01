/**
 * @file script.js
 * @description This file contains the JavaScript code for the final project.
 * It includes data loading, state management, application mounting, and event handling.
 * The code uses D3.js library for data visualization and manipulation.
 * The main functionality of the code is to display various environmental data on a world map and line chart.
 * The user can select different factors such as CO2 emissions, methane emissions, deforestation, and temperature.
 * The code also includes modal functionality for displaying additional information.
 * The code is adapted from the Visualization for Data Science Homework 4.
 * The world.json file is adapted from Visualization for Data Science Homework 4.
 */

// Date range for the data
const START_DATE = 1990;
const END_DATE = 2015;

// ******* DATA LOADING *******
async function loadData() {
    const co2EmissionsData = await d3.csv('data/co2_emissions.csv');
    const methaneEmissionsData = await d3.csv('data/methane_emissions.csv');
    const deforestationData = await d3.csv('data/net_forest.csv');
    const temperatureData = await d3.csv('data/surface_temperature.csv');
    const dataArrays = [co2EmissionsData, methaneEmissionsData, deforestationData, temperatureData];
    const mapData = await d3.json('data/world.json');
    return { dataArrays, mapData };
}

// ******* STATE MANAGEMENT *******
const globalApplicationState = {
    selectedLocations: [],
    previousSelectedLocations: [],
    selectedFactor: 'co2',
    previousSelectedFactor: 'co2',
    data: null,
    mapData: null,
    worldMap: null,
    lineChart: null,
    worldTempCheckbox: false
};

// ******* CONSTANTS *******
const globalConstants = {
    titles: {
        co2: 'CO₂ Emissions',
        methane: 'Methane Emissions',
        deforestation: 'Net Forest Conversion',
        temperature: 'Surface Temperature Anomaly'
    },
    labels: {
        co2: 'CO₂ Emissions (kt)',
        methane: 'Methane Emissions (CO₂ equivalents)',
        deforestation: 'Net Forest Conversion (Mha)',
        temperature: 'Surface Temperature Anomaly (°C)'
    },
    toolTipContents: {
        co2: 'Kilitons of country output of CO₂ emissions per year.',
        methane: 'Methane measured in Metric tons of its CO₂ equivalent damage.',
        deforestation: 'Net change in forest area measured in Million Hectares (Downward graphs mean declining forest area).',
        temperature: 'The surface temperature anomaly relative to a global mean baseline (in degrees Celsius) for the corresponding year and country.'
    }
};

// Indexes for accessing the data arrays
const dataArrayIndex = {
    number: {
        co2: 0,
        methane: 1,
        deforestation: 2,
        temperature: 3
    }
};

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {

    // Store the loaded data into the globalApplicationState
    globalApplicationState.data = d3.filter(loadedData.dataArrays[0], d => d.year >= START_DATE && d.year <= END_DATE);
    globalApplicationState.mapData = loadedData.mapData;

    // Creates the view objects with the global state passed in 
    const worldMap = new MapVis(globalApplicationState, globalConstants);
    const lineChart = new LineChartVis(globalApplicationState, globalConstants);

    globalApplicationState.worldMap = worldMap;
    globalApplicationState.lineChart = lineChart;

    // Event handler for the co2 button
    d3.select('#co2-button')
        .on('click', () => {
            d3.select('.factor-button-selected').attr('class', 'factor-button factor-button-unselected');
            d3.select('#co2-button').attr('class', 'factor-button factor-button-selected');
            globalApplicationState.data = d3.filter(loadedData.dataArrays[0], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'co2';
            d3.select('#world-temp-checkbox-container').style('visibility', 'hidden');
            worldMap.updateMap();
        });

    // Event handler for the methane button
    d3.select('#methane-button')
        .on('click', () => {
            d3.select('.factor-button-selected').attr('class', 'factor-button factor-button-unselected');
            d3.select('#methane-button').attr('class', 'factor-button factor-button-selected');
            globalApplicationState.data = d3.filter(loadedData.dataArrays[1], d => d.year >= START_DATE && d.year <= END_DATE && d.sector === 'Total excluding LUCF');
            globalApplicationState.selectedFactor = 'methane';
            d3.select('#world-temp-checkbox-container').style('visibility', 'hidden');
            worldMap.updateMap();
        });

    // Event handler for the deforestation button
    d3.select('#deforestation-button')
        .on('click', () => {
            d3.select('.factor-button-selected').attr('class', 'factor-button factor-button-unselected');
            d3.select('#deforestation-button').attr('class', 'factor-button factor-button-selected');
            globalApplicationState.data = d3.filter(loadedData.dataArrays[2], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'deforestation';
            d3.select('#world-temp-checkbox-container').style('visibility', 'hidden');
            worldMap.updateMap();
        });

    // Event handler for the temperature button
    d3.select('#temperature-button')
        .on('click', () => {
            d3.select('.factor-button-selected').attr('class', 'factor-button factor-button-unselected');
            d3.select('#temperature-button').attr('class', 'factor-button factor-button-selected');
            globalApplicationState.data = d3.filter(loadedData.dataArrays[3], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'temperature';
            d3.select('#world-temp-checkbox-container').style('visibility', 'visible');
            worldMap.updateMap();
        });

    // Event handler for closing the modal via the close button
    d3.select('#close-modal-button')
        .on('click', () => {
            closeModalTemperature();
        });

    // Event handler for closing the modal via clicking outside the modal
    d3.select('body').on('click', (event) => {
        if (event.target === modal) {
            closeModalTemperature();
        }
    });

    // Function to close the modal when the user clicks on the close button or outside the modal
    function closeModalTemperature() {
        if (globalApplicationState.selectedFactor === 'temperature') {
            d3.select('#world-temp-checkbox').property('checked', false);
            globalApplicationState.worldTempCheckbox = false;
            globalApplicationState.data = d3.filter(loadedData.dataArrays[3], d => d.year >= START_DATE && d.year <= END_DATE);
        }
        modal.style.display = 'none';
    }

    // Event handler for the world temperature checkbox
    d3.select('#world-temp-checkbox')
        .on('change', (event) => {
            if (event.target.checked) {
                globalApplicationState.worldTempCheckbox = true;
                globalApplicationState.data = d3.filter(loadedData.dataArrays[3], d => d.year >= START_DATE && d.year <= END_DATE && d.country_code === 'WRLD');
                lineChart.drawLineChart();
            } else {
                globalApplicationState.worldTempCheckbox = false;
                globalApplicationState.data = d3.filter(loadedData.dataArrays[dataArrayIndex.number[globalApplicationState.selectedFactor]], d => d.year >= START_DATE && d.year <= END_DATE);
                lineChart.drawLineChart();
            }
        });
});

// Get modal element
const modal = document.getElementById('country-modal');

// Get the button that opens the modal
const openModalBtn = document.getElementById('open-modal-button');