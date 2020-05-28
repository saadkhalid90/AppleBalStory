function drawAppTypes(){
    const projection = d3.geoMercator()
        .center([70.5, 30.0])
        .scale([150 * 30]);

    const path = d3.geoPath().projection(projection);
    const svg = d3.select('svg.appTypeSVG');
    const width = 650;
    const height = 650;

    let colScaleCont = d3.scaleSequential(d3.interpolatePuOr)
        .domain([100, 0]);

    const DistLabels =[
      {District: "Killah Saifullah", coordinates: [321, 147]},
      {District: "Killah Abdullah", coordinates: [130, 188]},
      {District: "Pishin", coordinates: [228, 181]},
      {District: "Quetta", coordinates: [140, 260]},
      {District: "Kalat", coordinates: [157, 391]},
    ];

    let qualCols = [
      '#7fc97f',
      '#beaed4',
      '#fdc086',
      '#ffff99',
      '#386cb0'
    ];



    async function readAndDraw(){

      const appType = 'Kaja';
      // read in AppleTypes data and ge data
      const appTypes = (await d3.csv('Data/TehsilAppTypes.csv')).sort((a, b) => b.n_obs - a.n_obs);
      const appleVC = await d3.json('GeoData/AppleVC.topojson');


      const maxObs = d3.max(appTypes.map(d => +d.n_obs));
      const maxRadius = 15;

      const radScale = d3.scaleSqrt()
                        .domain([0, maxObs])
                        .range([0, maxRadius]);

      // using topojson to get individual district data
      const appDists = topojson.feature(appleVC, appleVC.objects.AppleVC).features;

      const districts = appTypes.map(d => d['District']);

      let colScale = d3.scaleOrdinal()
                      .domain(districts)
                      .range(qualCols);

      svg
        .append('g')
        .attr('class', 'mapPaths')
        .selectAll('path')
        .data(appDists)
        .enter()
        .append('path')
        .attr('class', 'region tehsil')
        .attr('d', d => path(d))
        .style('fill', d => colScale(d.properties.DISTRICT))
        //.style('fill', 'e0e0e0')
        .style('fill-opacity', .3);

      svg
        .append('g')
        .attr('class', 'distLabels')
        .selectAll('text')
        .data(DistLabels)
        .enter()
        .append('text')
        .attr('class', 'distLabel')
        .attr('x', d => d.coordinates[0])
        .attr('y', d => d.coordinates[1])
        .text(d => d.District)
        .style('text-anchor', 'middle')
        .style('fill', '#212121');

      svg
        .append('g')
        .attr('class', 'bubGroup')
        .selectAll('circle')
        .data(appTypes)
        .enter()
        .append('circle')
        .attr('class', d => 'n_obs ' + d['Tehsil'])
        .attr('cx', d => projection([+d.X, +d.Y])[0])
        .attr('cy', d => projection([+d.X, +d.Y])[1])
        .attr('r', d => radScale(+d.n_obs))
        .style('fill', d => colScaleCont(d[appType]))
        //.style('fill', 'teal')
        .style('fill-opacity', 0.8)
        .style('stroke', '#212121')
        .style('stroke-opacity', 0.7);

      const titleGrp = svg
          .append('g')
          .attr('class', 'titles-and-shit');

      titleGrp.append('text')
          .attr('class', 'title')
          .text(`Proportion of '${appType}' apple grown`)
          .attr('x', 250)
          .attr('y', 30)
          .style('text-anchor', 'middle');

      titleGrp.append('text')
          .attr('class', 'sub-title')
          .text('Across surveyed Tehsils (source: PAFAID survey)')
          .attr('x', 250)
          .attr('y', 48)
          .style('text-anchor', 'middle');

      // append a nested circle legend
      makeNestCircLegend(CSSSelect = 'svg.appTypeSVG', [400, 400], [10, 40, 100], radScale, 'Survey Observations');
      drawContLegend(
        svg,
        [345, 325], 0, 100,
        [colScaleCont(0), colScaleCont(100)],
        'black',
        `Percentage of ${appType} apple`
      );


      // call the append interaction Voronoi function
      const vorCircs = appendIntVoronoi(
        {
          x: d => projection([+d.X, +d.Y])[0],
          y: d => projection([+d.X, +d.Y])[1]
        },
        {
          x: d => projection([+d.X, +d.Y])[0],
          y: d => projection([+d.X, +d.Y])[1]
        },
        [
          [0, 0],
          [500, 500]
        ],
        svg,
        appTypes,
        18
      );

      vorCircs.on('mouseover', mouseO(true));
      vorCircs.on('mouseout', mouseO(false));

      function mouseO(over){
        return function(d, i){
          const elem = d3.select(this);

          let type;

          const select = document.getElementById("AppleTypes");
          type = select.options[select.selectedIndex].value;
          let value = Math.round(+d[type])
          // append title

          const datum = elem.datum();
          const TehsilName = d.Tehsil;

          const eventX = d3.event.x;
          const eventY = d3.event.y;


          if (over){
            d3.select('div.appTypeContain').append('div')
                            .classed('tooltip', true)
                            .html(
                              d =>
                              `
                                <p>
                                  <span class='varName'>Tehsil</span>: <span>${TehsilName}</span><br>
                                  <span class='varName'>Proportion</span>: <span>${value}%</span>
                                </p>
                              `
                            )
                            .styles({
                              position: 'fixed',
                              width: '150px',
                              left: `${eventX - 60}px`,
                              top: `${eventY + 15}px`,
                              background: '#eee',
                              'border-color': '#212121',
                              opacity: 0.9,
                              'font-family': "'Roboto', sans-serif",
                              'font-size': '13px'
                            })
          }

          else {
            d3.select('div.appTypeContain').select('div.tooltip').remove();
          }



          const filt = d3.selectAll('circle.n_obs')
                        .filter(d => d.Tehsil == TehsilName)

          const unFilt = d3.selectAll('circle.n_obs')
                        .filter(d => d.Tehsil != TehsilName);

          filt.transition()
              .duration(100)
              .style('fill-opacity', d => over ? 0.9 : 0.8)
              .style('stroke-width', d => over ?'2px' : '1px')
              .style('stroke-opacity', d => over ? 1 : 0.7);

          unFilt.transition()
              .duration(100)
              .style('fill-opacity', d => over ? 0.6 : 0.8)
              .style('stroke-width', d => over ?'1px' : '1px')
              .style('stroke-opacity', d => over ? 0.7 : 0.7);
        }
      }

    }

    readAndDraw();

    function updateAppType(svgSelect, type, transDur){
      const tehsilCircs = svgSelect.select('g.bubGroup')
        .selectAll('circle')

      tehsilCircs.transition()
        .duration(transDur)
        .style('fill', d => colScaleCont(d[type]))

      // update title
      svgSelect.select('text.title').text(`Proportion of '${getSpacedName(type)}' apple grown`)
      // update legend title
      svgSelect.select('g.contLegGroup').select('text.legendTitle').text(`Percentage of ${getSpacedName(type)} apple`)
    }

    d3.select('.appTypeControl').select('select#AppleTypes')
      .on('input', function(d, i){
        updateAppType(d3.select('svg.appTypeSVG'), this.value, 500);
      })

    function getSpacedName(name){
      switch (name) {
        case 'TorKolu':
          return 'Tor Kolu';
          break;
        case 'ShinKulu':
          return 'Shin Kulu';
          break;
        default:
          return name;
          break;
      }
    }

    function getPxAttr(selection, attribute){
      return +selection.attr(attribute).replace('px', '')
    }

}

drawAppTypes();
