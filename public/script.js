const filter_container = document.querySelector(".filter");

const filters = [
	"topic",
	"end_year",
	"sector",
	"pestle",
	"source",
	"country",
	"region",
];

function reset() {
	d3.select("#chart").selectAll("*").remove();
	fetch('/api/data')
		.then(response => response.json())
		.then(data => fillDropDown(data, []))
		.then(() => getFilters());
}

const button = document.querySelector("#reset-button");
button.addEventListener("click", reset);

filters.forEach((filter) => {
	const newLabel = document.createElement("label");
	newLabel.setAttribute("for", `${filter}`);
	newLabel.textContent = `${filter}:`

	const newSelect = document.createElement("select");
	newSelect.className = "dropdown";
	newSelect.id = `${filter}`;
	newSelect.name = `${filter}`

	const defaultOption = document.createElement("option");
	defaultOption.value = "";
	defaultOption.textContent = "Select an option";
	newSelect.appendChild(defaultOption);

	filter_container.appendChild(newLabel);
	filter_container.appendChild(newSelect);
})

function clearDropDown(query) {
	filters.forEach((filter) => {
		if (query.includes(filter) == false) {
			const dropDown = document.querySelector(`#${filter}`);
			dropDown.innerHTML = null;

			const defaultOption = document.createElement("option");
			defaultOption.value = "";
			defaultOption.textContent = "Select an option";
			dropDown.appendChild(defaultOption);
		}
	})
}

function fillDropDown(data, query) {
	filters.forEach((filter) => {
		if (query.includes(filter) == false) {
			const list = document.querySelector(`#${filter}`);
			for (const val of data[filter]) {
				const newOption = document.createElement("option");
				newOption.text = `${val}`;
				newOption.value = `${val}`;
				list.appendChild(newOption);
			}
		}
	})
}

function getFilters() {
	let str = "";
	filters.forEach((filter) => {
		const list = document.querySelector(`#${filter}`);
		if (list.value !== "") {
			str = str + `${filter}=${list.value}&`
		}
	})
	str = str.slice(0, -1);
	return str;
}

const dropdowns = document.querySelectorAll(`.dropdown`);
dropdowns.forEach((dropdown) => {
	dropdown.addEventListener("change", async (e) => {
		console.log("change triggered");
		query = getFilters();
		const url = "/api/filter?" + query;
		console.log(url);
		try {
			const response = await fetch(url);
			const data = await response.json();

			console.log(data.filters);

			// const filter_data_len = Object.enteries(obj).length;

			clearDropDown(data.query, data.query);
			fillDropDown(data.filters, data.query);
			drawGraphs(data.db);
		} catch (e) {
			console.log(e);
		}
	});
})

