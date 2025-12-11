/* 
Mary to do:

- Chart1: The proportion of the top 100 YouTube channels in each country.  ( use the options ui element)

- Chart7: The category that has most Views 
•	Find the category with the Views by adding up all the Views by each category. (add a svg icon after the number, reference:
https://www.svgrepo.com/svg/497849/category-2)

use the d3.select("#Mary_chart_1"), d3.select("#Mary_chart_7") to select the dom placeholder 

todo: add animation for initial transition and transform on load


*/
/* chart1 */
//Dimension
const width = 600,
	height = 500,
	radius = Math.min(width, height) / 3.5,
	padding = 50;

const container = d3.select("#Mary_chart_1");
const svg = container
	.append("svg")
	.attr("class", "marySvgContainer card shadow rounded")
	.attr("width", width)
	.attr("height", height);

//FILTER FOR DROP SHADOW
const defs = svg.append("defs");
defs
	.append("filter")
	.attr("id", "dropShadow")
	.attr("x", "-20%")
	.attr("y", "-20%")
	.attr("width", "140%")
	.attr("height", "140%")
	.append("feDropShadow")
	.attr("dx", 6)
	.attr("dy", 6)
	.attr("stdDeviation", 4)
	.attr("flood-color", "rgba(0,0,0,0.3)");

//TITLE
svg
	.append("text")
	.attr("x", width / 2)
	.attr("y", padding)
	.attr("text-anchor", "middle")
	.style("font-size", "24px")
	.style("font-weight", 700)
	.style("fill", "#3B118D")
	.style("font-family", "'Montserrat', sans-serif")
	.text("Chart1: YouTube Channels in each Country");

//DROPDOWN BELOW TITLE
svg
	.append("foreignObject")
	.attr("x", width / 2 - 80)
	.attr("y", padding + 30)
	.attr("width", 240)
	.attr("height", 30)
	.append("xhtml:div").html(`
          <div style="display:flex; align-items:center; font-size:14px;">
            <label style="font-weight:700; color:#B35FA8; margin-right:5px;">
              Show top countries:
            </label>
            <select id="topSelect" style="color:#B35FA8; font-size:12px;">
              <option value="3">Top 3</option>
              <option value="5">Top 5</option>
              <option value="7" selected>Top 7</option>
              <option value="10">Top 10</option>
              <option value="15">All</option>
            </select>
          </div>
        `);

//CHART GROUP
const chartGroup = svg
	.append("g")
	.attr("transform", `translate(${width / 2.5}, ${height / 1.8})`)
	.attr("filter", "url(#dropShadow)");

//ARCS
const arc = d3
	.arc()
	.innerRadius(radius * 0.6)
	.outerRadius(radius);
const outerArc = d3
	.arc()
	.innerRadius(radius * 1.05)
	.outerRadius(radius * 1.05);
const pie = d3
	.pie()
	.value(d => d.count)
	.sort(null);

