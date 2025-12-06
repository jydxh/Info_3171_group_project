/* 
Pedro to do:

- Chart5: The top 5 YouTube channels’ Quarterly income. (check box) - (now using brush)
- Use stacked bar chart
- Add brush to select an X-range and show proportional Selected Total

use the d3.select("#Pedro_chart_5") to select the dom placeholder 


todo:each stack should show the value,refer to the ./assets/charts/6_channelsByMainTopic.jpg for details
*/

(function () {
	const CSV_PATH = "./data/top_100_youtubers.csv";

	// Brand colors
	const PRIMARY = "#3B118D";
	const SECONDARY = "#8D1179";
	const ACCENT = "#B35FA8";
	const Q_COLORS = [PRIMARY, SECONDARY, "#E1A35A", "#36CCE5"]; // Q1..Q4

	// Layout
	let width = 1000;
	let height = 420;
	const margin = { top: 42, right: 28, bottom: 120, left: 120 };

	// Check screen size and adjust dimensions
	if (window.innerWidth <= 768) {
		width = 500;
		height = 350;
		margin.left = 180; // Reduce left margin for smaller screens
	}

	const innerW = width - margin.left - margin.right;
	const innerH = height - margin.top - margin.bottom;

	// Brush vertical padding
	const BRUSH_TOP_PAD = 15;
	const BRUSH_BOTTOM_PAD = 15;

	const container = d3.select("#Pedro_chart_5");
	container.selectAll("*").remove();

	const svg = container
		.append("svg")
		.attr("class", "pedroSvgContainer card rounded shadow")
		.attr("width", width)
		.attr("height", height)
		.attr("viewBox", `0 0 ${width} ${height}`) // Add viewBox for scaling
		.style("max-width", "100%") // Make it responsive
		.style("height", "auto");
	// Subtle card bg
	d3.select(".pedroSvgContainer").style("background-color", "#F3F1FA");

	// Title
	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", margin.top)
		.attr("text-anchor", "middle")
		.style("font-family", "'Montserrat', sans-serif")
		.style("font-size", "24px")
		.style("font-weight", 700)
		.style("fill", PRIMARY)
		.text("Chart5: Top 5 Channels — Quarterly Income");

	// Selected Total badge (SVG)
	const badge = svg.append("g").attr("transform", `translate(${width - 210}, ${margin.top + 20})`);
	badge
		.append("rect")
		.attr("rx", 8)
		.attr("ry", 8)
		.attr("width", 160)
		.attr("height", 28)
		.attr("fill", "#FFFFFF")
		.attr("stroke", "#D9D9E0");
	const badgeText = badge
		.append("text")
		.attr("x", 10)
		.attr("y", 19)
		.style("font-family", "'Poppins', sans-serif")
		.style("font-size", "12px")
		.style("fill", "#1A1625")
		.text("Selected Total: 0");

	// Main group
	const g = svg.append("g").attr("transform", `translate(${margin.left}, ${margin.top + 60})`);

	// Axes & stack
	const x = d3.scaleLinear().range([0, innerW]).domain([0, 3_500_000]);
	const y = d3.scaleBand().range([0, innerH]).padding(0.24);
	const stack = d3.stack().keys(["Q1", "Q2", "Q3", "Q4"]);
	const color = d3.scaleOrdinal().domain(["Q1", "Q2", "Q3", "Q4"]).range(Q_COLORS);

	const xAxisG = g.append("g").attr("transform", `translate(0, ${innerH})`);
	const yAxisG = g.append("g");

	g.append("text")
		.attr("x", innerW / 2)
		.attr("y", innerH + 44)
		.attr("text-anchor", "middle")
		.style("font-family", "'Merriweather', sans-serif")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.style("fill", PRIMARY)
		.text("Income (USD)");

	// Add Y-axis label
	g.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -innerH / 2)
		.attr("y", -margin.left + 25)
		.attr("text-anchor", "middle")
		.style("font-family", "'Merriweather', sans-serif")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.style("fill", PRIMARY)
		.text("YouTube Channels");

	const fmt = v => (v >= 1e6 ? (v / 1e6).toFixed(1) + "M" : d3.format(".2s")(v));

	// Layers
	const barsLayer = g.append("g");
	const highlightLayer = g.append("g");
	const brushLayer = g.append("g");

	let currentData = [];
	let currentSeries = [];

	d3.csv(CSV_PATH).then(raw => {
		raw.forEach(d => {
			d.Q1 = +String(d["Income q1"] ?? 0).replace(/,/g, "");
			d.Q2 = +String(d["Income q2"] ?? 0).replace(/,/g, "");
			d.Q3 = +String(d["Income q3"] ?? 0).replace(/,/g, "");
			d.Q4 = +String(d["Income q4"] ?? 0).replace(/,/g, "");
			d.ChannelName = d.ChannelName || d.username || "Unknown";
			d.total = d.Q1 + d.Q2 + d.Q3 + d.Q4;
		});

		currentData = raw.sort((a, b) => b.total - a.total).slice(0, 5);
		draw();
		addBrush();
	});

	function draw() {
		y.domain(currentData.map(d => d.ChannelName));

		xAxisG
			.call(d3.axisBottom(x).ticks(8).tickFormat(fmt))
			.selectAll("text")
			.style("font-size", "12px")
			.style("fill", SECONDARY);

		yAxisG
			.call(d3.axisLeft(y))
			.selectAll("text")
			.style("fill", SECONDARY)
			.style("font-size", "12px")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-45)")
			.text(d => (d.length > 15 ? d.substring(0, 15) + "..." : d));

		currentSeries = stack(currentData);

		const groups = barsLayer.selectAll("g.layer").data(currentSeries, s => s.key);
		groups.exit().remove();
		const groupsEnter = groups
			.enter()
			.append("g")
			.attr("class", "layer")
			.attr("fill", s => color(s.key));
		const groupsMerge = groupsEnter.merge(groups);

		const rects = groupsMerge.selectAll("rect.seg").data(
			s => s,
			d => d.data.ChannelName
		);
		rects.exit().remove();
		rects
			.enter()
			.append("rect")
			.attr("class", "seg")
			.attr("x", d => x(d[0]))
			.attr("y", d => y(d.data.ChannelName))
			.attr("height", y.bandwidth())
			.attr("width", 0)
			.merge(rects)
			.transition()
			.duration(300)
			.attr("x", d => x(d[0]))
			.attr("y", d => y(d.data.ChannelName))
			.attr("height", y.bandwidth())
			.attr("width", d => Math.max(1, x(d[1]) - x(d[0])));

		// Add text labels for each stack segment
		const labels = groupsMerge.selectAll("text.label").data(
			s => s,
			d => d.data.ChannelName
		);
		labels.exit().remove();
		labels
			.enter()
			.append("text")
			.attr("class", "pedro_rect_label")
			.attr("text-anchor", "middle")
			.attr("dy", "0.35em")
			.attr("fill", ACCENT)
			.style("pointer-events", "none")
			.merge(labels)
			.transition()
			.duration(300)
			.attr("x", d => {
				const rectX = x(d[0]);
				const rectWidth = Math.max(1, x(d[1]) - x(d[0]));
				return rectX + rectWidth / 2;
			})
			.attr("y", d => y(d.data.ChannelName) + y.bandwidth() / 2)
			.attr("fill", ACCENT)
			.text(d => {
				const value = d[1] - d[0];
				// Only show text if the segment is wide enough
				const rectWidth = Math.max(1, x(d[1]) - x(d[0]));
				return rectWidth > 40 ? fmt(value) : "";
			});

		// Clear highlight & badge
		highlightLayer.selectAll("*").remove();
		badgeText.text("Selected Total: 0");
	}

	function addBrush() {
		const brush = d3
			.brushX()
			.extent([
				[0, BRUSH_TOP_PAD],
				[innerW, innerH - BRUSH_BOTTOM_PAD],
			])
			.on("brush", brushed)
			.on("end", brushed);

		brushLayer.call(brush);

		function brushed(event) {
			if (!event.selection) {
				highlightLayer.selectAll("*").remove();
				badgeText.text("Selected Total: 0");
				return;
			}

			const [x0, x1] = event.selection;
			const hi = [];
			let total = 0;

			currentSeries.forEach(series => {
				const fill = color(series.key);
				series.forEach(seg => {
					const yName = seg.data.ChannelName;
					const yTop = y(yName),
						yH = y.bandwidth();

					const v0 = seg[0],
						v1 = seg[1];
					const px0 = x(v0),
						px1 = x(v1);

					const left = Math.max(x0, px0);
					const right = Math.min(x1, px1);
					const w = Math.max(0, right - left);

					if (w > 0) {
						const segW = Math.max(1, px1 - px0);
						const v = v1 - v0;
						total += (w / segW) * v;

						hi.push({ x: left, y: yTop, w, h: yH, fill });
					}
				});
			});

			badgeText.text(`Selected Total: ${fmt(total)}`);

			const r = highlightLayer.selectAll("rect.hi").data(hi);
			r.exit().remove();
			r.enter()
				.append("rect")
				.attr("class", "hi")
				.merge(r)
				.attr("x", d => d.x)
				.attr("y", d => d.y)
				.attr("width", d => d.w)
				.attr("height", d => d.h)
				.attr("fill", d => d.fill);
		}
	}
})();
