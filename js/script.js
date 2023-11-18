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
    Data: null,
    mapData: null,
    worldMap: null,
    lineChart: null
};

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
    // console.log('Here is the imported data:', loadedData.dataArrays[0]);

    // Store the loaded data into the globalApplicationState
    globalApplicationState.Data = d3.filter(loadedData.dataArrays[0], d => d.year >= START_DATE && d.year <= END_DATE);
    globalApplicationState.mapData = loadedData.mapData;

    // Creates the view objects with the global state passed in 
    const worldMap = new MapVis(globalApplicationState);
    const lineChart = new LineChartVis(globalApplicationState);

    globalApplicationState.worldMap = worldMap;
    globalApplicationState.lineChart = lineChart;

    d3.select('#co2-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = d3.filter(loadedData.dataArrays[0], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'co2';
            worldMap.drawMap();
        });

        d3.select('#methane-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = d3.filter(loadedData.dataArrays[1], d => d.year >= START_DATE && d.year <= END_DATE && d.sector === 'Total excluding LUCF');
            globalApplicationState.selectedFactor = 'methane';
            worldMap.drawMap();
        });

        d3.select('#deforestation-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = d3.filter(loadedData.dataArrays[2], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'deforestation';
            worldMap.drawMap();
            worldMap.drawSlider();
        });

        d3.select('#temperature-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = d3.filter(loadedData.dataArrays[3], d => d.year >= START_DATE && d.year <= END_DATE);
            globalApplicationState.selectedFactor = 'temperature';
            worldMap.drawMap();
        });

        d3.select('#year-slider')
        .on('input', () => {
            const year = d3.select('#year-slider').property('value');
            worldMap.slider(year);
        });
});

// Get modal element
const modal = document.getElementById('countryModal');

// Get the button that opens the modal
const openModalBtn = document.getElementById('openModalBtn');

// Get the element that closes the modal
const closeModalBtn = document.getElementById('closeModalBtn');

// Open the modal
openModalBtn.addEventListener('click', () => {
    modal.style.display = 'block';
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