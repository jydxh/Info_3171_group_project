/*
Haocheng todo: 
  
- Chart2: Relationship between the ‘comment’ and ‘subscribers’, use the scatter chart and have zoom functionality, 

use the d3.select("Haocheng_chart_2") to select the dom placeholder 


todo: add animation for initial transition and transform on load
*/

//const avg_view_data = await d3.csv("./data/avg_view_every_month.csv");

const themeColors85 = [
	"#6200EA",
	"#7C4DFF",
	"#651FFF",
	"#3D5AFE",
	"#3B118D",
	"#536DFE",
	"#8C9EFF",
	"#6F3EF2",
	"#7B1FA2",
	"#9C27B0",
	"#AB47BC",
	"#BA68C8",
	"#7B66C4",
	"#9575CD",
	"#5E35B1",
	"#512DA8",
	"#C2185B",
	"#D81B60",
	"#E91E63",
	"#EC407A",
	"#F06292",
	"#8D1179",
	"#AD1457",
	"#C51162",
	"#F50057",
	"#FF4081",
	"#FF80AB",
	"#FF5252",
	"#FF1744",
	"#D50000",
	"#C03535",
	"#E35858",
	"#006064",
	"#0097A7",
	"#00BCD4",
	"#26C6DA",
	"#4DD0E1",
	"#56CCF2",
	"#80DEEA",
	"#00ACC1",
	"#00B8D4",
	"#00E5FF",
	"#18FFFF",
	"#84FFFF",
	"#2A8FA8",
	"#00838F",
	"#44B3D0",
	"#29B6F6",
	"#1B5E20",
	"#2E7D32",
	"#388E3C",
	"#43A047",
	"#4CAF50",
	"#66BB6A",
	"#6FCF97",
	"#81C784",
	"#00C853",
	"#00E676",
	"#69F0AE",
	"#B9F6CA",
	"#3B8F63",
	"#59BB85",
	"#4AA574",
	"#76FF03",
	"#F57F17",
	"#F9A825",
	"#FBC02D",
	"#FDD835",
	"#FFEE58",
	"#F2C94C",
	"#F4D162",
	"#FFEB3B",
	"#FFD600",
	"#FFC400",
	"#FFAB00",
	"#FF6F00",
	"#F57C00",
	"#FB8C00",
	"#FF9800",
	"#FFA726",
	"#4527A0",
	"#283593",
	"#1565C0",
	"#0277BD",
	"#00695C",
	"#2E7D32",
	"#C62828",
	"#AD1457",
	"#6A1B9A",
	"#9E9D24",
	"#EF6C00",
	"#D84315",
	"#4E342E",
	"#37474F",
	"#880E4F",
	"#4A148C",
];
const top_100_youtubers_data = await d3.csv("./data/top_100_youtubers.csv", d => ({
	...d,
	followers: +d.followers,
	CommentsAvg: +d.CommentsAvg,
}));

//console.log("top100:Comments_avg", top_100_youtubers_data);

const width = 600;
const height = 500;
const margin = { top: 60, right: 30, bottom: 75, left: 75 };
const innerWidth = width - margin.left - margin.right;
const innerHeight = height - margin.top - margin.bottom;

//clean the dom first
const container = d3.select("#Haocheng_chart_2");
container.selectAll("*").remove();

const chart2_svg = container
	.append("svg")
	.attr("class", "haochengSvgContainer card shadow rounded")
	.attr("width", width)
	.attr("height", height);

// chart title

chart2_svg
	.append("text")
	.attr("x", width / 2)
	.attr("y", margin.top / 2 + 10)
	.attr("text-anchor", "middle")
	.style("fill", "#3b118d")
	.style("font-family", "'Montserrat', sans-serif")
	.style("font-size", "24px")
	.style("font-weight", 700)
	.text("Chart2: subscribers VS comments");

const g = chart2_svg
	.append("g")
	.attr("transform", `translate(${margin.left},${margin.top + 10})`)
	.attr("class", "graph");

const tooltip = container
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0)
	.style("pointer-events", "none")
	.style("font-family", "'Merriweather', serif")
	.style("font-weight", "400")
	.style("font-size", "12px")
	.style("line-height", "18px")
	.style("background", "#B35FA8")
	.style("color", "#F3F1FA")
	.style("border-radius", "8px")
	.style("box-shadow", "2px 2px 6px rgba(0,0,0,0.3)");

// Add clip path to prevent drawing outside chart area
chart2_svg
	.append("defs")
	.append("clipPath")
	.attr("id", "clip-chart2")
	.append("rect")
	.attr("width", innerWidth)
	.attr("height", innerHeight);

// color scale
const colorScale = d3
	.scaleOrdinal()
	.domain(d3.range(top_100_youtubers_data.length))
	.range(themeColors85);