//LOAD DATA
d3.csv("data/top_100_youtubers.csv").then(data => {
	const countryCount = d3.rollup(
		data,
		v => v.length,
		d => d.Country
	);
	const total = d3.sum(Array.from(countryCount.values()));

	let countryData = Array.from(countryCount, ([country, count]) => ({
		country,
		count,
		percentage: ((count / total) * 100).toFixed(1),
	}));
	countryData.sort((a, b) => b.count - a.count);
	const countryHasMostYouTubeChannel = countryData[0].country;

	// load from the pedro.js
	/* load the label */
	/* 	d3.select("#Mary_label_1").html(
		`Country with the Highest Number of Channel:<br><span style="color: #8D1179;">${countryHasMostYouTubeChannel}`
	); */

	//COLOR SCALE
	const color = d3
		.scaleOrdinal()
		.domain(countryData.map(d => d.country))
		.range([
			"#3B118D",
			"#8D1179",
			"#118DFF",
			"#12239E",
			"#FFEEAD",
			"#FFD93D",
			"#FF9F1C",
			"#A8E6CF",
			"#DCEDC1",
			"#FFD3B6",
			"#FF8B94",
			"#6C5B7B",
		]);

	//CHART FUNCTION
	function drawChart(topN) {
		chartGroup.selectAll("*").remove();

		const displayData = countryData.slice(0, topN);
		const pieData = pie(displayData);
		const topLabels = Math.min(7, topN);
		const labelSlices = pieData.slice(0, topLabels);

		//DONUT PATHS
		const arcs = chartGroup
			.selectAll("path")
			.data(pieData)
			.enter()
			.append("path")
			.attr("d", arc)
			.attr("fill", d => color(d.data.country))
			.style("stroke-width", "2px");

		//TOOLTIP
		const tooltip1 = d3
			.select("body")
			.append("div")
			.attr("id", "tooltip1")
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

		const countryNames = {
			US: "USA",
			IN: "India",
			BR: "Brazil",
			KR: "South Korea (Republic of Korea)",
			CA: "Canada",
			MX: "Mexico",
			RU: "Russia (Russian Federation)",
			SV: "El Salvador",
			CL: "Chile",
			NO: "Norway",
			PR: "Puerto Rico",
			BY: "Belarus",
			PH: "Philippines",
			TH: "Thailand",
		};

		// Fade animation

		arcs.attr("opacity", 0).transition().duration(2000).attr("opacity", 1);

		//EDGE ARC for leader lines
		const edgeArc = d3.arc().innerRadius(radius).outerRadius(radius);

		//LEADER LINES
		chartGroup
			.selectAll("polyline")
			.data(labelSlices)
			.enter()
			.append("polyline")
			.attr("points", d => {
				const posA = edgeArc.centroid(d); // start at donut edge
				const arcPos = edgeArc.centroid(d);
				const outerPos = outerArc.centroid(d);

				//SHORT MIDPOINT
				const posB = [arcPos[0] * 0.6 + outerPos[0] * 0.4, arcPos[1] * 0.6 + outerPos[1] * 0.4];

				const posC = [...posB];
				posC[0] = (d.startAngle + d.endAngle) / 2 < Math.PI ? posB[0] + 12 : posB[0] - 12;

				return [posA, posB, posC];
			})
			.style("fill", "none")
			.style("stroke", "#8D1179")
			.style("stroke-width", 1);

		//LABEL TEXT
		chartGroup
			.selectAll("text.label")
			.data(labelSlices)
			.enter()
			.append("text")
			.attr("class", "label")
			.style("font-size", "11px")
			.style("fill", "#B35FA8")
			.style("font-family", "Montserrat , Georgia, serif")
			.text(d => `${d.data.percentage}%`)
			.attr("transform", d => {
				const pos = outerArc.centroid(d);
				pos[0] = (d.startAngle + d.endAngle) / 2 < Math.PI ? pos[0] + 12 : pos[0] - 12;
				return `translate(${pos})`;
			})
			.attr("text-anchor", d => ((d.startAngle + d.endAngle) / 2 < Math.PI ? "start" : "end"));

		//LEGEND
		svg.selectAll(".legend").remove(); // remove old legend

		const legend = svg
			.append("g")
			.attr("class", "legend")
			.attr("transform", `translate(${width - 150}, ${height / 4})`);

		legend
			.append("text")
			.attr("class", "legend-title")
			.attr("x", -10)
			.attr("y", 0)
			.style("font-size", "16px")
			.style("font-weight", "bold")
			.style("fill", "#3b118d")
			.style("font-family", "'Merriweather', sans-serif")
			.text("Country");

		const legendItem = legend
			.selectAll(".legend-item")
			.data(displayData) // filtered countries
			.enter()
			.append("g")
			.attr("class", "legend-item")
			.style("cursor", "pointer")
			.style("fill", "#8D1179")
			.style("font-family", "'Merriweather', sans-serif")
			.attr("transform", (d, i) => `translate(0, ${i * 25 + 20})`)

			.on("mouseover", function (event, d) {
				tooltip1.style("opacity", 1).html(`
						<strong>${countryNames[d.country] || d.country}</strong><br>
						Total Views: ${d.count.toLocaleString()}<br>
						${d.percentage}% of all views
					`);
			})
			.on("mousemove", function (event) {
				tooltip1.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
			})
			.on("mouseout", function () {
				tooltip1.style("opacity", 0);
			});

		legendItem
			.append("circle")
			.attr("r", 9)
			.attr("fill", d => color(d.country));

		legendItem
			.append("text")
			.attr("x", 25)
			.attr("dy", "0.35em")
			.style("font-size", "13px")
			.text(d => d.country);
	}

	//INITIAL DRAW
	drawChart(12);

	//DROPDOWN EVENT
	d3.select("#topSelect").on("change", function () {
		const selected = +this.value;
		drawChart(selected);
	});
});

