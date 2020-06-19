
function drawMBoxHexMap(){
    // setting up the mapbox gl map
    // first we specify the token

    mapboxgl.accessToken = 'pk.eyJ1IjoiZW5qYWxvdCIsImEiOiJjaWhtdmxhNTIwb25zdHBsejk0NGdhODJhIn0.2-F2hS_oTZenAWc0BMf_uw'

    //Setup mapbox-gl map
    const map = new mapboxgl.Map({
      container: 'mapBox', // container id
      style: 'mapbox://styles/mapbox/dark-v10?optimize=true', // default style picked from mapbox gljs docs
      center: [67.2354, 30.1156], // picked a center coordinate for Pishin (Balochistan)
      zoom: 7.5,

    })

    var t1 = performance.now()
    console.log("Call to function took " + (t1 - t0) + " milliseconds.")

    map.scrollZoom.disable() // disable zoom on pinch
    map.addControl(new mapboxgl.NavigationControl()); // add navigation controls like zoom etc


    // Setup our svg layer that we can manipulate with d3
    // getting the container which contains the mapbox map
    const container = map.getCanvasContainer();
    // appending an svg to that container
    const svg = d3.select(container).append("svg").classed('mapBoxSVG', true);


    var t0 = performance.now();

    // we calculate the scale given mapbox state (derived from viewport-mercator-project's code)
    // to define a d3 projection
    const getD3 = () => {
      // get important data for the map that will be helpful to define D3 projection
      const bbox = document.getElementById('mapBox').getBoundingClientRect();
      const center = map.getCenter();
      const zoom = map.getZoom();
      // 512 is hardcoded tile size, might need to be 256 or changed to suit your map config

      const getD3projScal = (tileSize, zoom) => (tileSize) * 0.5 / Math.PI * Math.pow(2, zoom);
      const scale = getD3projScal(512, zoom);

      const projection = d3.geoMercator()
        .center([center.lng, center.lat])
        .translate([bbox.width/2, bbox.height/2])
        .scale(scale);

      return projection;
    }
    // calculate the original d3 projection
    let d3Projection = getD3();

    const path = d3.geoPath()

    const url = "Data/FarmerL.csv";

    const removeSVGContent = (svgSelect) => {
      svgSelect.selectAll('*').remove();
    }

    async function readAndDraw(url, renderDelay){
      // remove all the elements within teh SVG
      removeSVGContent(svg);

      const farmerData = await d3.csv(url);
      const mmData = await d3.csv('Data/Middleman.csv');
      const csData = await d3.csv('Data/ColdStorage.csv');
      const retailData = await d3.csv('Data/Retailer.csv');
      const AVC = await d3.json('Data/AVC.json');

      const unique = (value, index, self) => {
        return index === self.indexOf(value);
      }
      const getUniqVals = (field, data) => data.map(d => d[field]).filter(unique).sort();

      async function readGeoData(url, accessor){
        const geoData = await d3.json(url);
        return topojson.feature(geoData, geoData.objects[accessor]).features;
      }

      const w = window.innerWidth;
      const h = window.innerHeight;

      // farmerData.forEach((d, i) => {
      //   d.lat = +d.Coord_Lat;
      //   d.lng = +d.Coord_Lon;
      // });

      const hex = d3.hexgrid()
        .extent([w, h])
        .geography(AVC)
        .projection(d3Projection)
        .pathGenerator(path)
        //.hexRadius([6]);

      //const hexG = hex(farmerData);
      //const dataPoints = hexG.grid.layout.map(d => d.x);


      const uniqAppTypes = ["Kaja", "Tor Kulu", "Shin Kulu", "Amri", "Mashadi", "Other"];
      const uniqFarmSizes = ["<5 Acres", "5 to 25 Acres", ">25 Acres"];

      const controlDiv = d3.select('div.controls');


      function appendBubbles(data, className, sqrtScaleFactor, color, hex, hexRadius){
        hex.hexRadius([hexRadius]);

        data.forEach((d, i) => {
          d.lat = +d.Coord_Lat;
          d.lng = +d.Coord_Lon;
        });

        const hexgrid = hex(data, ['District', 'AppleTypes', 'FarmSize']);


        const projection = getD3();

        hexgrid.grid.layout.forEach((d, i) => {
          d.lngX = projection.invert([d.x, d.y])[0];
          d.latY = projection.invert([d.x, d.y])[1];
          d.District = d[0] ? d[0].District: null;
        });

        //console.log(hexgrid.grid.layout);

        const hexBubs = svg.append('g')
          .selectAll('.hex')
          .data(hexgrid.grid.layout)
          .enter()
          .append('circle')
          .attr('class', `vcBubble All ${className}`)
          .attr('cx', d => d.x)
          .attr('cy', d => d.y)
          .attr('r', d => {
            return sqrtScaleFactor * Math.sqrt(d.datapoints);
          })
          .attr('radVal', d => {
            return sqrtScaleFactor * Math.sqrt(d.datapoints);
          })
          .style('fill', color)
          .style('fill-opacity', 0.6)
          // .style('stroke', '#212121')
          .style('stroke-width', '1px')
          .style('stroke-opacity', 0.5);

      }

      appendBubbles(farmerData, "Farmer", 2, 'yellow', hex, 6);
      appendBubbles(csData, "ColdStorage", 4, '#1f78b4', hex, 4.5);
      appendBubbles(retailData, "Retailer", 4, '#fb9a99', hex, 6.5);
      appendBubbles(mmData, "Middleman", 4, '#b2df8a', hex, 5);

      // <option value="Farmer">Farmer</option>
      // <option value="Retailer">Retailer</option>
      // <option value="ColdStorage">Cold Storage</option>
      // <option value="Middleman">Middleman</option>

      function bubScale(sqrtScaleFactor){
        return function(num){
          return sqrtScaleFactor * Math.sqrt(num);
        }
      }

      makeNestCircLegend(CSSSelect = 'svg.mapBoxSVG', [400, 40], [5, 25], bubScale(2), 'Farmer', 'white', 30)
      makeNestCircLegend(CSSSelect = 'svg.mapBoxSVG', [500, 40], [2, 12], bubScale(4), ['Middleman', 'Cold-Storage', 'Retailer'], 'white', 30)


      function render() {
        const d3Projection = getD3();
        d3.selectAll('circle.vcBubble')
          .attrs({
                cx: d => d3Projection([d.lngX, d.latY])[0],
                cy: d => d3Projection([d.lngX, d.latY])[1]
              })

      }

      // re-render our visualization whenever the view changes
      map.on("viewreset", function() {
        render()
      })
      map.on("move", function() {
        render()
      })


      // render our initial visualization
      render()
    }

    readAndDraw('Data/FarmerL.csv', 1500);

    const filtObj = {
      District: []
    }

    d3.select('#selectCategory').on('input', function(d, i){
      // initialize and draw with the data from the selected value chain actor
      //readAndDraw(this.value, 500);

      // reset the filter arrays
      //filtObj.district = [];
      //filtObj.date = [];
      const category = this.value;
      const unSelection = d3.selectAll(`circle:not(.${category})`);
      const selection = d3.selectAll(`circle.${category}`);

      selection.transition()
              .duration(500)
              .style('fill-opacity', d => category == "All" ? 0.6 : 0.8);

      unSelection.transition()
              .duration(500)
              .style('fill-opacity', 0.2);

    })

    // filter logic for district level filters
    const filterCircles = (distArr) => {
      svg.selectAll('circle.All')
            .filter(filtFunc(distArr, true))
            .transition()
            .attr('r', 0);


      svg.selectAll('circle.All').filter(filtFunc(distArr, false))
            .transition()
            .attr('r', function(d){
              const radVal = d3.select(this).attr('radVal');
              return +radVal;
            });
    }

    function filtFunc(distArr, negate){
      return function(d, i){
        const distLog = distArr.length == 0 ? 1 : distArr.includes(d.District);

        return negate ? !(distLog) : distLog;
      }
    }

    // event handler for District wise filter

    d3.select('div.mapBoxContain')
      .select('div.checkBoxContain')
      .selectAll('input')
      .on('input', function(d, i){
        const value = this.value;

        if (filtObj.District.includes(value)){
              filtObj.District = filtObj.District.filter(d => d != value);
        }
        else {
          filtObj.District.push(value);
        }
        filterCircles(filtObj.District);
      })

    const sum = (arr) => (arr.length) ? arr.reduce((a, b) => a + b) : 0;
}

drawMBoxHexMap();
