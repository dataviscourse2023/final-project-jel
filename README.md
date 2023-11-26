# Climate Change: Factors and Rates
### By: Ellery Gresham, Jeremy Reynolds, and Luke Schreiber
### https://dataviscourse2023.github.io/final-project-jel/

## Code:
- `js/script.js` contains the start up code for the project, and was adapted from `script.js` for Homework 4.
  - Modal code was added to control the modal that appears when the user clicks on a country.
  - Button code was added to allow the user to switch between climate change factors on the map.
  - Slider code was added to allow the user to switch between years on the map.

- `js/map.js` contains the code for the map, and was adapted from `map.js` for Homework 4.
  - Slider code was added to update the map when the user changes the year.
  - Modal coded was added to create the modal that appears when the user clicks on a country.
  - Mouseover and mouseout code was added to outline the country the user is hovering over.
    - Adapted from https://d3-graph-gallery.com/graph/choropleth_hover_effect.html.

- `js/bar-chart.js` contains the code for the bar chart, and was adapted from `bar-chart.js` for Homework 3.
  - Work in progress.

- Map and graticule styles in `css/styles.css` were adapted from Homework 4.

## Libraries:
- `d3.js` is used extensively throughout this project.
  - Load data from csv files in `js/script.js`.
  - Render map and graticules in `js/map.js`.
  - Select and update elements in `js/script.js` and `js/map.js`.

## Data Sources:
 - `co2_emissions.csv`: https://www.kaggle.com/datasets/ulrikthygepedersen/co2-emissions-by-country
 - `methane_emissions.csv`: https://www.kaggle.com/datasets/kkhandekar/methane-emissions-across-the-world-19902018
 - `net_forest.csv`: https://www.kaggle.com/datasets/chiticariucristian/deforestation-and-forest-loss
 - `surface_temperature.csv`: https://www.kaggle.com/datasets/jawadawan/global-warming-trends-1961-2022
 - `world.json`: Visualization for Data Science Homework 4.

 ## Non-obvious Features:
 - The page starts with collapsed categories. The user can click on the category name to expand it. The user can also click on the category name again to collapse it.
   - The final project will have the introduction expanded by default.
 - The user can click on a country to see more information about that country. However, this feature is a work in progress.
   - To close the modal, the user can click on the 'x' in the top right corner of the modal or click anywhere outside of the modal.
 - The user can switch between climate change factors using the buttons above the map.
 - The user can switch between years using the slider to the top left of the map.
   - Year marks will be added for the final project.
 - Map colors only display for certain dates for deforestation. This is because the data for deforestation is only available for certain years. For the final project, the slider will only display years for which data is available.
 - A color scale will be added to the map for the final project.

 # To Do:
 - Map:
    - Document code.
    - Experiment with different color scales.
    - Experiment with different projections.
    - (Optional) Add tooltip to legend to show more information about the color scale.
      - The code has been added, but info needs to be added to the tooltip.
    - (Optional) Add tooltip to countries to show more information about the country.
 - Line Chart:
    - ***MUST*** add a legend to the chart.
    - Factor and document code.
    - Fix x-axis so it displays the correct years. Currently, the x-axis displays the years 1990-2014, but the data only goes up to 2015.
    - Add embellishments to the chart.    
    - (Optional) Add tooltip to show more information about the data point. Can adapt code from HW 4.
