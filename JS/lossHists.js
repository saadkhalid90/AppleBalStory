function drawLossHists(){
  let lossData;

  const margin = {top: 20, right: 30, bottom: 20, left: 100},
        width = 400 - margin.left - margin.right,
        height = 100 - margin.top - margin.bottom,

        widthWM = width + margin.left + margin.right;
        heightWM = height + margin.top + margin.bottom;

  const x = d3.scaleLinear()
              .domain([0, 1])     // can use this instead of 1000 to have the max of data: d3.max(data, function(d) { return +d.price })
              .range([0, width]);

  const y = d3.scaleLinear()
            .range([height, 0]);

  const svg = d3.select('svg.lossHist').append('g')
                .attr('transform', 'translate(50, 100)');

  svg.append('text')
    .attr('class', 'y-axis-title')
    .text('Frequency')
    .attr('x', '-100px')
    .attr('y', '-10px')
    .styles({
      'transform': 'rotate(-90deg)',
      'font-family': "'Roboto', sans-serif"
    })

  svg.append('text')
    .attr('class', 'Title')
    .text('Distribution of Post-harvest Losses as a Proportion of Produce')
    .attr('x', '20px')
    .attr('y', '-60px')
    .styles({
      'text-anchor': 'start',
      'font-family': "'Roboto', sans-serif",
      'font-size': '16px'
    })

  const svg_g = svg
                  .selectAll('g')
                  .data([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12])
                  .enter()
                  .append('g')
                  .attr('id', d=> `id${d}`)
                  .attr('transform', (d, i) => {
                    const xTrans = d > 6 ? 350 : 20;
                    const yJump = d > 6 ? i - 6 : i;
                    return `translate(${xTrans}, ${yJump * (0.8*heightWM)})`;
                  });


  async function readAndDraw(){
    lossData = await d3.csv('Data/Farmer.csv');

    lossDataPishin = lossData.filter(d => d.District == "Pishin");
    lossDataKA = lossData.filter(d => d.District == "Killah Abdullah");
    lossDataKS= lossData.filter(d => d.District == "Killah Saifullah");
    lossDataQuetta = lossData.filter(d => d.District == "Quetta");
    lossDataKalat = lossData.filter(d => d.District == "Kalat");

    lossDataSmall = lossData.filter(d => d.FarmSize == "<5 Acres");
    lossDataMedium = lossData.filter(d => d.FarmSize == "5 to 25 Acres");
    lossDataLarge= lossData.filter(d => d.FarmSize == ">25 Acres");

    lossDataLower = lossData.filter(d => d.altitudeCateg == "Lower (< 1900)");
    lossDataHigher = lossData.filter(d => d.altitudeCateg == "Higher (>= 1900)");


    // define the Histogram function
    const histogram = d3.histogram()
                        .value(function(d) { return +d.lossPerProd; })   // I need to give the vector of value
                        .domain(x.domain())  // then the domain of the graphic
                        .thresholds(x.ticks(20));

    const binsOverall = histogram(lossData);

    const binsSmall = histogram(lossDataSmall);
    const binsMedium = histogram(lossDataMedium);
    const binsLarge = histogram(lossDataLarge);

    const binsLower = histogram(lossDataLower);
    const binsHigher = histogram(lossDataHigher);

    const binsKA = histogram(lossDataKA);
    const binsKS = histogram(lossDataKS);
    const binsPishin = histogram(lossDataPishin);
    const binsQuetta = histogram(lossDataQuetta);
    const binsKalat = histogram(lossDataKalat);

    y.domain([0, d3.max(binsOverall, function(d) { return (d.length/* lossData.length */); })]);


    function appendHist(id, binData, denom, color, textString, xAxis){
      const svgG = svg.select(`g#${id}`);

      svgG.selectAll("rect")
          .data(binData)
          .enter()
          .append("rect")
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + x(d.x0) + "," + y(d.length/ denom) + ")"; })
            .attr("width", d => d.length ? x(d.x1) - x(d.x0) - 1: 0)
            .attr("height", d => height - y(d.length/ denom))
            .style("fill", color);

      svgG.append('text')
        .attr('y', '8px')
        .attr('x', 115)
        .text(textString)
        .styles({
          'font-size': '11px',
          'text-anchor': 'middle',
          'fill': 'black',
          'font-family': "'Roboto Condensed', sans-serif",
          'font-weight': 300
        })

      if (xAxis == true){
        const axis = svgG.append("g")
        .attr('class', 'axisBottom')
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(x));

        axis.append('text')
            .text('Losses as a proportion of Produce')
            .attr('y', '40px')
            .styles({
              'text-anchor': 'start',
              'fill': 'black'
            });
      }
    }

    // appendHist('id1', binsOverall, lossData.length);
    // appendHist('id2', binsSmall, lossDataSmall.length);
    // appendHist('id3', binsMedium, lossDataMedium.length);
    // appendHist('id4', binsLarge, lossDataLarge.length);
    //
    //
    // appendHist('id5', binsKA, lossDataKA.length);
    // appendHist('id6', binsKS, lossDataKS.length);
    // appendHist('id7', binsPishin, lossDataPishin.length);
    // appendHist('id8', binsQuetta, lossDataQuetta.length);

    const colArr = [
      '#beaed4',
      '#386cb0',
      '#f0027f'
    ];

    appendHist('id1', binsOverall, 1, colArr[0], "Overall", false);
    appendHist('id2', binsSmall, 1, colArr[1], "Small Farms", false);
    appendHist('id3', binsMedium, 1, colArr[1], "Medium Farms", false);
    appendHist('id4', binsLarge, 1, colArr[1], "Large Farms", false);
    appendHist('id5', binsLower, 1, "#616161", "Altitude < 1900m", false);
    appendHist('id6', binsHigher, 1, "#616161", "Altitude >= 1900m", true);


    appendHist('id7', binsKA, 1, colArr[2], "Killah Abdullah", false);
    appendHist('id8', binsKS, 1, colArr[2], "Killah Saifullah", false);
    appendHist('id9', binsPishin, 1, colArr[2], "Pishin", false);
    appendHist('id10', binsQuetta, 1, colArr[2], "Quetta", false);
    appendHist('id11', binsKalat, 1, colArr[2], "Kalat", true);

  }

  readAndDraw();
}

drawLossHists();
