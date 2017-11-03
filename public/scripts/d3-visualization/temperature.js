// var margin = {top: 10, right: 20, bottom: 10, left: 20}
// var width = 300 - margin.left - margin.right;
// var height = 200 - margin.top - margin.bottom;
// 	.attr("width", width + margin.left + margin.right)
// 	.attr("height", height + margin.top + margin.left);

	const datasetUrl = "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json";


$(document).ready(function() {

	d3.json("offlineData.json", function(error, json) {
		if (error) {
			console.log(error);
		}

		var div = d3.select("body").append("div")	
		    .attr("class", "tooltip")				
		    .style("opacity", 0);

		const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
		var todaysDate = new Date()
		var thisYear = todaysDate.getFullYear(); 

		var earliestYear = (function() {
			var currentEarliest = thisYear;
			for (let i = 0; i < json.monthlyVariance.length; i++) {
				if (json.monthlyVariance[i].year < currentEarliest) {
					currentEarliest = json.monthlyVariance[i].year;
				}
			}
			return currentEarliest;
		})();

		var varianceRange = (function() {
			var currentVariance = [0, 0]
			for (let i = 0; i < json.monthlyVariance.length; i++) {
				if (currentVariance[0] > json.monthlyVariance[i].variance) {
					currentVariance[0] = json.monthlyVariance[i].variance;
				}
				if (currentVariance[1] < json.monthlyVariance[i].variance) {
					currentVariance[1] = json.monthlyVariance[i].variance;
				}
			}
			return currentVariance
		})();

		const colorArray = ["#B20004", "#B13100", "#B06600", "#AF9A00", "#8DAD00", "#57AC00", "#23AA00", "#00A910", "#00A842", "#00A774", "#00A5A5", "#0072A4", "#0040A2"]; // .reverse(). Because I'm a lazy dingus.
		const borrowedColorArray = ["#5e4fa2", "#3288bd", "#66c2a5", "#abdda4", "#e6f598", "#ffffbf", "#fee08b", "#fdae61", "#f46d43", "#d53e4f", "#9e0142"]; // Don't .reverse(). Colors from https://codepen.io/freeCodeCamp/pen/aNLYPp?editors=0010
		const linearColorArray = ["#007AFF", "#FFF500"]; // Don't .reverse().

		var quantileColorScale = d3.scaleQuantile() 
			.domain(varianceRange)
			.range(borrowedColorArray) // Check .reverse()

		var linearColorScale = d3.scaleLinear() 
			.domain(varianceRange)
			.interpolate(d3.interpolateHcl)
			.range(linearColorArray) // Colors from http://bl.ocks.org/jfreyre/b1882159636cc9e1283a


		const margin = {left: 80, right: 10, top: 10, bottom: 10}
		const svgWidth = 1460;
		const svgHeight = 650;
		const barWidth = 5;
		const barHeight = 50;


		// Chart construction
		var svg = d3.select('#temperatureChart').append("svg")
			.attr("height", svgHeight + "px")
		  	.attr("width", barWidth * (thisYear - earliestYear) + (margin.left + margin.right) + "px");

		svg.selectAll("rect")
			.data(json.monthlyVariance)
			.enter().append("rect")
				.attr("class", "bar")
				.attr("fill", function(d, i) { return linearColorScale(d.variance) })
				.attr("height", barHeight + "px")
		      	.attr("width", barWidth + "px")
				.attr("x", function(d, i) { return ((d.year - earliestYear) * barWidth) + margin.left })
		      	.attr("y", function(d, i) { return (d.month * barHeight) - barHeight })

		      	.on("mouseover", function(d, i) {
		      		div.transition()
		      			.duration(100)
		      			.style("opacity", .7)
		      		div.html("<span class='tooltip-date'>" + months[d.month-1] + " " + d.year + "</span>"
		      			+ "<span class='tooltip-temperature'>" + (8.66 + d.variance).toFixed(3) + "°" + "</span>"
		      			+ "<span class='tooltip-variance'>" + d.variance + "° </span")
			      		.style("left", (d3.event.pageX - $('.tooltip').width() / 2) + "px")
			      		.style("top", (d3.event.pageY - $('.tooltip').height() - 20) + "px")
		      	})
		      	.on("mouseout", function(d, i) {		
		            div.transition()		
		                .duration(100)		
		                .style("opacity", 0);
	            })	

		// Axes
		var xScale = d3.scaleLinear()
			.domain([earliestYear, thisYear])
			.range([margin.left, ((thisYear - earliestYear) * barWidth) + margin.left])
			

		var xAxis = d3.axisBottom()
			.scale(xScale)
			.tickFormat(d3.format("d"))

		svg.append("g")
			.attr("transform", "translate(0, 600)")
       		.call(xAxis)

		svg.selectAll(".month")
			.data(months)
			.enter().append("text")
				.text(function(d, i) { return d })
				.attr("alignment-baseline", "middle") // Without this, the bottom of our text is what is centered. 
				.attr("x", function(d, i) { return margin.left * (1/2) })
				.attr("y", function(d, i) { return i * barHeight + (barHeight/2)})
				.attr("class", "month")
			

       	// Labels
		svg.append("g") // Why is this inside a "g" when the Year label is not? Rotating vanished the text entirely when assigning x and y coordinates, and translating did not work on the text element.
			.attr("transform", "translate(" + margin.left/4 + "," + svgHeight/2 + ")" )
			.append("text")
				.text("Month")
				.attr("transform", "rotate(-90)")
				.attr("text-anchor", "middle")
				.attr("class", "axis-label")

		svg.append("text")
			.text("Year")
			.attr("x", svgWidth/2)
			.attr("y", svgHeight - margin.bottom)
			.attr("text-anchor", "middle")
			.attr("class", "axis-label")



		// Legend
		var legendHeight = 50;
		var legendWidth = 50;
				
		var varianceArray = (function(breakPoints) {
			var breaksPoints = 8;
			var array = [];
			var diff = (varianceRange[1] - varianceRange[0]) / breaksPoints;
			var startValue = varianceRange[0];
			for (let i = 0; i <= breaksPoints; i++) {
				array.push(startValue);
				startValue += diff;
			}
			console.log(varianceRange);
			console.log(array);
			return array;
		})()

		var legendSvg = d3.select("#temperatureChart").append("svg")
			.attr("width", barWidth * (thisYear - earliestYear) + (margin.left + margin.right) + "px")
			.attr("height", "100")


		var legend = legendSvg.selectAll(".legend")
			.data(varianceArray)
			.enter().append("rect")
			.attr("fill", function(d, i) { return linearColorScale(d)} )
			.attr("height", legendHeight + "px")
			.attr("width", legendWidth + "px")
			.attr("x", function(d, i) { return 800 + (i * legendWidth) })
			.attr("y", function(d, i) { return 10 })
			.attr("class", ".legend")

		legendSvg.selectAll(".legend")
			.data(varianceArray)
			.enter().append("text")
			.text(function (d, i) { 
				if (d > 0) {
					return "+" + d.toFixed(1)
				} else {
					return d.toFixed(1) 
				}
			})
			.attr("x", function(d, i) { return 805 + (i * legendWidth) })
			.attr("y", function(d, i) { return 80 })
			.attr("class", "legend-text")

		legendSvg.append("text")
			.text("Variance")
			.attr("x", svgWidth/2 - 0)
			.attr("y", 40)
			//.attr("alignment-baseline", "middle") // Without this, the bottom of our text is what is centered. 
			.attr("class", "legend-label")

console.log(varianceRange)


		// vg.selectAll("rect")
		// 	.data(8)
		// 	.enter().append("rect")
		// 		.attr("class", "bar")
		// 		.attr("fill", function(d, i) { return linearColorScale() })
		// 		.attr("height", barHeight + "px")
		//       	.attr("width", barWidth + "px")
		// 		.attr("x", function(d, i) { return ((d.year - earliestYear) * barWidth) + margin.left })
		//       	.attr("y", function(d, i) { return (d.month * barHeight) - barHeight })

	});
 });