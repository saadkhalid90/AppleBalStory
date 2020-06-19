function drawTrainBars(){
  async function readAndDraw(){
    const data = await d3.csv('Data/Training.csv');
    console.log(data);

    const margin = {
      top: 60,
      bottom:50,
      left:50,
      right: 20
    }

    // laying out dimensions
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    // defining scales
    const x = d3.scaleBand()
                .range([ 0, width ])
                .domain(data.map(function(d) { return d.District; }))
                .padding(0.2);

    const y = d3.scaleLinear()
                    .domain([20,0])
                    .range([0, height]);

    const svg = d3.select('svg.barsTrain')
                  .append('g')
                  .attr('class', 'barsGrp')
                  .attr('transform', `translate(${margin.left}, ${margin.top})`);


    svg.append('text')
      .text('Proportion of Apple Farmers who Received Training')
      .attr('x', width/2)
      .attr('y', -40)
      .style('text-anchor', 'middle');

    const xAxis = svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .attr("class", "axis x")
        .call(d3.axisBottom(x))


    xAxis.selectAll("text")
        .style("text-anchor", "middle");

    const yAxis = svg.append("g")
        .attr("class", "axis y")
        .call(d3.axisLeft(y).ticks(5));

    const yGrid = svg.append("g")
        .attr("class", "grid")
        .call(d3.axisLeft(y).ticks(5).tickSize(-width).tickFormat(""));


    const xAxisLab = xAxis.append('text')
        .text('District')
        .attr('x', width/2)
        .attr('y', '40px')
        .style('fill', 'black')
        .style('font-size', '14px')
        .style('text-anchor', 'middle');

    const yAxisLab = yAxis.append('text')
        .text('Percent')
        .attr('x', -height)
        .attr('y', '-30px')
        .style('fill', 'black')
        .style('font-size', '12px')
        .style('transform', 'rotate(-90deg)')
        .style('text-anchor', 'start');

        // Bars
    svg.selectAll("mybar")
      .data(data)
      .enter()
      .append("rect")
        .attr("x", function(d) { return x(d.District); })
        .attr("height", 0)
        .attr("y", height)
        .attr("width", x.bandwidth())
        .attr("fill", d => d.District == "Overall" ? "#6200EE" : "#69b3a2")
        .transition()
        .duration(750)
        .attr("height", function(d) { return height - y(d.Percentage); })
        .attr("y", function(d) { return y(d.Percentage); })

    svg.selectAll("text.barLabel")
      .data(data)
      .enter()
      .append("text")
        .attr('class', 'barLabel')
        .attr("x", function(d) { return x(d.District) + x.bandwidth()/2; })
        .attr("y", function(d) { return y(d.Percentage) - 10; })
        .attr("width", x.bandwidth())
        .text(d => d.Percentage)
        .attr("fill", d => "grey")
        .style('text-anchor', "middle")
        .style('font-size', "12px")
        .style('fill-opacity', 0)
        .transition()
        .delay(750)
        .duration(250)
        .style('fill-opacity', 1);
  }

  readAndDraw();
}

drawTrainBars();
