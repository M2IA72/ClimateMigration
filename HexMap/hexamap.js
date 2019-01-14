var elmnt = document.getElementById("main");

var ele = document.getElementById("hm"),
  eleStyle = window.getComputedStyle(ele),
  eleWidth = parseInt(eleStyle.width),
  eleHeight= parseInt(eleStyle.height),
  eleLeft = ele.offsetLeft;
  eleTop = ele.offsetTop;

var margin = {top: 20, right: 20, bottom: 30, left: 40},
    width = eleWidth - margin.left - margin.right,
    height = eleWidth/2.5 - margin.top - margin.bottom;


var svg = d3.select("div.hexamap").append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)

  var projection = d3.geoMercator();

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

  function render (geometry, data) {

    var color = d3.scaleLinear().domain([0,666666666])
                    .range([d3.rgb("#80d491"), d3.rgb('#00b730')]);;

    var color2 = d3.scaleLinear().domain([0,1,15,50])
                    .range([
                      d3.rgb("#ffffff"),
                      d3.rgb("#169900"),
                      d3.rgb("#e2ae12"),
                      d3.rgb('#b70021')
                    ])
    								.interpolate(d3.interpolateHcl);

    states.selectAll('path')
    .data(geometry.features)
    .enter().append('path')
    .attr('d', path)
    .attr('fill-opacity', 1)
    .attr('stroke-opacity', 1)
    .attr('id',function(d) {
      return d.properties.name;
    })
    .style("fill", function(d) {
      var value = d.properties.pop_est;
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




  var ele = document.getElementById("hm"),
    eleStyle = window.getComputedStyle(ele),
    eleWidth = parseInt(eleStyle.width),
    eleHeight= parseInt(eleStyle.height),
    eleLeft = ele.offsetLeft;
    eleTop = ele.offsetTop;
  var coord = [[]]
	var DepartX=eleLeft;
	var DepartY=eleTop;
    for(x=DepartX+1;x<eleWidth+DepartX;x+=hexRadius){
      for(y=DepartY+1;y<eleHeight+DepartY;y+=hexRadius){
        var element = document.elementFromPoint(x, y);
				if(element != null && element['id']!=""){
        	coord=coord.concat([[x-DepartX,y-DepartY,element['id']]])
        }
      }
    }

    var hexagon = svg.append('g')
      .attr('class', 'hexagons');

    var mesh = svg.append('g')
      .attr('class', 'hex-mesh')
      .append('path')
        .attr('d', hexbin.mesh());

        hexagon.selectAll('path')
        .data(hexbin(coord))
        .enter().append('path')
        .attr('transform', d => { return 'translate(' + d.x + ',' + d.y + ')'; })
        .attr('id',function(d) {
          return d[0][2];
        })
        .attr('fill-opacity', 0)
        .attr('stroke-opacity', 0)
        .attr('d', hexbin.hexagon())
        .transition()
          .attr('d', hexbin.hexagon(hexbin.radius()))

        var migrValue = 0

	var scenario = "pessimistic" //inclusive friendly pessimistic

      d3.selectAll(".hexagons")
        .selectAll("path").each(function(d, i) {
          var nom = this.id;
          data.forEach(function(e){
            if(e.name==nom)
            {
              migrValue=e[scenario];
            }
          });
          this.setAttribute("fill",color2(migrValue))
          migrValue=0
        })
      ;


    // update the elements
    var check=false;
    d3.select("input.switch").on("click", function() {
        if (this.checked){
          check = true;
          displayMap(states,0)
          displayMap(hexagon,1)
        } else {
          check = false;
          displayMap(states,1)
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
			xCenter = 150;
			yCenter = 350;
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
			  var cBug=["Cote d'Ivoire","Falkland Islands (Islas Malvinas)","Holy See (Vatican City)","Cocos (Keeling) Islands"]
			  if(!cBug.includes(e.name)){
			  var cName="#"+e.name
			  var nbHex = hexagon.selectAll(cName).size();
				hexagon.selectAll(cName)
				  .each(function(d,i){
				  if(e[scenario]>0){
					if(i<Math.max(1,nbHex*e[scenario]/100)){
					  d3.select(this).transition()
						.attr('transform', d => { return 'translate(' + migCoords[migId][0] + ',' + migCoords[migId][1] + ')'; })
						.delay(2000)
						.duration(8000);
					  migId++;
					}
				  }
				})
			  }
		  });
		} else {
      displayMap(states,1)
      displayMap(hexagon,0)
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
