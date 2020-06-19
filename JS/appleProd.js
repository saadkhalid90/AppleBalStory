function drawProdSVG(){
    let balDists;
    let projection = d3.geoMercator()
        .center([68, 31.0])
        .scale([150 * 22]);
    let appleBal;

    const width = 700;

    let path = d3.geoPath().projection(projection);
    let svg = d3.select('svg.appleProdSVG');

    async function readAndDraw(){
      balDists = await d3.json('GeoData/BalochistanDist.topojson');
      appleBal = await d3.csv('Data/AppleBaloch.csv')

      let radVar = 'ApplePercProd'
      let valsVar = appleBal.map(d => +d[radVar])
      let maxVar = d3.max(valsVar);
      let colScale = d3.scaleLinear()
        .domain([0, 100000])
        .range(['#eee', '#4A148C']);

      let radScale = d3.scaleSqrt()
        .domain([0, maxVar])
        .range([0, 20]);

      let balMap = topojson.feature(balDists, balDists.objects.BalochistanDist).features;

      svg.append('g')
        .attr('class', 'mapGroup')
        .selectAll('path')
        .data(balMap)
        .enter()
        .append('path')
        .attr('d', d => path(d))
        .style('fill', d => {
          const dist = d.properties['DISTRICT'];
          const val = +getData(appleBal, dist, 'ProductionVolume');
          return val === null ? colScale(0) : (val > 100000 ? colScale(100000) : colScale(val));
        })
        .style('stroke-width', 0);

      // sort AppleBal data - in descending order

      appleBal = appleBal.sort(function(a, b){
        return +b.ApplePercProd - (+a.ApplePercProd);
      })

      svg.append('g')
        .attr('class', 'bubGroup')
        .selectAll('circle.shareBub')
        .data(appleBal)
        .enter()
        .append('circle')
        .attr('class', 'shareBub')
        .attr('cx', d => projection([+d.X, +d.Y])[0])
        .attr('cy', d => projection([+d.X, +d.Y])[1])
        .attr('r', d => radScale(+d[radVar]))
        .style('fill', 'teal')
        .style('fill-opacity', 0.4)
        .style('stroke', '#212121')
        .style('stroke-opacity', 0.9);

      let title = svg.append('text')
                      .attr('class', 'mainTitle')
                      .attr('x', width/2)
                      .attr('y', 18)
                      .text(`Apple production in Balochistan (2016-17)`)
                      .style('font-family', "'Roboto', sans-serif")
                      .style('text-anchor', 'middle');

      let sub_title = svg.append('text')
                      .attr('class', 'subTitle')
                      .attr('x', width/2)
                      .attr('y', 45)
                      .text('Source: Directorate of Crops Reporting Services, Balochistan')
                      .style('font-family', "'Roboto', sans-serif")
                      .style('text-anchor', 'middle');

      makeNestCircLegend(CSSSelect = 'svg', [593, 600], [15, 40, 80], radScale, 'Percent share of Apple among all fruits', 'produced (in Tonnes)');
      drawContLegend(svg, [10, 100], 5000, '100000 or more', [colScale(5000), colScale(100000)], 'black');

      svg.selectAll('circle.shareBub').on('mouseover', function(d, i){
        const datum = d3.select(this).datum();
        const district = datum.District
        const prodVol = datum['ProductionVolume'];
        const applePercProd = datum['ApplePercProd'];

        const eventX = d3.event.x;
        const eventY = d3.event.y;

        d3.select('body').append('div')
                        .classed('tooltip', true)
                        .html(
                          d =>
                          `
                            <p>
                              <span class='varName'>District</span>: <span>${district}</span><br>
                              <span class='varName'>Production</span>: <span>${prodVol} Tonnes</span><br>
                              <span class='varName'>Share</span>: <span>${round2Dec(applePercProd, 1)}%</span>
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

      });

      svg.selectAll('circle.shareBub').on('mouseout', function(d, i){

        d3.select('body')
          .select('div.tooltip')
          .remove();

      })

    }

    function getData(dataSet, district, field){
      const filtData = dataSet.filter(d => d.DISTRICT == district);
      return (filtData.length > 0 ? filtData[0][field] : null)
    }

    function makeNestCircLegend(CSSSelect = 'svg', transformArray, bubArray, bubScale, legendTitle, legendTitle2){
      // appending a legendgroup
      let legendGroup = d3.select('svg')
                       .append('g')
                       .classed('legendGroup', true)
                       .attr('transform', `translate(${transformArray[0]}, ${transformArray[1]})`)

      legendGroup.append('text')
               .text(legendTitle)
               .classed('legendTitle', true)
               .attr('dy', 40)
               .style('font-size', '12px')
               .style('text-anchor', 'middle')
               .style('fill', 'black');

     legendGroup.append('text')
              .text(legendTitle2)
              .classed('legendTitle', true)
              .attr('dy', 60)
              .style('font-size', '12px')
              .style('text-anchor', 'middle')
              .style('fill', 'black');

      let radius = bubScale(d3.max(bubArray));
      // hard code params such as Padding and font size for now
      let legLabelPadding = 5;
      let legLabFontSize = 8;

      const circGroups = legendGroup.selectAll('circle')
               .data(bubArray)
               .enter()
               .append('g')
               .classed('circLegendGroup', true)
               .attr('transform', d => `translate(0, ${radius - bubScale(d)})`);

      circGroups.append('circle')
               .attr('r', d => bubScale(d))
               .style('stroke', 'black')
               .style('fill', 'none')
               .style('stroke-width', '1px');

      circGroups.append('text')
               .text(d => d)
               .attr('dx', radius + legLabelPadding)
               .attr('dy', d => -(bubScale(d) - legLabFontSize/2))
               .style('fill', 'black')
               .style('font-size', `${legLabFontSize}px`)
               .style('font-family', 'Open Sans')
    }

    function drawContLegend(selector, position, minScale, maxScale, colorArr, textCol) {

        let rectWidth = 150;
        let rectHeight = 10;

        let barG = selector.append('g')
                            .attr('transform', `translate(${position[0]}, ${position[1]})`)
                            .classed('legendGroup', true);



        var linGrad = barG.append("defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "100%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");

        linGrad.append("stop")
            .attr("offset", "0%")
            .attr("stop-color", colorArr[0])
            .attr("stop-opacity", 1);

        // linGrad.append("stop")
        //     .attr("offset", "50%")
        //     .attr("stop-color", 'white')
        //     .attr("stop-opacity", 1);

        linGrad.append("stop")
            .attr("offset", "100%")
            .attr("stop-color", colorArr[1])
            .attr("stop-opacity", 1);

        barG.append('rect')
            .attr('width', rectWidth)
            .attr('height', rectHeight)
            .attr('rx', 2)
            .attr('ry', 2)
            .style("fill", "url(#gradient)")
        //.style('stroke', '#212121')
        //  .style('stroke-width', '0.5px')

        barG.selectAll('text')
            .data([minScale, maxScale])
            .enter()
            .append('text')
            .text((d, i) => d)
            .attr('transform', (d, i) => i == 0 ? `translate(0, 24)` : `translate(${(i * 150)}, 24)`)
            .style('text-anchor', 'start')
            .style('fill', textCol)
            .style('font-size', '10px');

        let legendTitle = barG.append('text')
                              .text('Production Volume (tonnes)')
                              .attr('transform', 'translate(' + 0 + ',' + (-10) + ')')
                              .style('fill', textCol)
                              .style('font-size', '14px');

    }

    function round2Dec(number, digits){
      return Math.round(number * 10**digits)/(10**digits);
    }

    readAndDraw();
}

drawProdSVG();
