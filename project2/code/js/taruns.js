/* 
Pedro to do:

- Chart3: Each category’s number of youtubers 

- Chart4: The top 5 YouTube channels' average view changes every month 

•	Display x-axis tick with Month Name (‘Jan’, ‘Feb’ … or ‘January’, ‘February’…)

for chart 4 please use the switch btn ui element to toggle show all top 5, also use the checkboxes to select toggle each channel data, so you will have 5 checkboxes for top1 to top5, and a switch button for show all.

please learn the project1 source code, where you can find the checkboxes, switch button styling class, and all the styling classname for the UI element is in the ./styles/elements.css 

please refers to ./assets/charts/3_youtuberPerCategory.jpg and 4_MonthlyView for styling references

use the d3.select("#Taruns_chart_3")  d3.select("#Taruns_chart_4")  to select the dom placeholder 

*/

// Tarun's charts: Chart 3 & Chart 4
// This file uses D3 v7 (already loaded in index.html)

/* todo: use the switch button, for show all instead of the options button */

// Helper for nicely formatted numbers
const tarunFormatNum = d3.format(",");

// -------- Chart 3: Each category's number of YouTubers --------
(function renderTarunChart3() {
	const container = d3.select("#Taruns_chart_3");
	if (container.empty()) return;

	// Clean anything that might already be there
	container.selectAll("*").remove();

	// Basic layout
	const width = 600;
	const height = 500;
	const margin = { top: 60, right: 30, bottom: 110, left: 80 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Add a wrapper div for some spacing / title
	/* 	const card = container.append("div").attr("class", "mb-4 p-3 bg-white rounded shadow-sm"); */

	/* 	card.append("text").attr("class", "h3 mb-1").text("Chart 3 – Number of YouTubers per Category"); */

	/* card
		.append("p")
		.attr("class", "h_sub_title mb-3")
		.text(
			"Counts how many channels appear in each category from the top 100 YouTube channels list."
		); */

	const svg = container
		.append("svg")
		.attr("width", width)
		.attr("height", height)
		.attr("class", "shadow card rounded");

	//add title
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", margin.top / 2 + 10)
		.attr("text-anchor", "middle")
		.style("font-size", "24px")
		.style("font-weight", 700)
		.style("fill", "#3B118D")
		.style("font-family", "'Montserrat', sans-serif")
		.text("Chart3: Number of YouTubers per Category");

	const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top + 10})`);

	d3.csv("./data/top_100_youtubers.csv")
		.then(raw => {
			// Group by Category and count channels
			const categoryCounts = d3
				.rollups(
					raw,
					v => v.length,
					d => d.Category
				)
				.map(([Category, count]) => ({ Category, count }))
				.sort((a, b) => d3.descending(a.count, b.count));

			const x = d3
				.scaleBand()
				.domain(categoryCounts.map(d => d.Category))
				.range([0, innerWidth])
				.padding(0.2);

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(categoryCounts, d => d.count) || 0])
				.nice()
				.range([innerHeight, 0]);

			// X Axis
			g.append("g")
				.attr("transform", `translate(0,${innerHeight})`)
				.call(d3.axisBottom(x))
				.selectAll("text")
				.attr("transform", "rotate(-35)")
				.style("text-anchor", "end")
				.style("fill", "#8d1179")
				.style("font-size", "12px");

			// Y Axis
			g.append("g")
				.call(d3.axisLeft(y).ticks(6))
				.selectAll("text")
				.style("fill", "#8d1179")
				.style("font-size", "12px");

			// Axis labels
			g.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", innerHeight + 80)
				.attr("text-anchor", "middle")
				.style("font-family", "'Merriweather', serif")
				.style("font-weight", 700)
				.style("font-size", "16px")
				.style("fill", "#3b118d")
				.text("Category");

			g.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -innerHeight / 2)
				.attr("y", -50)
				.attr("text-anchor", "middle")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "16px")
				.style("font-weight", 700)
				.style("fill", "#3b118d")
				.text("Number of YouTubers");

			// Tooltip
			const tooltip = container
				.append("div")
				.attr("class", "tooltip")
				.style("position", "absolute")
				.style("opacity", 0)
				.style("pointer-events", "none")
				.style("padding", "8px 16px")
				.style("border-radius", "8px")
				.style("line-height", "18px")
				.style("background", "#b35fa8")
				.style("color", "#F3F1FA")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "12px")
				.style("font-weight", "400")
				.style("border-radius", "8px")
				.style("box-shadow", "2px 2px 6px rgba(0,0,0,0.3)");

			// Bars
			const barColor = "#3b118d";

			g.selectAll(".bar")
				.data(categoryCounts)
				.enter()
				.append("rect")
				.attr("class", "bar")
				.attr("x", d => x(d.Category))
				.attr("width", x.bandwidth())
				.attr("y", innerHeight)
				.attr("height", 0)
				.style("fill", barColor)
				.style("cursor", "pointer")
				.transition()
				.duration(800)
				.attr("y", d => y(d.count))
				.attr("height", d => innerHeight - y(d.count));

			// Add hover interaction (after transition)
			container
				.selectAll("rect.bar")
				.on("mouseover", function (event, d) {
					d3.select(this).transition().duration(150).style("fill", "#8D1179");

					tooltip
						.style("opacity", 0.95)
						.html(`<strong>${d.Category}</strong><br/>Channels: ${tarunFormatNum(d.count)}`)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", function () {
					d3.select(this).transition().duration(150).style("fill", barColor);
					tooltip.style("opacity", 0);
				});
		})
		.catch(err => {
			console.error("Error loading data for Chart 3:", err);
			container
				.append("p")
				.attr("class", "text-danger mt-2")
				.text("Unable to load data for Chart 3.");
		});
})();

// -------- Chart 4: Top 5 channels average monthly views (line chart + switch) --------
(function renderTarunChart4() {
	const container = d3
		.select("#Taruns_chart_4")
		.style("width", "600px")
		.style("max-width", "600px")
		.attr("class", "shadow card rounded pt-4")
		.style("background", "#f3f1fa");

	if (container.empty()) return;

	container.selectAll("*").remove();

	const width = 600;
	const height = 400;
	const margin = { top: 60, right: 20, bottom: 60, left: 80 };
	const innerWidth = width - margin.left - margin.right;
	const innerHeight = height - margin.top - margin.bottom;

	// Wrapper card
	/* const card = container.append("div").attr("class", "mb-4 p-3 bg-white rounded shadow-sm"); */

	/* 	titleBox
		.append("p")
		.attr("class", "h_sub_title mb-0")
		.text("Toggle channels with checkboxes. Use the switch to quickly show or hide all lines."); */

	const header = container
		.append("div")

		.attr("class", "d-flex flex-column  justify-content-center align-items-center gap-2");

	const titleBox = header.append("div");
	titleBox
		.append("text")
		.style("color", "#3b118d")
		.style("font-family", "'Montserrat', sans-serif")
		.style("font-size", "24px")
		.style("font-weight", 700)
		.text("Chart4: Top 5 Monthly Average Views");

	// Controls: checkboxes + switch
	const controls = header
		.append("div")
		.attr("class", "d-flex flex-column flex-wrap align-items-start gap-4 mt-2");

	const svg = container.append("svg").attr("width", width).attr("height", height);

	const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

	d3.csv("./data/avg_view_every_month.csv")
		.then(raw => {
			// The first column is Month, the rest are channels
			const columns = raw.columns || Object.keys(raw[0]);

			const monthCol = columns[0];
			const channelNames = columns.slice(1);

			// Create month labels ("Jan", "Feb", ...) based on row index
			const monthNames = [
				"Jan",
				"Feb",
				"Mar",
				"Apr",
				"May",
				"Jun",
				"Jul",
				"Aug",
				"Sep",
				"Oct",
				"Nov",
				"Dec",
			];

			raw.forEach((d, i) => {
				d.monthLabel = monthNames[i] || d[monthCol];
				channelNames.forEach(name => {
					d[name] = +d[name];
				});
			});

			const x = d3
				.scalePoint()
				.domain(raw.map(d => d.monthLabel))
				.range([0, innerWidth])
				.padding(0.5);

			const y = d3
				.scaleLinear()
				.domain([0, d3.max(raw, d => d3.max(channelNames, name => d[name])) || 0])
				.nice()
				.range([innerHeight, 0]);

			const color = d3
				.scaleOrdinal()
				.domain(channelNames)
				.range(["#6200EA", "#03A9F4", "#4CAF50", "#FF9800", "#E91E63"]);

			// Axes
			g.append("g")
				.attr("transform", `translate(0,${innerHeight})`)
				.call(d3.axisBottom(x))
				.selectAll("text")
				.style("font-size", "12px")
				.style("fill", "#8d1179");

			g.append("g")
				.call(
					d3
						.axisLeft(y)
						.ticks(6)
						.tickFormat(d => d3.format(".2s")(d))
				)
				.selectAll("text")

				.style("font-size", "12px")
				.style("fill", "#8d1179");

			// Axis labels
			g.append("text")
				.attr("x", innerWidth / 2)
				.attr("y", innerHeight + 60)
				.attr("text-anchor", "middle")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "16px")
				.style("font-weight", 700)
				.style("fill", "#3b118d")
				.text("Month");

			g.append("text")
				.attr("transform", "rotate(-90)")
				.attr("x", -innerHeight / 2)
				.attr("y", -50)
				.attr("text-anchor", "middle")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "16px")
				.style("font-weight", 700)
				.style("fill", "#3b118d")
				.text("Average Views");

			// Line generator
			const line = d3
				.line()
				.x(d => x(d.monthLabel))
				.y(d => y(d.value))
				.curve(d3.curveMonotoneX);

			// Prepare data per channel
			const channelSeries = channelNames.map(name => ({
				name,
				values: raw.map(d => ({
					monthLabel: d.monthLabel,
					value: d[name],
				})),
			}));

			// Tooltip for chart 4
			/* 	const tooltip = card
				.append("div")
				.attr("class", "tooltip shadow")
				.style("position", "absolute")
				.style("opacity", 0)
				.style("pointer-events", "none")
				.style("padding", "8px 10px")
				.style("border-radius", "4px")
				.style("background", "#b35fa8")
				.style("color", "white")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "12px"); */
			const tooltip = container
				.append("div")
				.attr("class", "tooltip")
				.style("position", "absolute")
				.style("opacity", 0)
				.style("pointer-events", "none")
				.style("padding", "8px 16px")
				.style("border-radius", "8px")
				.style("line-height", "18px")
				.style("background", "#b35fa8")
				.style("color", "#F3F1FA")
				.style("font-family", "'Merriweather', serif")
				.style("font-size", "12px")
				.style("font-weight", "400")
				.style("border-radius", "8px")
				.style("box-shadow", "2px 2px 6px rgba(0,0,0,0.3)");

			// Draw lines
			const linesGroup = g.append("g").attr("class", "lines-group");

			const linePaths = linesGroup
				.selectAll(".tarun-line")
				.data(channelSeries)
				.enter()
				.append("path")
				.attr("class", "tarun-line")
				.attr("fill", "none")
				.attr("stroke-width", 2.5)
				.attr("stroke", d => color(d.name))
				.attr("opacity", 0.9)
				.attr("d", d => line(d.values));

			// Animate lines on load
			linePaths.each(function () {
				const totalLength = this.getTotalLength();
				d3.select(this)
					.attr("stroke-dasharray", totalLength + " " + totalLength)
					.attr("stroke-dashoffset", totalLength)
					.transition()
					.duration(900)
					.ease(d3.easeCubicOut)
					.attr("stroke-dashoffset", 0);
			});

			// Draw points for hover interaction
			const pointsGroup = g.append("g").attr("class", "points-group");

			const allPoints = pointsGroup
				.selectAll("g.point-group")
				.data(channelSeries)
				.enter()
				.append("g")
				.attr("class", d => `point-group channel-${d.name.replace(/\\W/g, "")}`);

			allPoints
				.selectAll("circle")
				.data(d => d.values.map(v => ({ ...v, channel: d.name })))
				.enter()
				.append("circle")
				.attr("r", 4)
				.attr("cx", d => x(d.monthLabel))
				.attr("cy", d => y(d.value))
				.attr("fill", d => color(d.channel))
				.attr("opacity", 0.0) // keep invisible until hover
				.style("cursor", "pointer")
				.on("mouseover", function (event, d) {
					d3.select(this).attr("opacity", 1);

					tooltip
						.style("opacity", 0.95)
						.html(
							`<div class="d-flex flex-column gap-1">
							<span><strong>${d.channel}</strong></span>
							<span>Month: ${d.monthLabel}</span>
							<span>Views: ${tarunFormatNum(d.value)}</span>
						</div>`
						)
						.style("left", event.pageX + 10 + "px")
						.style("top", event.pageY - 28 + "px");
				})
				.on("mouseout", function () {
					d3.select(this).attr("opacity", 0);
					tooltip.style("opacity", 0);
				});

			// ---- Controls logic ----

			// Keep track of what's visible
			const selected = new Set(channelNames);

			// Checkbox controls
			const checkboxContainer = controls
				.append("div")
				.attr("class", "d-flex gap-2 align-items-center ");

			channelNames.forEach(name => {
				const wrapper = checkboxContainer
					.append("label")
					.attr("class", "d-flex align-items-center gap-1")
					.style("color", () => color(name))
					.style("font-weight", 600);

				const idSafe = name.replace(/\\W/g, "");

				wrapper
					.append("input")
					.attr("type", "checkbox")
					.attr("class", "form-check-input h_checkbox")
					.style("margin-top", "0")
					.style("vertical-align", "middle")
					.attr("id", `chk_${idSafe}`)
					.property("checked", true)
					.on("change", function () {
						if (this.checked) {
							selected.add(name);
						} else {
							selected.delete(name);
						}
						updateVisibility();
						updateSwitchState();
					});

				wrapper.append("span").style("font-size", "12px").text(name);
			});

			// "Show all" switch
			const switchWrapper = controls
				.append("div")
				.style("width", "400px")
				.attr("class", "d-flex align-items-center gap-2 form-switch form-check");

			const showAllSwitch = switchWrapper
				.append("input")
				.attr("id", "showAllSwitch")
				.attr("type", "checkbox")
				.attr("role", "switch")
				.attr("class", "form-check-input h_switch")
				.property("checked", true)
				.on("change", function () {
					const checked = this.checked;
					selected.clear();
					if (checked) {
						channelNames.forEach(n => selected.add(n));
					}
					// Update all checkboxes
					checkboxContainer.selectAll("input[type='checkbox']").property("checked", checked);
					updateVisibility();
				});

			switchWrapper
				.append("label")
				.attr("class", "form-check-label")
				.attr("for", "showAllSwitch")
				.text("Show all");

			function updateSwitchState() {
				// If every channel is selected, switch is ON; otherwise OFF
				const allSelected = channelNames.every(n => selected.has(n));
				showAllSwitch.property("checked", allSelected);
			}

			function updateVisibility() {
				linePaths.attr("display", d => (selected.has(d.name) ? null : "none"));

				allPoints.attr("display", d => (selected.has(d.name) ? null : "none"));
			}

			// Initial visibility
			updateVisibility();
		})
		.catch(err => {
			console.error("Error loading data for Chart 4:", err);
			container
				.append("p")
				.attr("class", "text-danger mt-2")
				.text("Unable to load data for Chart 4.");
		});
})();
