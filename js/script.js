// world.json source: Visualization for Data Science Homework 4
// Adapted from Visualization for Data Science Homework 4

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
    Data: null,
    mapData: null,
    worldMap: null,
    // lineChart: null,
};

//******* APPLICATION MOUNTING *******
loadData().then((loadedData) => {
    console.log('Here is the imported data:', loadedData.dataArrays[0]);

    // Store the loaded data into the globalApplicationState
    globalApplicationState.Data = loadedData.dataArrays[0];
    globalApplicationState.mapData = loadedData.mapData;

    // Creates the view objects with the global state passed in 
    const worldMap = new MapVis(globalApplicationState);
    // const lineChart = new LineChart(globalApplicationState);

    globalApplicationState.worldMap = worldMap;
    // globalApplicationState.lineChart = lineChart;

    d3.select('#co2-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = loadedData.dataArrays[0];
            worldMap.renderMap();
        });

        d3.select('#methane-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = loadedData.dataArrays[1];
            worldMap.renderMap();
        });

        d3.select('#deforestation-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = loadedData.dataArrays[2];
            worldMap.renderMap();
        });

        d3.select('#temperature-button')
        .on('click', () => {
            globalApplicationState.Data = null;
            globalApplicationState.Data = loadedData.dataArrays[3];
            worldMap.renderMap();
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