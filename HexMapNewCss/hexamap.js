var elmnt = document.getElementById("main");

var ele = document.getElementById("hm"),
  eleStyle = window.getComputedStyle(ele),
  eleWidth = parseInt(eleStyle.width),
  eleHeight= parseInt(eleStyle.height),
  eleLeft = ele.offsetLeft;
  eleTop = ele.offsetTop;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = eleWidth - margin.left - margin.right,
    height = eleWidth/2 - margin.top - margin.bottom;


var svg = d3.select("div.hexamap").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

var projection = d3.geoMercator().scale(width / 2 / Math.PI)
.translate([width / 2, height / 2]);

var path = d3.geoPath()
  .projection(projection);


var color = d3.scaleLinear()
  .range(['#fff ', '#e31a1c'])
  .domain([0, 20])
  .interpolate(d3.interpolateLab);

var hexRadius = 5;
var hexbin = d3.hexbin()
    .size([width, height])
    .radius(hexRadius);

var states = svg.append('g')
  .attr('class', 'states');

var tooltip = d3.select('body').append('div')
        .attr('class', 'hidden tooltip');

var scenario = "pessimistic" //inclusive friendly pessimistic

  function render (geometry, data) {

    var color = d3.scaleLinear().domain([0,3,4,8,9,12,13,17,18,20])
                    .range([d3.rgb("#a93226"),d3.rgb(" #cd6155 "),d3.rgb(" #76448a "),d3.rgb(" #af7ac5 "),d3.rgb(" #1f618d "),d3.rgb(" #5dade2 "),d3.rgb(" #1e8449 "),d3.rgb("#58d68d"), d3.rgb(' #d68910 '), d3.rgb('#f1c40f')]);;

    var regions = ["Caribbean","Central America","Northern America","South America","Southern Asia","Western Asia","Eastern Asia","South-Eastern Asia","Central Asia","Western Europe","Southern Europe","Eastern Europe","Northern Europe","Middle Africa","Eastern Africa","Western Africa","Southern Africa","Northern Africa","Australia and New Zealand","Melanesia"]

    states.selectAll('path')
    .data(geometry.features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill-opacity', 1)
    .attr('stroke-opacity', 1)
    .attr('id',function(d) {
      return d.properties.name;
    })
    .attr('class',function(d) {
      return d.properties.subregion;
    })
    .style("fill", function(d) {
      var value = regions.indexOf(d.properties.subregion);
      /*if(!region.includes(d.properties.subregion))
        region.push(d.properties.subregion);*/
      if (value) {
        return color(value);
      } else {
        // si pas de valeur alors en gris
        return "#ccc";
      }
    })
    .on('mousemove', function(d) {
      var mouse = d3.mouse(svg.node()).map(function(d) {
        return parseInt(d);
      });
      tooltip.classed('hidden', false)
        .attr('style', 'left:' + (mouse[0] + 25) +
              'px; top:' + (mouse[1]) + 'px')
        .html(d.properties.name);
    })
    .on('mouseout', function() {
      tooltip.classed('hidden', true);
    });
    ;



    var eleIDHM = document.getElementById("slideTitleHM"),
    eleStyleIDHM = window.getComputedStyle(eleIDHM),
    eleHeightIDHM= parseInt(eleStyleIDHM.height);

    var ele = document.getElementById("slides"),
    eleStyle = window.getComputedStyle(ele),
    eleWidth = parseInt(eleStyle.width),
    eleHeight= parseInt(eleStyle.height),
    eleLeft = ele.offsetLeft;
    eleTop = ele.offsetTop;
    var coord = [[]]
    var DepartX=eleLeft;
    var DepartY=eleTop;
    console.log(DepartX,DepartY,eleWidth,eleHeight)
      for(x=DepartX+hexRadius;x<eleWidth+DepartX-1;x+=hexRadius){
        for(y=DepartY+hexRadius;y<eleHeight+DepartY-1;y+=hexRadius){
          var element = document.elementFromPoint(x, y);
          if(element != null && element['id']!="" && element['id']!="hm" && element['id']!="slideTitleHM"){
            coord=coord.concat([[x-DepartX,y-DepartY-eleHeightIDHM-2*hexRadius,element['id'],element.classList.value]])
          }
        }
      }

    var hexagonBack = svg.append('g')
      .attr('class', 'hexagonBack');

    var hexagon = svg.append('g')
      .attr('class', 'hexagons');



    var mesh = svg.append('g')
      .attr('class', 'hex-mesh')
      .append('path')
        .attr('d', hexbin.mesh());

      hexagonBack.selectAll('path')
      .data(hexbin(coord))
      .enter().append('path')
      .attr('transform', d => { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('id',function(d) {
        return d[0][2];
      })
      .attr('class',function(d) {
        return d[0][3];
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('d', hexbin.hexagon())
      .transition()
        .attr('d', hexbin.hexagon(hexbin.radius()))

      hexagon.selectAll('path')
      .data(hexbin(coord))
      .enter().append('path')
      .attr('transform', d => { return 'translate(' + d.x + ',' + d.y + ')'; })
      .attr('id',function(d) {
        return d[0][2];
      })
      .attr('class',function(d) {
        return d[0][3];
      })
      .attr('fill-opacity', 0)
      .attr('stroke-opacity', 0)
      .attr('d', hexbin.hexagon())
      .transition()
        .attr('d', hexbin.hexagon(hexbin.radius()))



  var migrValue = 0

      d3.selectAll(".hexagons")
        .selectAll("path").each(function(d, i) {
          var nom = this.id;
          data.forEach(function(e){
            if(e.name==nom)
            {
              migrValue=e[scenario];
            }
          });
          //console.log(this.class)
          this.setAttribute("fill",color(regions.indexOf(this.classList.value)))
          migrValue=0
        })
      ;


    // update the elements
    var check=false;
    d3.select("input.switch").on("click", function() {
        if (this.checked){
          check = true;
          displayMap(states,0)
          displayMap(hexagonBack,1)
          displayMap(hexagon,1)
        } else {
          check = false;
          displayMap(states,1)
          displayMap(hexagonBack,0)
          displayMap(hexagon,0)
        }
    });



	var checkAnim=false;
    d3.select("input.switchAnim").on("click", function() {
        if (this.checked){
          checkAnim = true;
          moveHexa(checkAnim)
        } else {
          checkAnim = false;
          moveHexa(checkAnim)
        }
    });

    function displayMap(name,fillOpa){
        name.selectAll('path')
        .transition()
          .attr('fill-opacity', fillOpa)
          .attr('stroke-opacity', fillOpa)
          .duration(1000);
    }


    function moveHexa(check){
		if(check){
			xCenter = width/6;
			yCenter = height*2/3;
			var migCoords =[[xCenter,yCenter]];
			for(k=1;k<40;k++){
			  for(i=0;i<6;i++){
				for(j=0;j<k;j++){
				  rayon=2*k*hexRadius
				  theta=(6*(j-1)+i)*2*Math.PI/(k*6)
				  xMig=xCenter+rayon*Math.cos(theta)
				  yMig=yCenter+rayon*Math.sin(theta)
				  migCoords=migCoords.concat([[xMig,yMig]])
				}
			  }
			}



			var migId=0

			data.forEach(function(e){
                var cBug = ["Cote d'Ivoire", "Falkland Islands (Islas Malvinas)", "Holy See (Vatican City)", "Cocos (Keeling) Islands"]
                if (!cBug.includes(e.name)) {
                    var cName = "#" + e.name;
                    var nbHex = hexagon.selectAll(cName).size();
                    var nbRandom = Math.max(1, nbHex * e[scenario] / 100);
                    var hexToMove = [];
                    for (var i = 0; i < nbRandom; i++) {
                        var r;
                        do {
                            r = Math.floor(Math.random() * nbHex);
                        } while (hexToMove.includes(r));
                        hexToMove.push(r);
                    }

                    hexagon.selectAll(cName)
                        .each(function (d, i) {
                            if (e[scenario] > 0) {
                                if (hexToMove.includes(i)) {
                                    d3.select(this).transition()
                                        .attr('transform', d => {
                                            return 'translate(' + migCoords[migId][0] + ',' + migCoords[migId][1] + ')';
                                        })
                                        .delay(2000)
                                        .duration(8000);
                                    migId++;
                                }
                            }
                        })
                }
            });
        } else {
          hexagon.remove();
          
          hexagon = svg.append('g')
          .attr('class', 'hexagons');

          hexagon.selectAll('path')
          .data(hexbin(coord))
          .enter().append('path')
          .attr('transform', d => { return 'translate(' + d.x + ',' + d.y + ')'; })
          .attr('id',function(d) {
          return d[0][2];
          })
          .attr('class',function(d) {
          return d[0][3];
          })
          .attr('fill-opacity', 0)
          .attr('stroke-opacity', 0)
          .attr('d', hexbin.hexagon())
          .transition()
          .attr('d', hexbin.hexagon(hexbin.radius()))

          d3.selectAll(".hexagons")
            .selectAll("path").each(function(d, i) {
              var nom = this.id;
              data.forEach(function(e){
                if(e.name==nom)
                {
                  migrValue=e[scenario];
                }
              });
              //console.log(this.class)
              this.setAttribute("fill",color(regions.indexOf(this.classList.value)))
              migrValue=0
            })
          ;
          displayMap(hexagon, 1)
    }
  }
}


  d3.queue()
    .defer(d3.json, 'world.geojson')
  	.defer(d3.tsv, 'world_population.tsv')
    .awaitAll((err, results) => {
      if (err) { return console.error(err); }
      render(results[0], results[1]);
    });

    /*
		document.addEventListener('click', printMousePos, true);
    var country = []
    function printMousePos(event) {
      if(event.clientY>500)
        country=[];
      else
      	country.push([event.clientX-7,event.clientY-7]);
      console.log(country)
    }*/

var acc = document.getElementsByClassName("accordion");
var nwc = document.getElementsByClassName("newCountry");


acc[0].classList.toggle("active");
var panel = acc[0].nextElementSibling;
panel.style.display = "block";
panel.style.margin = "0 0 10px 0";
panel.style.padding = "10px";

for (j = 0; j < acc.length; j++) {
  acc[j].addEventListener("click", function() {
    for (i = 0; i < acc.length; i++) {
      acc[i].classList.remove("active");
      var panel = acc[i].nextElementSibling;
      if (panel.style.display){
        nwc[i].style.display = null;
        panel.style.display = null;
        panel.style.margin = null;
        panel.style.padding = null;
      }
    }
    this.classList.toggle("active");
    var panel = this.nextElementSibling;
    panel.style.display = "block";
    panel.style.margin = "0 0 10px 0";
    panel.style.padding = "10px";

    if(this.classList.contains("pessimiste")){
      nwc[0].style.display = "block";
      scenario="pessimistic";
    } else if (this.classList.contains("inclusive")) {
      nwc[1].style.display = "block";
      scenario="inclusive";
    } else {
      nwc[2].style.display = "block";
      scenario="friendly";
    }
  });
}
