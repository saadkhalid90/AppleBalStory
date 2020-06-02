function drawDrought(){
    let balDists;
    let intensity;
    let projection = d3.geoMercator()
        .center([68, 30.5])
        .scale([150 * 22]);

    let path = d3.geoPath().projection(projection);
    let svg = d3.select('svg.droughtSVG');

    const title = svg.append('text')
                    .text('Intensity of Drought across Balochistan (District Level Categorization)')
                    .attrs({
                      class: 'Title',
                      x: 350,
                      y: 25
                    })
                    .styles({
                      'text-anchor': 'middle',
                      fill: 'black',
                      "font-family": "'Roboto', sans-serif",
                      'font-size': '20px'
                    });


    const subTitle = svg.append('text')
                    .text('Source: Drought Risk Assessment in Balochistan, UNDP and Government of Balochistan')
                    .attrs({
                      class: 'Title',
                      x: 350,
                      y: 50
                    })
                    .styles({
                      'text-anchor': 'middle',
                      fill: 'black',
                      "font-family": "'Roboto', sans-serif",
                      'font-size': '14px'
                    })

    let colScale = d3.scaleOrdinal()
                    .domain([
                      'Mild',
                      'Mild and Moderate',
                      'Moderate'
                    ])
                    .range([
                      '#fecc5c',
                      '#fd8d3c',
                      '#f03b20'
                    ]);

    let surveyDists = ['KILLA ABDULLAH', 'KILLA SAIFULLAH', 'PISHIN', 'QUETTA', 'KALAT'];

    let labels = [
      {District: 'Kalat', Coord: [400, 380], fontSize: 17},
      {District: 'Quetta', Coord: [405, 310], fontSize: 15},
      {District: 'Killa Saifullah', Coord: [501, 253], fontSize: 18},
      {District: 'Killa Abdullah', Coord: [365, 265], fontSize: 15},
      {District: 'Pishin', Coord: [440, 277], fontSize: 16},
    ]

    async function readAndDraw(){
      // reading in the topojson
      balDists = await d3.json('GeoData/BalochistanDist.topojson');
      intensity = await d3.csv('Data/droughtIntensity.csv');
      const intenseObj = {}

      for (i = 0; i < intensity.length ; i++){
        intenseObj[intensity[i].DISTRICT] = intensity[i].Intensity;
      }

      // extracting data from the read in topojson
      let balMap = topojson.feature(balDists, balDists.objects.BalochistanDist).features;

      // append a map given the topojson
      svg.append('g')
        .attr('class', 'mapGroup')
        .selectAll('path')
        .data(balMap)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .attr('class', d => surveyDists.includes(d.properties.DISTRICT) ? 'survey' : 'nonsurvey')
        .style('fill', d => {
          const dist = d.properties.DISTRICT;
          return colScale(intenseObj[dist]);
        })
        .style('stroke', d => {
          const dist = d.properties.DISTRICT;
          return surveyDists.includes(dist) ? '#212121' : 'none'
        })
        .style('stroke-width', '0px');

      svg.select('g').selectAll('path.survey').raise();

      svg.selectAll('text.label')
        .data(labels)
        .enter()
        .append('text')
        .text(d => d.District)
        .attrs({
          class: 'label',
          x: d => d.Coord[0],
          y: d => d.Coord[1] - 32
        })
        .styles(
          {
            fill: "black",
            "text-anchor": 'middle',
            "font-family": "'Roboto Condensed', sans-serif",
            'font-weight': 400,
            'font-size': d => `${d.fontSize}px`
          }
        )

      svg.append("g")
        .attr("class", "legendOrdinal")
        .attr("transform", "translate(550,550)")
        .styles({
          "font-family": "'Roboto', sans-serif",
          'font-weight': 400,
          'font-size': d => `12px`
        });

      var legendOrdinal = d3.legendColor()
        //d3 symbol creates a path-string, for example
        //"M0,-8.059274488676564L9.306048591020996,
        //8.059274488676564 -9.306048591020996,8.059274488676564Z"
        .shapePadding(2)
        //use cellFilter to hide the "e" cell
        .scale(colScale);

      svg.select(".legendOrdinal")
        .call(legendOrdinal);
    }



    readAndDraw();
}

drawDrought();
