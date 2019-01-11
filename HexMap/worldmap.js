document.getElementById("default").click();
var chart = ['pess_percent', 'inc_percent', 'friend_percent']
var radios = d3.select('.panel.left').selectAll('input[name="button"]').data(chart);
var barChartLabel = null;
var svgAxeY = null;
var yAxis = null;
var yScale = null;
var yAxis = null;
var yAxisGroup = null;
d3.selectAll("label")
    .data(chart)
    .append("text")
    .text(function (d) {
        return d;
    })
    .style("font-family", "Calibri")
    .style("font-size", 18);
// configuration
var colorVariable = 'pess_percent';
const geoIDVariable = 'id';
const format = d3.format(',');

// Set tooltips
var tip = d3.tip()
    .attr('class', 'd3-tip')
    .offset([-10, 0])
    .html(d => `<strong>Pays: </strong><span class='details'>${d.properties.name}<br></span><strong>Migrant: </strong><span class='details'>${format(d[colorVariable])} % des migrants mondiaux</span>`);


tip.direction(function (d) {
    if (d.properties.name === 'Antarctica') return 'n';
    // Americas
    if (d.properties.name === 'Greenland') return 's';
    if (d.properties.name === 'Canada') return 'e';
    if (d.properties.name === 'USA') return 'e';
    if (d.properties.name === 'Mexico') return 'e';
    // Europe
    if (d.properties.name === 'Iceland') return 's';
    if (d.properties.name === 'Norway') return 's';
    if (d.properties.name === 'Sweden') return 's';
    if (d.properties.name === 'Finland') return 's';
    if (d.properties.name === 'Russia') return 'w';
    // Asia
    if (d.properties.name === 'China') return 'w';
    if (d.properties.name === 'Japan') return 's';
    // Oceania
    if (d.properties.name === 'Indonesia') return 'w';
    if (d.properties.name === 'Papua New Guinea') return 'w';
    if (d.properties.name === 'Australia') return 'w';
    if (d.properties.name === 'New Zealand') return 'w';
    // otherwise if not specified
    return 'n';
})

tip.offset(function (d) { // [top, left]
    if (d.properties.name === 'Antarctica') return [0, 0];
    // Americas
    if (d.properties.name === 'Greenland') return [10, -10];
    if (d.properties.name === 'Canada') return [24, -28];
    if (d.properties.name === 'USA') return [-5, 8];
    if (d.properties.name === 'Mexico') return [12, 10];
    if (d.properties.name === 'Chile') return [0, -15];
    // Europe
    if (d.properties.name === 'Iceland') return [15, 0];
    if (d.properties.name === 'Norway') return [10, -28];
    if (d.properties.name === 'Sweden') return [10, -8];
    if (d.properties.name === 'Finland') return [10, 0];
    if (d.properties.name === 'France') return [-9, 66];
    if (d.properties.name === 'Italy') return [-8, -6];
    if (d.properties.name === 'Russia') return [5, 385];
    // Africa
    if (d.properties.name === 'Madagascar') return [-10, 10];
    // Asia
    if (d.properties.name === 'China') return [-16, -8];
    if (d.properties.name === 'Mongolia') return [-5, 0];
    if (d.properties.name === 'Pakistan') return [-10, 13];
    if (d.properties.name === 'India') return [-11, -18];
    if (d.properties.name === 'Nepal') return [-8, 1];
    if (d.properties.name === 'Myanmar') return [-12, 0];
    if (d.properties.name === 'Laos') return [-12, -8];
    if (d.properties.name === 'Vietnam') return [-12, -4];
    if (d.properties.name === 'Japan') return [5, 5];
    // Oceania
    if (d.properties.name === 'Indonesia') return [0, -5];
    if (d.properties.name === 'Papua New Guinea') return [-5, -10];
    if (d.properties.name === 'Australia') return [-15, 0];
    if (d.properties.name === 'New Zealand') return [-15, 0];
    // otherwise if not specified
    return [-10, 0];
})

/*TODO si écran nul
d3.select('body')
    .style('overflow', 'hidden');*/

const parentWidth = d3.select('body').node().getBoundingClientRect().width;
const marginWm = {top: 0, right: 0, bottom: 0, left: 0};
const widthWm = 960 - marginWm.left - marginWm.right;
const heightWm = 500 - marginWm.top - marginWm.bottom;

let firstBarChartDrawn = false;

const svgWm = d3.select("#worldmap")
    .append('svg')
    .attr('width', widthWm)
    .attr('height', heightWm)
    .append('g')
    .attr('class', 'map');

const projectionWm = d3.geoRobinson()
    .scale(148)
    .rotate([352, 0, 0])
    .translate([widthWm / 2, heightWm / 2]);

const pathWm = d3.geoPath().projection(projectionWm);

svgWm.call(tip);