/* chart7 */

//DIMENSIONS
const width7 = 600,
	height7 = 500,
	radius7 = Math.min(width7, height7) / 3.5,
	padding7 = 50;

const container7 = d3.select("#Mary_chart_7");
const svg7 = container7
	.append("svg")
	.attr("class", "marySvgContainer card shadow rounded")
	.attr("width", width7)
	.attr("height", height7);

// DROP SHADOW
const defs7 = svg7.append("defs");
defs7
	.append("filter")
	.attr("id", "dropShadow")
	.attr("x", "-20%")
	.attr("y", "-20%")
	.attr("width", "140%")
	.attr("height", "140%")
	.append("feDropShadow")
	.attr("dx", 6)
	.attr("dy", 6)
	.attr("stdDeviation", 4)
	.attr("flood-color", "rgba(0,0,0,0.3)");

// TITLE
svg7
	.append("text")
	.attr("x", width7 / 2)
	.attr("y", padding7)
	.attr("text-anchor", "middle")
	.style("font-size", "24px")
	.style("font-weight", 700)
	.style("fill", "#3B118D")
	.style("font-family", "'Montserrat', sans-serif")
	.text("Chart7: Most Viewed Categories on YouTube");

// CENTERED GROUP
const chartGroup7 = svg7
	.append("g")
	.attr("transform", `translate(${width7 / 2.9}, ${height7 / 1.8})`)
	.attr("filter", "url(#dropShadow)");