const drawGraphs = (data) => {
	// Set dimensions and margins
	d3.select("#chart").selectAll("*").remove();

	const margin = { top: 40, right: 30, bottom: 70, left: 60 },
		width = 450 - margin.left - margin.right,
		height = 400 - margin.top - margin.bottom;

	// Create SVG container
	const svg = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// X axis
	const x = d3.scaleBand()
		.range([0, width])
		.domain(data.map(d => d.sector))
		.padding(0.2);

	svg.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Y axis
	const y = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.intensity)])
		.range([height, 0]);

	svg.append("g")
		.call(d3.axisLeft(y));

	// Bars
	svg.selectAll("bars")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", d => x(d.sector))
		.attr("y", d => y(d.intensity))
		.attr("width", x.bandwidth())
		.attr("height", d => height - y(d.intensity))
		.attr("fill", "#69b3a2");

	// Add title
	svg.append("text")
		.attr("x", width / 2)
		.attr("y", -10)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text("Intensity vs. Sector");


	// Create SVG container for Likelihood vs Topics
	const svg2 = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// X axis
	const x2 = d3.scaleBand()
		.range([0, width])
		.domain(data.map(d => d.topic))
		.padding(0.2);

	svg2.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x2))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Y axis
	const y2 = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.likelihood)])
		.range([height, 0]);

	svg2.append("g")
		.call(d3.axisLeft(y2));

	// Bars
	svg2.selectAll("bars")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", d => x2(d.topic))
		.attr("y", d => y2(d.likelihood))
		.attr("width", x2.bandwidth())
		.attr("height", d => height - y2(d.likelihood))
		.attr("fill", "#69b3a2");

	// Add title
	svg2.append("text")
		.attr("x", width / 2)
		.attr("y", -10)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text("Likelihood vs. Topics");


	// Create SVG container for Relevance vs Regions
	const svg3 = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// X axis
	const x3 = d3.scaleBand()
		.range([0, width])
		.domain(data.map(d => d.region))
		.padding(0.2);

	svg3.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x3))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Y axis
	const y3 = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.relevance)])
		.range([height, 0]);

	svg3.append("g")
		.call(d3.axisLeft(y3));

	//	// Bars
	svg3.selectAll("bars")
		.data(data)
		.enter()
		.append("rect")
		.attr("x", d => x3(d.region))
		.attr("y", d => y3(d.relevance))
		.attr("width", x3.bandwidth())
		.attr("height", d => height - y3(d.relevance))
		.attr("fill", "#69b3a2");

	// Add title
	svg3.append("text")
		.attr("x", width / 2)
		.attr("y", -10)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text("Relevance vs. Regions");


	const keys = ["intensity", "likelihood", "relevance"];
	const svg4 = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${margin.left},${margin.top})`);

	// X axis
	const x4 = d3.scaleBand()
		.domain(data.map(d => d.region))
		.range([0, width])
		.padding(0.1);

	svg4.append("g")
		.attr("transform", `translate(0,${height})`)
		.call(d3.axisBottom(x4))
		.selectAll("text")
		.attr("transform", "translate(-10,0)rotate(-45)")
		.style("text-anchor", "end");

	// Y axis
	const y4 = d3.scaleLinear()
		.domain([0, d3.max(data, d => d.intensity + d.likelihood + d.relevance)])
		.nice()
		.range([height, 0]);

	svg4.append("g")
		.call(d3.axisLeft(y4));

	// Color scale
	const color = d3.scaleOrdinal()
		.domain(keys)
		.range(d3.schemeCategory10);

	// Stack data
	const stackedData = d3.stack()
		.keys(keys)(data);

	// Bars
	svg4.append("g")
		.selectAll("g")
		.data(stackedData)
		.join("g")
		.attr("fill", d => color(d.key))
		.selectAll("rect")
		.data(d => d)
		.join("rect")
		.attr("x", d => x4(d.data.region))
		.attr("y", d => y4(d[1]))
		.attr("height", d => y4(d[0]) - y4(d[1]))
		.attr("width", x4.bandwidth())
		.attr("class", "bar");

	// X axis label
	svg4.append("text")
		.attr("text-anchor", "middle")
		.attr("x", width / 2)
		.attr("y", height + margin.bottom - 10)
		.attr("class", "axis-label")
		.text("Region");

	// Y axis label
	svg4.append("text")
		.attr("text-anchor", "middle")
		.attr("transform", "rotate(-90)")
		.attr("x", -height / 2)
		.attr("y", -margin.left + 15)
		.attr("class", "axis-label")
		.text("Values");

	// Legend
	const legend = svg4.selectAll(".legend")
		.data(keys)
		.enter().append("g")
		.attr("class", "legend")
		.attr("transform", (d, i) => `translate(0,${i * 20})`);

	legend.append("rect")
		.attr("x", width - 18)
		.attr("width", 18)
		.attr("height", 18)
		.style("fill", color);

	legend.append("text")
		.attr("x", width - 24)
		.attr("y", 9)
		.attr("dy", ".35em")
		.style("text-anchor", "end")
		.text(d => d);

	const svg5 = d3.select("#chart")
		.append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", `translate(${(width + margin.left + margin.right) / 2},${(height + margin.top + margin.bottom) / 2})`);

	// Prepare data for the pie chart (example: count occurrences of each topic)
	const topicData = d3.rollup(
		data,
		v => v.length, // Count the number of occurrences of each topic
		d => d.topic
	);

	// Convert the topicData into a format suitable for D3's pie layout
	const pie = d3.pie()
		.value(d => d[1]); // Use the count as the value

	const arc = d3.arc()
		.innerRadius(0)
		.outerRadius(Math.min(width, height) / 2 - 1);

	// Create the pie slices
	const arcs = svg5.selectAll("arc")
		.data(pie(Array.from(topicData)))
		.enter()
		.append("g")
		.attr("class", "arc");

	arcs.append("path")
		.attr("d", arc)
		.attr("fill", (d, i) => d3.schemeCategory10[i % 10]);

	// Add labels to the pie slices
	arcs.append("text")
		.attr("transform", d => `translate(${arc.centroid(d)})`)
		.attr("dy", "0.35em")
		.style("text-anchor", "middle")
		.text(d => d.data[0]); // Display the topic name

	// Add title
	svg5.append("text")
		.attr("x", 0)
		.attr("y", -(height + margin.top + margin.bottom) / 2 + 20)
		.attr("text-anchor", "middle")
		.style("font-size", "16px")
		.text("Topics Distribution");
}

// Initial load
fetch('/api/data')
	.then(response => response.json())
	.then(data => fillDropDown(data, []))
	.then(() => getFilters());