/* x axis is followers */
const xScale = d3.scaleLinear(
	//d3.extent(top_100_youtubers_data, d => d.followers),
	[0, d3.max(top_100_youtubers_data, d => d.followers)],
	[0, innerWidth]
);
const xAxis = d3
	.axisBottom()
	.scale(xScale)
	.ticks(5)
	.tickFormat(d => d3.format(".2s")(d));
const xAxisGroup = g.append("g").attr("transform", `translate(0, ${innerHeight})`).call(xAxis);

xAxisGroup
	.selectAll("text")
	.style("text-anchor", "end")
	.attr("dx", "-.8em")
	.attr("dy", ".15em")
	.style("fill", "#8d1179")
	.style("font-size", "12px")
	.attr("transform", "rotate(-45)");

/* y axis is comments */

const yScale = d3.scaleLinear(
	//d3.extent(top_100_youtubers_data, d => d.CommentsAvg),
	[0, d3.max(top_100_youtubers_data, d => d.CommentsAvg)],
	[innerHeight, 0]
);
const yAxis = d3
	.axisLeft()
	.scale(yScale)
	.ticks(5)
	.tickFormat(d => d3.format(".2s")(d));
const yAxisGroup = g
	.append("g")
	.call(yAxis)
	.selectAll("text")
	.style("fill", "#8d1179")
	.style("font-size", "12px");

// Create scatter plot group with clipping
const scatterGroup = g.append("g").attr("clip-path", "url(#clip-chart2)");
const formatNum = d3.format(",");

const circles = scatterGroup
	.selectAll("circle")
	.data(top_100_youtubers_data)
	.join("circle")
	.attr("r", 5)
	.attr("cx", 0) // Start at origin
	.attr("cy", innerHeight) // Start at bottom
	.style("fill", (_, i) => colorScale(i))
	.attr("data-color", (_, i) => colorScale(i))
	.style("opacity", 0)
	.style("cursor", "pointer")
	.transition()
	.duration(500)
	.attr("cx", d => xScale(d.followers))
	.attr("cy", d => yScale(d.CommentsAvg))
	.style("opacity", 0.7)
	.end()
	.then(() => {
		// Add mouse events after transition completes
		scatterGroup
			.selectAll("circle")
			.on("mouseover", function (event, d) {
				d3.select(this)
					.transition()
					.duration(100)
					.attr("r", 8)
					.style("fill", "#8D1179")
					.style("opacity", 1);

				tooltip.transition().duration(300).style("opacity", 0.9);
				tooltip
					.html(
						`<div class="d-flex flex-column gap-2">
                            <span><strong>Country:</strong> ${d.Country || "N/A"}</span>
                            <span><strong>Followers:</strong> ${formatNum(d.followers)}</span>
                            <span><strong>Comments:</strong> ${formatNum(d.CommentsAvg)}</span>
                        </div>`
					)
					.style("left", event.pageX + 10 + "px")
					.style("top", event.pageY + 10 + "px");
			})
			.on("mouseout", function () {
				const originalColor = d3.select(this).attr("data-color");
				d3.select(this)
					.transition()
					.duration(200)
					.attr("r", 5)
					.style("fill", originalColor)
					.style("opacity", 0.7);
				tooltip.transition().duration(500).style("opacity", 0);
			});
	});

// Zoom function
function zoomed(event) {
	// Create new scales based on zoom transform
	var newXScale = event.transform.rescaleX(xScale);
	var newYScale = event.transform.rescaleY(yScale);

	// Update axes with formatting
	xAxisGroup
		.call(xAxis.scale(newXScale))
		.selectAll("text")
		.style("text-anchor", "end")
		.attr("dx", "-.8em")
		.attr("dy", ".15em")
		.style("fill", "#8d1179")
		.attr("transform", "rotate(-45)");

	yAxisGroup.call(yAxis.scale(newYScale));

	// Update circle positions
	scatterGroup
		.selectAll("circle")
		.attr("cx", d => newXScale(d.followers))
		.attr("cy", d => newYScale(d.CommentsAvg));
}

// Create zoom behavior
var zoom = d3
	.zoom()
	.scaleExtent([0.7, 70]) // Min and max zoom levels
	.extent([
		[0, 0],
		[innerWidth, innerHeight],
	])
	.on("zoom", zoomed);

// Apply zoom to the main group
chart2_svg.call(zoom);

// X Axis label
g.append("text")
	.attr("text-anchor", "middle")
	.attr("x", innerWidth / 2)
	.attr("y", innerHeight + 50) // Position below the axis ticks
	.style("font-family", "'Merriweather', serif")
	.style("fill", "#3b118d")
	.style("font-size", "16px")
	.style("font-weight", 700)
	.text("Followers");

// y Axis label

g.append("text")
	.attr("text-anchor", "middle")
	.attr("transform", "rotate(-90)")
	.attr("y", -45) // Position left of the axis ticks
	.attr("x", -innerHeight / 2)
	.style("font-family", "'Merriweather', serif")
	.style("fill", "#3b118d")
	.style("font-size", "16px")
	.style("font-weight", 700)
	.text("Comments");
