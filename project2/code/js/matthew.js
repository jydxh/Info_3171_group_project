/* 
Matthew to do:

- Chart8: The country that has the most youtubers in the top 100 list.
- Chart9: The name of the channel with the most likes. 

please add a svg icon behind of the data,  
for country icon reference: https://www.svgrepo.com/svg/390678/country-flag-flag02

for name of channel icon: https://www.svgrepo.com/svg/354854/channel

use the d3.select("#Matthew_chart_8"), d3.select("#Matthew_chart_9") to select the dom placeholder 

please refer to the ./assets/dashboard/3_countryWithMostYoutubers.jpg and 4_mostLikedChannel.jpg for styling reference

*/

d3.csv("./data/top_100_youtubers.csv").then(function (data) {
	// group by country and count youtubers for each country
	const countryData = d3.rollup(
		data,
		v => v.length,
		d => d.Country
	);
	const countryArray = Array.from(countryData, ([country, count]) => ({ country, count }));

	// country with most youtubers (for infoBox)
	const topCountry = countryArray[1].country;

	d3.select("#Matthew_label_8").html(
		`Country with the Highest Number YouTubers:<br><span style="color: #8D1179;">${topCountry}`
	);

	// sort by most to least
	countryArray.sort((a, b) => b.count - a.count);

	// dimensions
	const margin = { top: 60, right: 30, bottom: 90, left: 80 };
	const width = 600 - margin.left - margin.right;
	const height = 500 - margin.top - margin.bottom;

	const svg = d3
		.select("#Matthew_chart_8")
		.append("svg")
		.attr("class", "matthewSvgContainer card shadow rounded")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top + 20})`);

	// scales
	const x = d3
		.scaleBand()
		.domain(countryArray.map(d => d.country))
		.range([0, width])
		.padding(0.1);

	const y = d3
		.scaleLinear()
		.domain([0, d3.max(countryArray, d => d.count)])
		.range([height, 0]);

	// bars
	svg
		.selectAll(".bar")
		.data(countryArray)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", d => x(d.country))
		.attr("y", height)
		.attr("width", x.bandwidth())
		.attr("height", 0)
		.attr("fill", "#3B118D")
		.transition()
		.duration(1000)
		.attr("y", d => y(d.count))
		.attr("height", d => height - y(d.count));

	// labels
	svg
		.selectAll(".label")
		.data(countryArray)
		.enter()
		.append("text")
		.attr("class", "label")
		.attr("x", d => x(d.country) + x.bandwidth() / 2)
		.attr("y", d => y(d.count) - 5)
		.attr("text-anchor", "middle")
		.style("fill", "#8D1179")
		.style("font-size", "12px")
		.style("opacity", 0)
		.text(d => d.count)
		.transition()
		.duration(500)
		.delay(1000)
		.style("opacity", 1);

	// x axis
	svg
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x))
		.selectAll("text")
		.style("text-anchor", "middle")
		.style("fill", "#8D1179")
		.style("font-size", "12px");

	svg
		.append("text")
		.attr("x", width / 2)
		.attr("y", height + margin.bottom - 40)
		.style("text-anchor", "middle")
		.style("font-family", "Merriweather")
		.style("fill", "#3b118d")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.text("Country");

	// y axis
	svg
		.append("g")
		.attr("class", "y-axis")
		.call(d3.axisLeft(y))
		.selectAll("text")
		.style("fill", "#8D1179")
		.style("font-size", "12px");

	svg
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -margin.left + 40)
		.style("text-anchor", "middle")
		.style("font-family", "Merriweather")
		.style("fill", "#3b118d")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.text("Number of YouTubers");

	// title
	svg
		.append("text")
		.attr("x", width / 2 - 25)
		.attr("y", -30)
		.attr("text-anchor", "middle")
		.style("font-family", "Montserrat")
		.style("fill", "#3B118D")
		.style("font-size", "24px")
		.style("font-weight", 700)
		.text("Chart8: Countries with the Most YouTubers");

	// Most Liked YouTube Channels
	const channelData = data
		.map(d => ({ channelName: d.ChannelName, likes: +d.Likes }))
		.sort((a, b) => b.likes - a.likes);

	// top 20
	const topChannels = channelData.slice(0, 20);

	// most liked channel (for label)
	const mostLikedChannel = topChannels[0].channelName;

	d3.select("#Matthew_label_9").html(
		`Most Liked YouTube Channel:<br><span style="color: #8D1179;">${mostLikedChannel}`
	);

	// bn
	function formatBillion(val) {
		return (val / 1e9).toFixed(1) + " bn";
	}

	// dimemsions
	const margin2 = { top: 60, right: 60, bottom: 90, left: 160 };
	const width2 = 600 - margin2.left - margin2.right;
	const height2 = 500 - margin2.top - margin2.bottom;

	const svg2 = d3
		.select("#Matthew_chart_9")
		.append("svg")
		.attr("class", "matthewSvgContainer card shadow rounded")
		.attr("width", width2 + margin2.left + margin2.right)
		.attr("height", height2 + margin2.top + margin2.bottom)
		.append("g")
		.attr("transform", `translate(${margin2.left},${margin2.top + 20})`);

	// scales
	const x2 = d3
		.scaleLinear()
		.domain([0, d3.max(topChannels, d => d.likes)])
		.range([0, width2]);

	const y2 = d3
		.scaleBand()
		.domain(topChannels.map(d => d.channelName))
		.range([0, height2])
		.padding(0.1);

	// bars
	svg2
		.selectAll(".bar")
		.data(topChannels)
		.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", 0)
		.attr("y", d => y2(d.channelName))
		.attr("width", 0)
		.attr("height", y2.bandwidth())
		.attr("fill", "#3B118D")
		.transition()
		.duration(1000)
		.attr("width", d => x2(d.likes));

	// labels
	svg2
		.selectAll(".label")
		.data(topChannels)
		.enter()
		.append("text")
		.attr("class", "label")
		.attr("x", d => x2(d.likes) + 5)
		.attr("y", d => y2(d.channelName) + y2.bandwidth() / 2 + 5)
		.style("fill", "#8D1179")
		.style("font-size", "12px")
		.style("text-anchor", "start")
		.style("opacity", 0)
		.transition()
		.delay(1000)
		.duration(500)
		.style("opacity", 1)
		.text(d => formatBillion(d.likes));

	// x axis
	svg2
		.append("g")
		.attr("class", "x-axis")
		.attr("transform", `translate(0,${height2})`)
		.call(
			d3
				.axisBottom(x2)
				.ticks(Math.ceil(d3.max(topChannels, d => d.likes) / 5e8))
				.tickFormat(d => formatBillion(d))
		)
		.selectAll("text")
		.style("text-anchor", "middle")
		.style("fill", "#8D1179")
		.style("font-size", "12px");

	svg2
		.append("text")
		.attr("x", width2 / 2)
		.attr("y", height2 + margin2.bottom - 40)
		.style("text-anchor", "middle")
		.style("font-family", "Merriweather")
		.style("fill", "#3b118d")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.text("Likes");

	// y axis
	svg2
		.append("g")
		.attr("class", "y-axis")
		.call(d3.axisLeft(y2))
		.selectAll("text")
		.style("fill", "#8D1179")
		.style("font-size", "12px");

	svg2
		.append("text")
		.attr("transform", "rotate(-90)")
		.attr("x", -height2 / 2)
		.attr("y", -margin2.left + 40)
		.style("text-anchor", "middle")
		.style("font-family", "Merriweather")
		.style("fill", "#3b118d")
		.style("font-size", "16px")
		.style("font-weight", 700)
		.text("Channel Name");

	// title
	svg2
		.append("text")
		.attr("x", width2 / 2 - 50)
		.attr("y", -30)
		.attr("text-anchor", "middle")
		.style("font-family", "Montserrat")
		.style("fill", "#3B118D")
		.style("font-size", "24px")
		.style("font-weight", 700)
		.text("Chart9: Most Liked YouTube Channels");
});
