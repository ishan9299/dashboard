import { PrismaClient } from "@prisma/client"
import express, {Router} from "express"

const router = Router();
const prisma = new PrismaClient();
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static("public"));

const getUniqueValForFilters = (data) => {
	const topics = data.map(item => item.topic);
	const unique_topics = topics.filter((topic, index) => (topics.indexOf(topic) === index && topic !== '')); 

	const endYears = data.map(item => item.end_year);
	const unique_endyears = endYears.filter((endYear, index) => (endYears.indexOf(endYear) === index && endYear !== null));

	const sectors = data.map(item => item.sector);
	const unique_sectors = sectors.filter((sector, index) => (sectors.indexOf(sector) === index && sector !== ''));

	const pestles = data.map(item => item.pestle)
	const unique_pestles = pestles.filter((pestle, index) => (pestles.indexOf(pestle) === index && pestle !== ''));

	const sources = data.map(item => item.source);
	const unique_sources = sources.filter((source, index) => (sources.indexOf(source) === index && source !== ''))

	const countries = data.map(item => item.country);
	const unique_countries = countries.filter((country, index) => (countries.indexOf(country) === index && country !== ''))

	const regions = data.map(item => item.region);
	const unique_regions = regions.filter((region, index) => (regions.indexOf(region) === index && region !== ''));

	const unique_filters = {
		topic: unique_topics,
		end_year: unique_endyears,
		sector: unique_sectors,
		pestle: unique_pestles,
		source: unique_sources,
		country: unique_countries,
		region: unique_regions,
	}

	return unique_filters;
} 


app.get("/api/data", async (req, res) => {
	try {

		const distinctFields = await prisma.companies.findMany({
			distinct: ['topic', 'end_year', 'sector', 'pestle', 'source', 'country', 'region'],
			select: {
				topic: true,
				end_year: true,
				sector: true,
				pestle: true,
				source: true,
				country: true,
				region: true,
			},
		});

		// Extract the distinct values from the results
		const uniques = getUniqueValForFilters(distinctFields);

		res.json(uniques);
	} catch(e) {
		console.log(e);
		res.status(404);
		res.send("Not found");
	}
})

app.get("/api/filter", async (req, res) => {
	try {
		const query = req.query;

		console.log(`query after reduction: ${Object.keys(query)}`);
		const data = await prisma.companies.findMany({
			where: query
		});

		const unique_filters = getUniqueValForFilters(data);
		//console.log(unique_filters);

		const final_data = {
			db: data,
			filters: unique_filters,
			query: Object.keys(query),
		}

		res.json(final_data);
	} catch(e) {
		console.log(e);
		res.status(404);
		res.send("Not found");
	}
})

app.listen(port, () => {
	console.log(`Server is running at http://localhost:${port}`)
});
