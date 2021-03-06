let f = d3.format(',.1f');

d3.csv('data.csv')
  .then(function (data) {
    data.reverse();
    
    for (var i = 0; i < data.length; i++) {
      let d = data[i];

      buildUnits(d);
    }

    let str = `<div class="left" style="height: 60px;">
              <svg><circle r="20" cy="20" cx="20" fill="#eee"></circle></svg>
              </div>
              <div class="right">
              Representatioanl Mass <br />
              (x-small, small, med, large, x-large) <br />
              (pounds)
              </div>
              <div class="left" style="height: 40px;">
              <img src="images/bpm.png">
              </div>
              <div class="right" style="padding-top: 5px;">
              Heart Rate (bpm)
              </div>
              <div class="left">
              <svg><rect width="40" x="0" y="3" height="10px" fill="red"></rect></svg>
              </div>
              <div class="right">
              Longevity (years)
              </div>`;

    d3.select('#viz')
      .append('div')
      .attr('class', 'col legend')
      .html(str);
    
  })
  .catch(function (error) {
    console.log('There\'s an error');
  })

function buildUnits(d) {

  let unit = d3.select('#viz')
    .append('div')
    .attr('class', `col ${d.ImageName}`);

  let margin = { top: 60, right: 30, bottom: 20, left: 70 },
    width = 340 - margin.left - margin.right, //TODO get size on resize
    height = 225 - margin.top - margin.bottom;

  let svgRoot = unit.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)

  let mask = svgRoot
    .append('defs')
    .append('clipPath')
    .attr('id', `mask-${d.ImageName}`)
    .append('rect')
    .attr('x', 0)
    .attr('y', margin.top)
    .attr('width', 220)
    .attr('height', 90);

  let svg = svgRoot.append('g')
    .attr('transform',
      'translate(' + margin.left + ',' + margin.top + ')');

  buildMass(svg, d.Mass);

  svg.append('foreignObject')
    .attr('x', 0)
    .attr('y', 5)
    .attr('width', 20)
    .attr('height', 20)
    .append('xhtml:div')
    .append('img')
    .attr('src', `images/${d.ImageName}.png`)
    .attr('height', 20)
    .attr('width', 20);

  svg.append('text')
    .text(d.Creature)
    .attr('x', 30)
    .attr('y', 20)
    .style('font-family', 'Georgia')
    .style('font-size', '18px');

  svg.append('text')
    .text(`${f(d.Mass / 453.592)} lbs`)
    .attr('x', 0)
    .attr('y', 50)
    .style('font-family', '"Source Sans Pro", sans-serif')
    .style('font-size', '12px');

  buildHR(svg, d.BPM, d.ImageName);
  buildLongevity(svg, d.Longevity);
}

function buildMass(svg, mass) {
  let margin = { top: 60, right: 30, bottom: 0, left: 0 },
    width = 340 - margin.left - margin.right,
    height = 90 - margin.top - margin.bottom;

  svg.append('circle')
    .attr('cx', (d) => {
      if (mass < 1500) {
        return 5;
      } else if (mass >= 1500 && mass < 5000) {
        return 15;
      } else {
        return 30;
      }
    })
    .attr('cy', 45)
    .attr('r', (d) => {
      if (mass < 1500) {
        return 10;
      } else if (mass >= 1500 && mass < 5000) {
        return 20;
      } else if (mass >= 5000 && mass < 10000) {
        return 40;
      } else if (mass >= 10000 && mass < 200000) {
        return 60;
      } else if (mass >= 200000 && mass < 5000000) {
        return 80;
      } else {
        return 100;
      }
    })
    .attr('fill', '#eee');
}

function buildHR(svg, bpm, className) {
  let margin = { top: 50, right: 30, bottom: 0, left: 0 },
    width = 240 - margin.left - margin.right,
    height = 90 - margin.top - margin.bottom;

  let data = [
    {
      x: 0,
      y: 0.4
    }
  ];

  const zoom = 20;
  const scale = 2;
  const innerDelta = 0.01;
  /* Count is the number of beats that fill up the visible width. */
  let count = Math.ceil(bpm / zoom) * scale;
  /* Delta is the distance between each beat. */
  let delta = 1 / (Math.floor(bpm / zoom) + 1);

  for (let i = 0; i < count; i++) {
    let startX = delta * (i + 0);

    data.push({
      x: startX - (innerDelta * 0),
      y: 0.4
    });

    data.push({
      x: startX + (innerDelta * 1),
      y: 0.6
    });

    data.push({
      x: startX + (innerDelta * 2),
      y: 0.4
    });

    data.push({
      x: startX + (innerDelta * 3),
      y: 0.8
    });

    data.push({
      x: startX + (innerDelta * 4),
      y: 0.2
    });

    data.push({
      x: startX + (innerDelta * 5),
      y: 0.4
    });
  }

  let lastX = delta * count;

  data.push({
    x: lastX,
    y: 0.4
  });

  let x = d3.scaleTime().range([0, width]);
  let y = d3.scaleLinear().range([height, 0]);

  let valueline = d3.line()
    .x(d => x(d.x))
    .y(d => y(d.y))
    .curve(d3.curveMonotoneX);

  x.domain([0, 1]);
  y.domain([0, 1]);

  let hrGroup = svg.append('g')
    .attr('class', 'hr-group')
    .attr('clip-path', `url(#mask-${className})`);

  hrGroup.append('path')
    .data([data])
    .attr('class', `line ${className}-1`)
    .attr('d', valueline)
    .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

  let animStartX = margin.left + (width * lastX);
  let animEndX = margin.left - (width * lastX);

  hrGroup.append('path')
    .data([data])
    .attr('class', `line ${className}-2`)
    .attr('d', valueline)
    .style('transform', `translate(${margin.left}px, ${margin.top}px)`);

  svg.append('text')
    .text(`${bpm} bpm`)
    .attr('x', 225)
    .attr('y', 77)
    .style('font-family', '"Source Sans Pro", sans-serif')
    .style('font-size', '12px');

  anime({
    easing: 'linear',
    targets: `path.${className}-1`,
    translateX: `-=${width * lastX}px`,
    duration: (60000 * scale) / zoom,
    complete: function (anim) {
      anime({
        easing: 'linear',
        targets: `path.${className}-1`,
        translateX: [`${animStartX}px`, `${animEndX}px`],
        duration: (120000 * scale) / zoom,
        loop: true
      });
    }
  });

  anime({
    easing: 'linear',
    targets: `path.${className}-2`,
    translateX: [`${animStartX}px`, `${animEndX}px`],
    duration: (120000 * scale) / zoom,
    loop: true
  });
}

function buildLongevity(svg, longevity) {
  let margin = { top: 95, right: 30, bottom: 0, left: 0 },
    width = 240 - margin.left - margin.right,
    height = 90 - margin.top - margin.bottom;

  let g = svg.append('g')
    .attr('class', 'longevity')
    .attr('width', width)
    .attr('height', height);

  let linearScale = d3.scaleLinear()
    .domain([0, 80]) //largest longevity value
    .range([0, width])

  rect = g.append('rect')
    .attr('x', 0)
    .attr('y', margin.top)
    .attr('width', linearScale(longevity))
    .attr('height', 10)
    .attr('fill', 'red');

  svg.append('text')
    .text(`${longevity} yrs`)
    .attr('x', linearScale(longevity) + 15)
    .attr('y', margin.top + 10)
    .style('font-family', '"Source Sans Pro", sans-serif')
    .style('font-size', '12px');
}