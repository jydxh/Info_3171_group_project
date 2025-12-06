/*
Mohamed todo: 
  
- Chart6: The number of YouTube channels by ‘MainTopic’  
( input, button,form, badges to show the user input state, like error or success, or pending)
•	Chart should be displayed interactively by selected year. 
•	Get Input from the user is required to accept the year.
•	Display 2006 as default year 
•	Change the title of the chart according to the year changes.
•	In mobile version, find the best way to accept the user’s input


please learn the project1 source code, where you can find the input, button, and badges styling class, and all the styling classname for the UI element is in the ./styles/elements.css 


please refer to the ./assets/dashboard/10_channelsByMainTopic.jpg  for more styling reference, also you might need to add a form for user interactively 

use the d3.select("#Mohamed_chart_6") to select the dom placeholder 

*/
/*  INFO-3171 Project 2 — Chart 6 (Mohamed)
    Chart: Number of YouTube channels by MainTopic (interactive by year)
    Requirements covered:
    - Uses d3.select("#Mohamed_chart_6") to select placeholder
    - Default year = 2006
    - User input (form + button), badges for state (pending/success/error)
    - Title changes with year
    - Mobile-friendly input (select on small screens; number input on md+)

    Notes:
    - This script tries multiple likely data file paths. If your dataset is in a different path,
      update DATA_CANDIDATE_PATHS below.
    - This script is defensive about column names. It attempts to detect:
        Year column: Year, year, created_year, createdYear, channelCreatedYear, etc.
        MainTopic column: MainTopic, main_topic, mainTopic, topic, category, etc.
        Channel identifier (optional): Channel, channel_name, channelTitle, name, etc.
*/