d3.csv("data/top_100_youtubers.csv").then(data => {
	data.forEach(d => (d.Views = +d.Views));

	const categoryViews = d3.rollup(
		data,
		v => d3.sum(v, d => d.Views),
		d => d.Category
	);

	let categoryData = Array.from(categoryViews, ([category, totalViews]) => ({
		category,
		totalViews,
	}));

	categoryData.sort((a, b) => b.totalViews - a.totalViews);
	const mostViewedCate = categoryData[0].category;
	console.log(mostViewedCate);

	/* load the label */

	d3.select("#Mary_label_7").html(
		`Most Viewed Category:<br><span style="color: #8D1179;">${mostViewedCate}`
	);

	const totalViewsAll = d3.sum(categoryData, d => d.totalViews);
	categoryData = categoryData.map(d => ({
		...d,
		percentage: ((d.totalViews / totalViewsAll) * 100).toFixed(1),
	}));

	const labelSlices7 = categoryData.slice(0, 7);
	categoryData = categoryData.slice(0, 12);

	const color7 = d3
		.scaleOrdinal()
		.domain(categoryData.map(d => d.category))
		.range([
			"#3B118D",
			"#8D1179",
			"#118DFF",
			"#12239E",
			"#FFEEAD",
			"#FFD93D",
			"#FF9F1C",
			"#A8E6CF",
			"#DCEDC1",
			"#FFD3B6",
			"#FF8B94",
			"#6C5B7B",
		]);

	// PIE version (innerRadius = 0)
	const pie7 = d3
		.pie()
		.value(d => d.totalViews)
		.sort(null);

	const arc7 = d3
		.arc()
		.innerRadius(0) // ← PURE PIE
		.outerRadius(radius7);

	const tooltip7 = d3
		.select("body")
		.append("div")
		.attr("id", "tooltip7")
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

	const edgeArc7 = d3.arc().innerRadius(radius7).outerRadius(radius7);

	const outerArc7 = d3
		.arc()
		.innerRadius(radius7 * 1.1)
		.outerRadius(radius7 * 1.1);

	// PIE CHART
	const arcs = chartGroup7
		.selectAll("path")
		.data(pie7(categoryData))
		.enter()
		.append("path")
		.attr("d", arc7)
		.attr("fill", d => color7(d.data.category))
		.style("stroke-width", "2px");

	// Fade animation
	arcs.attr("opacity", 0).transition().duration(2000).attr("opacity", 1);

	const pieData7 = pie7(categoryData);

	// LEADER LINES
	chartGroup7
		.selectAll("polyline")
		.data(pieData7.slice(0, 7))
		.enter()
		.append("polyline")
		.attr("points", d => {
			const posA = edgeArc7.centroid(d);
			const arcPos = edgeArc7.centroid(d);
			const outerPos = outerArc7.centroid(d);

			const posB = [arcPos[0] * 0.6 + outerPos[0] * 0.4, arcPos[1] * 0.6 + outerPos[1] * 0.4];

			const posC = [...posB];
			posC[0] = (d.startAngle + d.endAngle) / 2 < Math.PI ? posB[0] + 12 : posB[0] - 12;

			return [posA, posB, posC];
		})
		.style("fill", "none")
		.style("stroke", "#8D1179")
		.style("stroke-width", 1);

	// LABELS
	chartGroup7
		.selectAll("text.label")
		.data(pieData7.slice(0, 7))
		.enter()
		.append("text")
		.attr("class", "label")
		.style("font-size", "11px")
		.style("fill", "#B35FA8")
		.style("font-family", "'Montserrat', 'Georgia', serif")
		.text(d => `${d.data.percentage}%`)
		.attr("transform", d => {
			const pos = outerArc7.centroid(d);
			pos[0] = (d.startAngle + d.endAngle) / 2 < Math.PI ? pos[0] + 12 : pos[0] - 12;
			return `translate(${pos})`;
		})
		.attr("text-anchor", d => ((d.startAngle + d.endAngle) / 2 < Math.PI ? "start" : "end"));

	// LEGEND
	const legend7 = svg7
		.append("g")
		.attr("class", "legend")
		.attr("transform", `translate(${width7 - 160}, ${height7 / 3.5})`);

	legend7
		.append("text")
		.attr("x", -10)
		.attr("y", 0)
		.style("font-size", "16px")
		.style("font-weight", "bold")
		.style("fill", "#3b118d")
		.style("font-family", "'Merriweather', sans-serif")
		.text("Category");

	const legendItem7 = legend7
		.selectAll(".legend-item")
		.data(categoryData)
		.enter()
		.append("g")
		.attr("class", "legend-item")
		.style("cursor", "pointer")
		.style("fill", "#8D1179")
		.style("font-family", "'Merriweather', sans-serif")
		.attr("transform", (d, i) => `translate(0, ${i * 25 + 20})`)
		// tooltip
		.on("mouseover", function (event, d) {
			tooltip7.style("opacity", 1).html(`
					<strong>${d.category}</strong><br>
					Total Views: ${d.totalViews.toLocaleString()}<br>
					${d.percentage}% of all views
				`);
		})
		.on("mousemove", function (event) {
			tooltip7.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
		})
		.on("mouseout", function () {
			tooltip7.style("opacity", 0);
		});

	legendItem7
		.append("circle")
		.attr("r", 9)
		.attr("fill", d => color7(d.category));

	legendItem7
		.append("text")
		.attr("x", 25)
		.attr("dy", "0.35em")
		.style("font-size", "13px")
		.text(d => d.category);
});
