/**
 * @file script.js
 * @description This file contains the JavaScript code for the final project.
 * It includes data loading, state management, application mounting, and event handling.
 * The code uses D3.js library for data visualization and manipulation.
 * The main functionality of the code is to display various environmental data on a world map and line chart.
 * The user can select different factors such as CO2 emissions, methane emissions, deforestation, and temperature.
 * The code also includes modal functionality for displaying additional information.
 */
// world.json source: Visualization for Data Science Homework 4
// Adapted from Visualization for Data Science Homework 4

const START_DATE = 1990;
const END_DATE = 2015;

// ******* DATA LOADING *******
async function loadData() {
    const co2EmissionsData = await d3.csv('data/co2_emissions.csv');
    const methaneEmissionsData = await d3.csv('data/methane_emissions.csv');
    const deforestationData = await d3.csv('data/net_forest.csv');
    const temperatureData = await d3.csv('data/surface_tempurature.csv');
    const dataArrays = [co2EmissionsData, methaneEmissionsData, deforestationData, temperatureData];
    const mapData = await d3.json('data/world.json');
    return { dataArrays, mapData };
}

// ******* STATE MANAGEMENT *******
const globalApplicationState = {
    selectedLocations: [],
    selectedFactor: 'co2',
    data: null,
    mapData: null,
    worldMap: null,
    lineChart: null,
};

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

    d3.select('#co2-button')
        .on('click', () => {
            globalApplicationState.data = d3.filter(loadedData.dataArrays[0], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'co2';
            worldMap.updateMap();
        });

    d3.select('#methane-button')
        .on('click', () => {

            globalApplicationState.data = d3.filter(loadedData.dataArrays[1], d => d.year >= START_DATE && d.year <= END_DATE && d.sector === 'Total excluding LUCF');
            globalApplicationState.selectedFactor = 'methane';
            worldMap.updateMap();
        });

    d3.select('#deforestation-button')
        .on('click', () => {
            globalApplicationState.data = d3.filter(loadedData.dataArrays[2], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'deforestation';
            worldMap.updateMap();
        });

    d3.select('#temperature-button')
        .on('click', () => {
            // loadedData.dataArrays[3].forEach(d => d.value = parseFloat(d.value) + 14);
            globalApplicationState.data = d3.filter(loadedData.dataArrays[3], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'temperature';
            worldMap.updateMap();
        });
});

// Get modal element
const modal = document.getElementById('country-modal');

// Get the button that opens the modal
const openModalBtn = document.getElementById('open-modal-button');

// Get the element that closes the modal
const closeModalBtn = document.getElementById('close-modal-button');

// Open the modal
openModalBtn.addEventListener('click', () => {
    // modal.style.display = 'block';
});

// Close the modal
closeModalBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// Close the modal if the user clicks outside of it
window.addEventListener('click', (event) => {
    if (event.target === modal) {
        modal.style.display = 'none';
    }
});