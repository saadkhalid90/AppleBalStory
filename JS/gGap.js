function drawGenderGap(){
  async function readAndDraw(){
    const GGap = await d3.csv('Data/GenderGap.csv');
    const svg = d3.select('svg.genderGap');
    const margins = {
      top: 100,
      bottom: 10,
      left: 20,
      right: 20
    }

    const effWidth = 600 - margins.left - margins.right;
    const effHeight = 500 - margins.top - margins.bottom;
    const barHeight = 25;
    const gGapVals = GGap.map(d => +d.GenderGap);
    const maxGGapVals = d3.max(gGapVals);

    const barScale = d3.scaleLinear()
                        .domain([0, maxGGapVals])
                        .range([0, 0.8*effWidth]);

    const svgG = svg.append('g')
              .classed('barsGrp', true)
              .attr('transform', `translate(${margins.left}, ${margins.top})`);

    //appendTitle

    svg.append('text')
      .attr('class', 'title')
      .text('Hourly Wage Gender Gap')
      .attrs({
        x: 300,
        y: 25
      })
      .styles({
        fill: 'black',
        'text-anchor': 'middle',
        'font-family': "'Roboto', sans-serif",
        'font-size':  '20px'
      });

    svg.append('text')
      .attr('class', 'subtitle')
      .text('Top 10 ranked countries (source: ILO 2018-19)')
      .attrs({
        x: 300,
        y: 45
      })
      .styles({
        fill: 'black',
        'text-anchor': 'middle',
        'font-family': "'Roboto', sans-serif",
        'font-size':  '12px'
      });

    const barGrp = svgG.selectAll('g.barGrp')
                      .data(GGap)
                      .enter()
                      .append('g')
                      .attrs({
                        class: 'barGrp',
                        transform: (d, i) => `translate(${effWidth/ 2}, ${i * barHeight})`
                      })


    const bars = barGrp
        .append('rect')
        .attrs({
          x: d => -barScale(+d.GenderGap)/2,
          y: 0,
          height: barHeight - 5,
          width: d => barScale(+d.GenderGap)
        })
        .styles({
          fill: d => (['Pakistan', 'World Avg'].includes(d.Country) ? '#DF4F57' : '#E0E0E0')
        });

    const barLabels = barGrp
        .append('text')
        .attrs({
          x: 0,
          y: d=> ['Pakistan', 'World Avg'].includes(d.Country) ? barHeight - 10 : barHeight - 11
        })
        .text(d => `${d.Country} - ${d.GenderGap}%`)
        .styles({
          fill: d => ['Pakistan', 'World Avg'].includes(d.Country) ? 'white' : 'grey',
          'text-anchor': 'middle',
          'font-family': "'Roboto', sans-serif",
          'font-size':  d=> ['Pakistan', 'World Avg'].includes(d.Country) ? '14px' : '11px'
        });

    barGrp.filter(d => ['Pakistan'].includes(d.Country))
          .append('path')
          .attrs({
            class: 'icon',
            d: manPath,
            transform: d=> `translate(${+barScale(+d.GenderGap)/2}, -30) scale(0.75)`
          })
          .style('fill', d3.rgb('#DF4F57'));

    barGrp.filter(d => ['Pakistan'].includes(d.Country))
          .append('path')
          .attrs({
            class: 'icon',
            d: womanPath,
            transform: d=> `translate(${-barScale(+d.GenderGap)/1.5}, -30) scale(0.8)`
          })
          .style('fill', d3.rgb('#DF4F57'));

  }

  readAndDraw();


  const manPath = "M40.6549525,20.9001656 L60.0762813,20.9001656 C61.0447863,20.9001656 61.7885392,21.3179263 62.0795262,21.5368949 C65.7024143,24.2631295 68.1443145,28.034951 69.4052267,32.9668276 C70.6741953,37.9302157 71.3258558,46.3324993 71.360208,58.1736784 C71.3656711,60.0495324 69.8494026,61.5746241 67.9735486,61.5800661 C66.0895917,61.5800804 64.5639525,60.0729582 64.5410681,58.1989947 C64.4403549,49.952036 64.2038898,44.2990787 63.8316697,41.240123 C63.5534638,38.9537889 63.0402213,36.8082583 62.2919422,34.8035311 C62.1814356,34.5074709 61.851848,34.35705 61.5557877,34.4675566 C61.3320323,34.551075 61.183688,34.7647868 61.183688,35.0036211 L61.1837091,94.9150106 C61.1837091,97.7233727 58.9070819,100 56.0987198,100 C53.2903577,100 51.0137304,97.7233727 51.0137304,94.9150106 L51.0137304,57.0600899 C51.0137304,56.4360094 50.5078132,55.9300922 49.8837328,55.9300922 C49.2596523,55.9300922 48.7537352,56.4360094 48.7537352,57.0600899 L48.7537352,94.9150106 C48.7537352,97.7233727 46.4771079,100 43.6687458,100 C40.8603837,100 38.5837564,97.7233727 38.5837564,94.9150106 L38.5837271,34.9848762 C38.5837271,34.7328753 38.37944,34.5285882 38.1274391,34.5285882 C37.9368276,34.5285882 37.7663003,34.647074 37.6998109,34.825713 C36.9560178,36.8240827 36.4455313,38.9622194 36.1683512,41.240123 C35.7961311,44.2990787 35.5596661,49.952036 35.4589528,58.1989947 C35.4360684,60.0729582 33.9104292,61.5800804 32.036326,61.5800804 C30.1506183,61.5746241 28.6343498,60.0495324 28.6397919,58.1736784 C28.6741651,46.3324993 29.3258256,37.9302157 30.5947942,32.9668276 C31.9311811,27.7397427 34.5941685,23.8157446 38.5837564,21.1948333 C38.8870175,20.9983881 39.5774162,20.9001656 40.6549525,20.9001656 Z M49.8837328,19.2099598 C44.5790489,19.2099598 40.2787529,14.9096638 40.2787529,9.6049799 C40.2787529,4.30029598 44.5790489,0 49.8837328,0 C55.1884167,0 59.4887127,4.30029598 59.4887127,9.6049799 C59.4887127,14.9096638 55.1884167,19.2099598 49.8837328,19.2099598 Z"

  const womanPath = "M61.852,27.517c-0.625-0.886-1.641-1.408-2.723-1.408H41.95c-1.082,0-2.098,0.522-2.723,1.408   c-6.035,8.568-9.286,18.791-9.303,29.268c-0.005,1.844,1.483,3.339,3.323,3.339c1.843,0.007,3.338-1.487,3.34-3.322   c0.007-5.732,1.135-11.41,3.3-16.713c0.085-0.203,0.286-0.335,0.509-0.335c0.3,0,0.546,0.243,0.546,0.546v4.345l-4.601,21.204   h4.601v22.658c0,2.151,1.749,3.897,3.902,3.897c2.161,0,3.907-1.746,3.907-3.897V65.848h3.575v22.658   c0,2.151,1.751,3.897,3.904,3.897c2.156,0,3.907-1.746,3.907-3.897V65.848h4.601l-4.601-21.028v-4.521   c0-0.222,0.134-0.422,0.34-0.509c0.276-0.116,0.6,0.021,0.715,0.298c2.17,5.303,3.291,10.98,3.303,16.713   c0,1.835,1.492,3.329,3.34,3.322c1.837,0,3.323-1.495,3.318-3.339C71.138,46.308,67.89,36.085,61.852,27.517z  M58.61,14.036c0-4.354-3.536-7.887-7.892-7.887c-4.357,0-7.887,3.533-7.887,7.887   c0,4.36,3.529,7.894,7.887,7.894C55.074,21.93,58.61,18.396,58.61,14.036L58.61,14.036z"
}

drawGenderGap();
