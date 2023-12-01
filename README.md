# Climate Change: Factors and Rates
### By: Ellery Gresham, Jeremy Reynolds, and Luke Schreiber
### https://dataviscourse2023.github.io/final-project-jel/
### https://www.youtube.com/watch?v=QBHQ58Himuw 

## Code:
- `js/script.js` contains the start up code for the project, and was adapted from `script.js` for Homework 4.
  - Modal code was added to control the modal that appears when the user clicks on a country.
  - Button code was added to allow the user to switch between climate change factors on the map.
  - Slider code was added to allow the user to switch between years on the map.

- `js/map.js` contains the code for the map, and was adapted from `map.js` for Homework 4.
  - Slider code was added to update the map when the user changes the year.
  - Modal coded was added to create the modal that appears when the user clicks on a country.
  - Mouseover and mouseout code was added to outline the country the user is hovering over.
  - A color scale legend was added to display the color scale for the map.
  - A tool tip and mouseover code was added to display information about the selected factor.

- `js/line-chart.js` contains the code for the line chart, and was adapted from `line-chart.js` for Homework 4.
  - Renders a line chart and trend line for the selected country and factor.
  - A checkbox was added for 'temperature' to allow the user to switch between country and global temperature anomaly.

- Map and graticule styles in `css/styles.css` were adapted from Homework 4.

## Libraries:
- `d3.js` is used extensively throughout this project.
  - Load data from csv files in `js/script.js`.
  - Render map, graticules, and legend in `js/map.js`.
  - Render line chart and legend in `js/line-chart.js`.
  - Select and update elements in `js/script.js`, `js/map.js`, and `js/line-chart.js`.

## Other Code Sources (See code comments for usage):
  - D3.js in Action, Second Edition, Chapter 10, Listing 10.2
  - Info icon: https://icons.getbootstrap.com/icons/info-circle/

Coding assistance provided by GitHub Copilot.

## Data Sources:
 - `co2_emissions.csv`: https://www.kaggle.com/datasets/ulrikthygepedersen/co2-emissions-by-country
 - `methane_emissions.csv`: https://www.kaggle.com/datasets/kkhandekar/methane-emissions-across-the-world-19902018
 - `net_forest.csv`: https://www.kaggle.com/datasets/chiticariucristian/deforestation-and-forest-loss
 - `surface_temperature.csv`: https://www.kaggle.com/datasets/jawadawan/global-warming-trends-1961-2022
 - `world.json`: Visualization for Data Science Homework 4.

 ## Non-obvious Features:
 - The user can click on a category name to expand or collapse it.
 - The user can click on a country to see line chart of the selected factor for that country.
   - To close the modal, the user can click on the 'x' in the top right corner of the modal or click anywhere outside of the modal.
 - Map colors only display for certain dates for deforestation. This is because the data for deforestation is only available for certain years. For deforestation, the slider will only display years for which data is available.
 - The user can mouseover the info icon to see a tooltip with information about the selected factor.