(() => {
	const ROOT_SEL = "#Mohamed_chart_6";

	// ---------- CONFIG ----------
	const DEFAULT_YEAR = 2006;
	const TOP_N = 10;

	// Update these if your data lives somewhere else
	const DATA_CANDIDATE_PATHS = [
		"./data/top_100_youtubers.csv",
		/* 	"./data/youtube_data.csv",
		"./data/youtubeChannels.csv",
		"./data/channels.csv",
		"./data/top_youtube_channels.csv",
		"./data/youtube_cleaned.csv",
		"./data/data.csv", */
	];

	// ---------- HELPERS ----------
	function normKey(k) {
		return String(k || "")
			.trim()
			.toLowerCase()
			.replace(/\s+/g, "")
			.replace(/[_-]+/g, "");
	}

	function pickColumn(columns, candidates) {
		const normMap = new Map(columns.map(c => [normKey(c), c]));
		for (const cand of candidates) {
			const hit = normMap.get(normKey(cand));
			if (hit) return hit;
		}
		return null;
	}

	function toYear(v) {
		if (v == null) return null;
		const s = String(v).trim();
		if (!s) return null;

		// pure 4-digit year
		const m = s.match(/(19|20)\d{2}/);
		if (m) return +m[0];

		// try Date parse
		const d = new Date(s);
		if (!Number.isNaN(d.getTime())) return d.getFullYear();

		return null;
	}

	async function loadFirstCsv(paths) {
		let lastErr = null;
		for (const p of paths) {
			try {
				const rows = await d3.csv(p, d3.autoType);
				console.log(rows);
				if (rows && rows.length) return { rows, path: p };
			} catch (err) {
				lastErr = err;
			}
		}
		throw lastErr || new Error("No data file could be loaded.");
	}

	function makeBadgeHTML(kind, text) {
		// Prefer your project's element classes, but keep Bootstrap as fallback.
		const base = ["badge"];
		if (kind === "pending") base.push("bg-warning");
		if (kind === "success") base.push("bg-success");
		if (kind === "error") base.push("bg-error");
		return `<span class="${base.join(" ")}" role="status" aria-live="polite">${text}</span>`;
	}

	// ---------- UI BUILD ----------
	const root = d3.select(ROOT_SEL);
	if (root.empty()) {
		console.warn(`[Chart6] Could not find ${ROOT_SEL}`);
		return;
	}

	// Clear placeholder
	root.selectAll("*").remove();

	// Card container (match your existing card styling)
	const card = root
		.append("div")
		.attr("class", "bg-background card p-4 shadow rounded")
		.style("width", "600px")
		.style("max-width", "100%");

	// Header
	const header = card
		.append("div")
		.attr("class", "d-flex flex-wrap gap-3 align-items-start justify-content-between mb-3");
	const titleWrap = header.append("div").attr("class", "me-2");
	const titleEl = titleWrap
		.append("h3")
		.attr("class", "text-primary mb-2")
		.text(`Channels by Main Topic — ${DEFAULT_YEAR}`)
		.style("font-size", "24px")
		.style("font-weight", 700)
		.style("fill", "#3B118D")
		.style("font-family", "'Montserrat', sans-serif");

	//Subtext / Caption	Poppins	400	14px	20px

	titleWrap
		.append("p")
		.attr("class", "text-secondary mb-0")
		.text(`Top ${TOP_N} topics (count of channels)`)
		.style("font-size", "14px")
		.style("font-weight", 400)
		.style("font-family", "Poppins");

	const statusWrap = header.append("div").attr("class", "d-flex align-items-center gap-2");
	const statusEl = statusWrap
		.append("div")
		.attr("id", "mohamed_chart6_status")
		.html(makeBadgeHTML("pending", "Loading data…"));

	// Form / Inputs
	const form = card
		.append("form")
		.attr("class", "d-flex flex-column gap-2 mb-2")
		.attr("autocomplete", "off");

	// Mobile: select (best UX on mobile)
	const mobileRow = form
		.append("div")
		.attr("class", "d-flex d-md-none gap-2 align-items-center flex-wrap");
	mobileRow
		.append("label")
		.attr("class", "text-secondary")
		.attr("for", "mohamed_chart6_year_select")
		.text("Year");
	const yearSelect = mobileRow
		.append("select")
		.attr("id", "mohamed_chart6_year_select")
		.attr("class", "form-select")
		.style("min-width", "140px");

	mobileRow.append("button").attr("type", "submit").attr("class", "btn btn-primary").text("Update");

	// Desktop/tablet: number input + button
	const desktopRow = form
		.append("div")
		.attr("class", "d-none d-md-flex gap-2 align-items-center flex-wrap");
	desktopRow
		.append("label")
		.attr("class", "text-secondary")
		.attr("for", "mohamed_chart6_year_input")
		.text("Year");
	const yearInput = desktopRow
		.append("input")
		.attr("id", "mohamed_chart6_year_input")
		.attr("type", "number")
		//.attr("class", "form-control")
		.attr("min", "1900")
		.attr("max", "2100")
		.attr("step", "1")
		.attr("placeholder", "Enter number of year here")
		.style("width", "140px")
		.property("value", DEFAULT_YEAR);

	desktopRow.append("button").attr("type", "submit").attr("class", "h_btn-primary").text("Update");

	// Chart container
	const chartWrap = card.append("div").attr("class", "position-relative");
	const svg = chartWrap.append("svg").attr("class", "w-100");
	const tooltip = chartWrap
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
	// .attr("class", "position-absolute p-2 rounded shadow bg-white")
	// .style("pointer-events", "none")
	// .style("opacity", 0)
	// .style("font-size", "12px");

	// ---------- CHART LOGIC ----------
	let DATA = null;
	let DATA_PATH = null;
	let COL_YEAR = null;
	let COL_TOPIC = null;
	let COL_CHANNEL = null;
	let AVAILABLE_YEARS = [];

	function setStatus(kind, text) {
		statusEl.html(makeBadgeHTML(kind, text));
	}

	function getUserYear() {
		const isMobile = window.matchMedia && window.matchMedia("(max-width: 767.98px)").matches;
		const raw = isMobile ? yearSelect.property("value") : yearInput.property("value");
		return toYear(raw);
	}

	function computeCountsForYear(year) {
		const rows = DATA.filter(d => toYear(d[COL_YEAR]) === year);

		const grouped = d3.rollups(
			rows,
			v => (COL_CHANNEL ? new Set(v.map(d => String(d[COL_CHANNEL] ?? ""))).size : v.length),
			d => String(d[COL_TOPIC] ?? "Unknown").trim() || "Unknown"
		);

		return grouped
			.map(([topic, count]) => ({ topic, count }))
			.filter(d => d.topic && d.topic !== "Unknown")
			.sort((a, b) => d3.descending(a.count, b.count))
			.slice(0, TOP_N);
	}

	function render(year) {
		const containerWidth = Math.max(
			320,
			Math.min(900, card.node().getBoundingClientRect().width || 600)
		);
		const height = 520;
		const margin = { top: 10, right: 24, bottom: 92, left: 60 };

		svg.attr("width", containerWidth).attr("height", height);
		const innerW = containerWidth - margin.left - margin.right;
		const innerH = height - margin.top - margin.bottom;

		svg.selectAll("*").remove();
		const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

		const data = computeCountsForYear(year);
		titleEl.text(`Channels by Main Topic — ${year}`);

		if (!data.length) {
			setStatus("error", `No data for ${year}`);
			g.append("text")
				.attr("x", innerW / 2)
				.attr("y", innerH / 2)
				.attr("text-anchor", "middle")
				.attr("class", "text-secondary")
				.text(`No channels found for ${year}. Try another year.`);
			return;
		}

		setStatus("success", `Showing ${year}`);

		// AREA CHART:
		// We plot topics along x (as points) ordered by count (descending).
		// It reads like a "profile" of the top topics for that year.
		const x = d3
			.scalePoint()
			.domain(
				data.map(d => {
					return d.topic;
				})
			)
			.range([0, innerW])
			.padding(0.5);

		const y = d3
			.scaleLinear()
			.domain([0, d3.max(data, d => d.count) || 0])
			.nice()
			.range([innerH, 0]);

		// Axes
		const xAxis = d3.axisBottom(x).tickSizeOuter(0);
		const yAxis = d3.axisLeft(y).ticks(5).tickSizeOuter(0);

		// Gridlines
		g.append("g")
			.attr("class", "mohamed-chart6-grid")
			.call(d3.axisLeft(y).ticks(5).tickSize(-innerW).tickFormat(""))
			.call(g => g.selectAll("line").attr("stroke-opacity", 0.08))
			.call(g => g.select(".domain").remove());

		g.append("g")
			.attr("class", "y-axis")
			.call(yAxis)
			.selectAll("text")
			.style("fill", "#8d1179")
			.style("font-size", "12px");
		//.call(g => g.select(".domain").attr("stroke-opacity", 0.25));

		// Y axis labels
		svg
			.append("text")
			.attr("transform", "rotate(-90)")
			.attr("x", -height / 2 + 40)
			.attr("y", margin.left - 40)
			.style("text-anchor", "middle")
			.style("font-family", "Merriweather")
			.style("fill", "#3b118d")
			.style("font-size", "16px")
			.style("font-weight", 700)
			.text("Number of Channels");
		// X axis label
		svg
			.append("text")
			.attr("x", width / 2)
			.attr("y", height - margin.top)
			.style("text-anchor", "middle")
			.style("font-family", "Merriweather")
			.style("fill", "#3b118d")
			.style("font-size", "16px")
			.style("font-weight", 700)
			.text("Channel");

		const gx = g
			.append("g")
			.attr("class", "x-axis")
			.attr("transform", `translate(0,${innerH})`)
			.call(xAxis);

		// Rotate labels (topics can be long)
		gx.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-0.6em")
			.attr("dy", "0.15em")
			.attr("transform", "rotate(-25)")
			.style("fill", "#8d1179")
			.style("font-size", "12px");

		// Area + line generators
		const area = d3
			.area()
			.x(d => x(d.topic))
			.y0(innerH)
			.y1(d => y(d.count))
			.curve(d3.curveCatmullRom.alpha(0.8));

		const line = d3
			.line()
			.x(d => x(d.topic))
			.y(d => y(d.count))
			.curve(d3.curveCatmullRom.alpha(0.8));

		// Area fill
		g.append("path")
			.datum(data)
			.attr("class", "mohamed-chart6-area")
			.attr("d", area)
			.attr("opacity", 0)
			.transition()
			.duration(650)
			.attr("opacity", 1);

		// Top line
		g.append("path")
			.datum(data)
			.attr("class", "mohamed-chart6-line")
			.attr("d", line)
			.attr("stroke-dasharray", function () {
				const len = this.getTotalLength();
				return `${len} ${len}`;
			})
			.attr("stroke-dashoffset", function () {
				return this.getTotalLength();
			})
			.transition()
			.duration(700)
			.attr("stroke-dashoffset", 0);

		// Points (interactive for tooltip)
		g.selectAll("circle.mohamed-chart6-point")
			.data(data, d => d.topic)
			.enter()
			.append("circle")
			.attr("class", "mohamed-chart6-point")
			.attr("cx", d => x(d.topic))
			.attr("cy", d => y(d.count))
			.attr("r", 4)
			.on("mousemove", function (event, d) {
				const [mx, my] = d3.pointer(event, chartWrap.node());
				tooltip
					.style("left", `${mx + 12}px`)
					.style("top", `${my + 12}px`)
					.style("opacity", 1)
					.html(`<div class="fw-semibold">${d.topic}</div><div>${d.count} channels</div>`);
			})
			.on("mouseleave", () => tooltip.style("opacity", 0));

		// Value labels (small)
		g.selectAll("text.mohamed-chart6-value")
			.data(data, d => d.topic)
			.enter()
			.append("text")
			.attr("class", "mohamed-chart6-value text-secondary")
			.attr("x", d => x(d.topic))
			.attr("y", d => y(d.count) - 10)
			.attr("text-anchor", "middle")
			.style("font-size", "11px")
			.text(d => d.count);

		// Footnote
		// svg
		// 	.append("text")
		// 	.attr("x", margin.left)
		// 	.attr("y", height - 8)
		// 	.attr("class", "text-secondary")
		// 	.style("font-size", "11px")
		// 	.text(`Data: ${DATA_PATH.split("/").slice(-1)[0]} • Filter: year = ${year}`);
	}

	function populateYearControls(years) {
		yearSelect.selectAll("option").remove();
		yearSelect
			.selectAll("option")
			.data(years)
			.enter()
			.append("option")
			.attr("value", d => d)
			.text(d => d);

		const fallback = years[0] ?? DEFAULT_YEAR;
		yearSelect.property("value", years.includes(DEFAULT_YEAR) ? DEFAULT_YEAR : fallback);
		yearInput.property("value", years.includes(DEFAULT_YEAR) ? DEFAULT_YEAR : fallback);
	}

	async function init() {
		try {
			setStatus("pending", "Loading data…");
			const { rows, path } = await loadFirstCsv(DATA_CANDIDATE_PATHS);
			DATA = rows;
			DATA_PATH = path;
			console.log("DATA:", DATA);

			const cols = Object.keys(DATA[0] || {});
			COL_YEAR =
				pickColumn(cols, [
					"Year",
					"year",
					"created_year",
					"createdYear",
					"channelCreatedYear",
					"channel_year",
					"created",
					"started",
				]) || cols.find(c => /year/i.test(c));

			COL_TOPIC =
				pickColumn(cols, [
					"MainTopic",
					"main_topic",
					"mainTopic",
					"Topic",
					"topic",
					"Category",
					"category",
				]) || cols.find(c => /(maintopic|topic|category)/i.test(c));

			COL_CHANNEL =
				pickColumn(cols, [
					"Channel",
					"channel",
					"channel_name",
					"channelTitle",
					"Name",
					"name",
					"Title",
					"title",
				]) || null;

			if (!COL_YEAR || !COL_TOPIC) {
				setStatus("error", "Missing required columns");
				card
					.append("div")
					.attr("class", "alert alert-danger mt-2")
					.text(
						`Chart6 couldn't detect columns. Found columns: ${cols.join(", ")}. ` +
							`Expected a Year column + a MainTopic/Category column.`
					);
				return;
			}

			AVAILABLE_YEARS = Array.from(
				new Set(
					DATA.map(d => toYear(d[COL_YEAR])).filter(y => typeof y === "number" && !Number.isNaN(y))
				)
			).sort((a, b) => a - b);

			populateYearControls(AVAILABLE_YEARS);

			const initialYear = AVAILABLE_YEARS.includes(DEFAULT_YEAR)
				? DEFAULT_YEAR
				: AVAILABLE_YEARS[0] ?? DEFAULT_YEAR;
			render(initialYear);

			// Resize (throttled)
			let t = null;
			window.addEventListener("resize", () => {
				clearTimeout(t);
				t = setTimeout(() => render(getUserYear() || initialYear), 120);
			});

			// Form submit
			form.on("submit", async event => {
				event.preventDefault();
				setStatus("pending", "Updating…");
				/* to check the updating ui */
				await new Promise(res => setTimeout(res, 500));
				const year = getUserYear();
				if (!year || !Number.isFinite(year)) {
					setStatus("error", "Invalid year");
					return;
				}
				render(year);
			});

			// Mobile: auto-update on select change
			yearSelect.on("change", () => {
				const year = getUserYear();
				if (year) render(year);
			});
		} catch (err) {
			console.error("[Chart6] init error:", err);
			setStatus("error", "Failed to load data");
			card
				.append("div")
				.attr("class", "alert alert-danger mt-2")
				.text("Could not load the dataset. Check DATA_CANDIDATE_PATHS.");
		}
	}

	init();
})();
