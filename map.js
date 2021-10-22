d3.json('airports.json').then(airports=>{
	d3.json('world-110m.json').then(worldmap=>{

        const width = 1400;
        const height = 800;

        const svg = d3.select('body').append("svg")
        .attr("width", width)
        .attr("height", height);

        const features = topojson.feature(worldmap, worldmap.objects.countries).features;
          
        const projection = d3.geoMercator()
        .fitExtent(
          [[0, 0], [width, height]], // available screen space
          topojson.feature(worldmap, worldmap.objects.land) // geoJSON object
        );

        const path = d3.geoPath().projection(projection);
        
        svg.selectAll("path")
        .data(features) // geojson feature collection
        .join("path")
        .attr("d", d=>path(d))
        .attr("fill", 'black')
        .attr('class', 'map')
        .attr("stroke", "white")
        .attr("stroke-linejoin", "round")
        .attr('fill-opacity', 0)

        const size = d3
        .scaleLinear()
        .domain(d3.extent(airports.nodes,d=>d.passengers))
        .range([5, 15]);
        
        const link = airports.links;
        console.log(link)

        const force = d3
        .forceSimulation(airports.nodes)
        .force("charge", d3.forceManyBody().strength(5))
        .force('link',d3.forceLink(link))
        .force('X',d3.forceX(function(d){
          return width/2
        }))
        .force('Y',d3.forceY(function(d){
          return height/2
        }))
        .force("collide", d3.forceCollide().radius(function(d) {
                return size(d.passengers)+15
            })
        )
        
        const drag = d3
        .drag()
        .on("start", event => {
        force.alphaTarget(0.3).restart();
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        })
        .on("drag", event => {
        event.subject.fx = event.x;
        event.subject.fy = event.y;
        })
        .on("end", event => {
        force.alphaTarget(0.1);
        event.subject.fx = null;
        event.subject.fy = null;
        });

        const links = svg.selectAll('line')
        .data(airports.links)
        .join('line')
        .attr('class','links')
        .attr('stroke','gray')
        .attr('x1',d=>d.source.x)
        .attr('x2',d=>d.target.x)
        .attr('y1',d=>d.source.y)
        .attr('y2',d=>d.target.y)
      

        const nodes = svg.selectAll('circle')
        .data(airports.nodes)
        .join('circle')
        .attr('class','nodes')
        .attr('fill','orange')
        .attr('stroke','gray')
        .attr('r',d=>size(d.passengers));

        links.call(drag)



        nodes.append('title').text(d=>d.name)

        nodes.call(drag)

        force.on("tick", () => {
            nodes.attr("cx", d => {
              
              return d.x;
            });
        
            nodes.attr("cy", d => {
              return d.y;
            });
            links.attr('x1',d=>{
              return d.source.x
            })
            links.attr('x2',d=>{
              return d.target.x
            })
            links.attr('y1',d=>{
              return d.source.y
            })
            links.attr('y2',d=>{
              return d.target.y
            })

          });

          d3.selectAll("input[name='choice']").on("change", event=>{
            visType = event.target.value;// selected button
            switchLayout();
          });

          function switchLayout() {
            if (visType === "map") {
              force.stop();
              drag.filter(event => visType === "force")
              d3.selectAll('.nodes').transition()
              .duration(1500)
              .attr('cx',d=>projection([d.longitude, d.latitude])[0])
              .attr('cy',d=>projection([d.longitude, d.latitude])[1])

              d3.selectAll('.links').transition()
              .duration(1500)
              .attr('x1',d=>projection([d.source.longitude, d.source.latitude])[0])
              .attr('x2',d=>projection([d.target.longitude, d.target.latitude])[0])
              .attr('y1',d=>projection([d.source.longitude, d.source.latitude])[1])
              .attr('y2',d=>projection([d.target.longitude, d.target.latitude])[1])

              d3.selectAll('.map').transition()
              .duration(1500)
              .attr('fill-opacity',1)
            } else { 
              force.restart()
              
              
              d3.selectAll('.map').transition()
              .duration(1500)
              .attr('fill-opacity',0)
            }
          }
    
    });
})