queue()
    .defer(d3.json, 'world_countries.json')
    .defer(d3.tsv, 'world_population.tsv')
    .await(ready);


function ready(error, geography, data) {

    let m = d3.max(data, function(d) {return Math.max(d.pess_percent, d.inc_percent, d.friend_percent);});

    const color = d3.scaleLinear()
        .domain([0, m/2, m])
        .range([d3.rgb("#fff25f"),
            d3.rgb("#fd7d1c"),
            d3.rgb('#b30000')]);


    data.forEach(d => {
        d[colorVariable] = Number(d[colorVariable].replace(',', ''));
    })

    const colorVariableValueByID = {};

    data.forEach(d => {
        colorVariableValueByID[d[geoIDVariable]] = d[colorVariable];
    });
    geography.features.forEach(d => {
        d[colorVariable] = colorVariableValueByID[d.id]
    });

    // calculate ckmeans clusters
    // then use the max value of each cluster
    // as a break
    const numberOfClasses = color.range().length - 1;
    const ckmeansClusters = ss.ckmeans(data.map(d => d[colorVariable]), numberOfClasses);
    const ckmeansBreaks = ckmeansClusters.map(d => d3.min(d));
    console.log('numberOfClasses', numberOfClasses);
    console.log('ckmeansClusters', ckmeansClusters);
    console.log('ckmeansBreaks', ckmeansBreaks);

    // set the domain of the color scale based on our data


    svgWm.append('g')
        .attr('class', 'countries')
        .selectAll('path')
        .data(geography.features)
        .enter().append('path')
        .attr('d', pathWm)
        .style('fill', d => {
            if (format(d[colorVariable]) == 0) {
                return 'white'
            }
            if (typeof colorVariableValueByID[d.id] !== 'undefined') {
                return color(colorVariableValueByID[d.id])
            }

        })
        .style('fill-opacity', 0.8)
        .style('stroke', d => {
            if (d[colorVariable] !== 0) {
                return 'white';
            }
            return 'lightgray';
        })
        .style('stroke-width', 1)
        .style('stroke-opacity', 0.5)
        // tooltips
	.on("click", function (d) {
	      data.forEach(function(e) {
              if (e.id == d.id){

			    var pess_min = e.pess_min
			    var pess_max = e.pess_max
			    var pessimistic = e.pessimistic

			    if (!firstBarChartDrawn) {
                    firstBarChartDrawn = true;
                    drawBarChart("#chart", d, pess_min, pess_max, pessimistic);
                } else {
                    updateBarChart("#chart", d, pess_min, pess_max, pessimistic);
                }

		}


        })})
        .on('mouseover', function (d) {
            tip.show(d);
            d3.select(this)
		.transition().duration(400)
                .style('fill-opacity', 1)
                .style('stroke-opacity', 1)
                .style('stroke-width', 2)
                .style('fill', "#191970")
        })
        .on('mouseout', function (d) {
            tip.hide(d);
            d3.select(this)
		.transition().duration(1000)
                .style('fill-opacity', 0.8)
                .style('stroke-opacity', 0.5)
                .style('stroke-width', 1)
                .style('fill', d => {
                    if (format(d[colorVariable]) == 0) {
                        return 'white'
                    }
                    if (typeof colorVariableValueByID[d.id] !== 'undefined') {
                        return color(colorVariableValueByID[d.id])
                    }
                    return 'white'
                })
        });

    svgWm.append('path')
        .datum(topojson.mesh(geography.features, (a, b) => a.id !== b.id))
        .attr('class', 'names')
        .attr('d', pathWm);

    d3.select("#slider").on("input", function () {
        console.log(this.value);
        var scenario = this.value;
        updateMap(scenario);

    });
}

function updateMap(evt, scenario) {
    //console.log("update start " + start + " value " + nbWeek);
    // Declare all variables
    var i, tabcontent, tablinks;
    // Get all elements with class="tabcontent" and hide them
    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }
    // Get all elements with class="tablinks" and remove the class "active"
    tablinks = document.getElementsByClassName("tablinks");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }
    // Show the current tab, and add an "active" class to the button that opened the tab
    document.getElementById(scenario).style.display = "block";
    evt.currentTarget.className += " active";
    if (scenario === "Pessimiste") {
        colorVariable = 'pess_percent';
    }
    if (scenario === "Inclusif") {
        colorVariable = 'inc_percent';
    }
    if (scenario === "Ecologique") {
        colorVariable = 'friend_percent';
    }
    queue().defer(d3.json, 'world_countries.json')
        .defer(d3.tsv, 'world_population.tsv')
        .await(ready);
}


function updateBarChart(div, dataset, pess_min, pess_max, pessimistic) {
    let bar = [pess_min, pess_max, pessimistic];

    var marginWm = {top: 20, right: 30, bottom: 30, left: 40}
    var widthSVG = 300 - marginWm.left - marginWm.right;
    var heightSVG = 300 - marginWm.top - marginWm.bottom;
    var widthAxeX = widthSVG;
    var heightAxeX = 20;
    var widthAxeY = 30;
    var heightAxeY = heightSVG;
    var barPadding = 2;
    var widthBar = widthSVG - barPadding;
    var heightBar = heightSVG;



    let svgWm = d3.select(div);

    yScale = d3.scaleLinear()
        .domain([0, d3.max(bar, function(d) {return parseFloat(d); }) * 1.1])
        .range([ heightSVG-5,0]);

    yAxis = d3.axisRight()
        .scale(yScale)
        .ticks(5);

    yAxisGroup = svgAxeY.transition()
        .attr("class", "axis")
        .attr("transform", "translate(" +  barPadding + ")",0)
        .call(yAxis);


    svgWm.selectAll("rect").data(bar).transition()
        .attr("y", function(d) { return yScale(d); })
        .attr("height", function(d) { return height - yScale(d); });

    barChartLabel.data(bar)
        .transition()
        .text(function(d){return d;})
        .attr("x",function(d, i){return i*(widthSVG/bar.length)+10;})
        .attr("y", function(d){return yScale(d) - 3;});


}
//
function drawBarChart(div, dataset, pess_min, pess_max, pessimistic) {

    let bar = [pess_min, pess_max, pessimistic];
	var marginWm = {top: 20, right: 30, bottom: 30, left: 40}
	var widthSVG = 300 - marginWm.left - marginWm.right;
	var heightSVG = 300 - marginWm.top - marginWm.bottom+40;
	var widthAxeX = widthSVG;
	var heightAxeX = 20;
	var widthAxeY = 30;
	var heightAxeY = heightSVG/2;
	var barPadding = 1;
	var widthBar = widthSVG - barPadding;
	var heightBar = heightSVG/2;


//AXIS

    svgAxeY = d3.select("#chart")
    .append("svg")
    .attr("width", widthAxeY)
    .attr("height", heightAxeY);
    //.attr("transform", "translate(" + marginWm.left + "," + marginWm.top + ")");



    yScale = d3.scaleLinear()
                 .domain([0, d3.max(bar, function(d) { return parseFloat(d); }) * 1.1])
                 .range([ heightSVG-5,0]);

    yAxis = d3.axisRight()
              .scale(yScale)
              .ticks(5);

    yAxisGroup = svgAxeY.append("g")
                .attr("class", "axis")
                .attr("transform", "translate(" +  barPadding + ")",0)
                .call(yAxis);


// CHART

    var svgWm = d3.select("#chart")
        .append("svg")
        .attr("width", widthSVG)
        .attr("height", heightSVG);

    var heightScale = d3.scaleLinear()
                 .domain([0, d3.max(bar)])
                 .range([0, heightSVG]);

    var color = d3.scaleLinear().domain([1,3])
          .interpolate(d3.interpolateHcl)
          .range([d3.rgb("#007AFF"), d3.rgb('#FFF500')]);


    svgWm.selectAll("rect").data(bar).enter()
            .append("rect")
            .attr("width", 20)
        .attr("height", heightBar - marginWm.top + marginWm.bottom)
            .attr("x",function(d, i){return i*(widthSVG/bar.length);})
        .attr("y", function(d) { return yScale(d); })
        .attr("height", function(d) { return height - yScale(d); })
        .attr('fill', function(d) {
                return '#191970';})
        .on("mouseover", function(d, i) {
                    d3.select(this).style("fill", "orange");

                // Using Ids instead of values
                    d3.selectAll("text").filter(function(e, j) {
                  return i === j;
                })
                .style("font-size", 24);

                    })
                    .on("mouseout", function(d, i) {
                    d3.select(this).transition().duration(500).style("fill", '#191970');

                // Should be using Ids instead of values
                    d3.selectAll("text").filter(function(e, j) {
                  return i === j;
                })
                .transition().duration(1000)
                .style("font-size", 12);

                    });

//svgWm.transition().attrTween("d", someFunction) // apply transition here if you want some animation for data change

// for `exit` selection, they shouldn't be on the svg canvas since there is no corresponding data, you can then remove them

//append text
    barChartLabel = svgWm.selectAll("text")
            .data(bar)
            .enter()
            .append("text")
            .text(function(d){return d;})
            .attr("x",function(d, i){return i*(widthSVG/bar.length)+10;})
            .attr("y", function(d){return yScale(d) - 3;})
            .attr("font-family", "sans-serif")
            .attr("font-size", "11px")
            .attr("fill", "black")
            .attr("text-anchor", "middle");


var xScale = d3.scaleLinear()
	.domain([0, bar.length])
	.range([0, widthSVG-1]);

var xAxis = d3.axisBottom()
		.scale(xScale);

svgWm.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(xAxis);



}

console.log("Chargement ok ! ")
