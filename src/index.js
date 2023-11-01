require('dotenv').config()
const express = require("express");
const path = require("path");
const connectDB = require("./db/mongoose");

const app = express();

/* Milestone 2: Setting Up Promtheus and Grafana */
const client = require('prom-client')
// Create a Registry which registers the metrics
const register = new client.Registry()
// Add a default label which is added to all metrics
register.setDefaultLabels({
  app: 'tubes-apks-2023'
})
// Enable the collection of default metrics
client.collectDefaultMetrics({ register })

const start = async () => {
	try {
		await connectDB();

		if (process.env.NODE_ENV !== "production") {
			require("dotenv").config({ path: path.join(__dirname, "../.env") });
		}

		// Routes
		const userRouter = require("./routes/users");
		const movieRouter = require("./routes/movies");
		const cinemaRouter = require("./routes/cinema");
		const showtimeRouter = require("./routes/showtime");
		const reservationRouter = require("./routes/reservation");
		const invitationsRouter = require("./routes/invitations");

		app.disable("x-powered-by");
		const port = process.env.PORT || 8080;

		// Serve static files from the React app
		app.use(express.static(path.join(__dirname, "../../client/build")));
		app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

		app.use(function (req, res, next) {
			// Website you wish to allow to connect
			res.setHeader("Access-Control-Allow-Origin", "*");

			// Request methods you wish to allow
			res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS, PUT, PATCH, DELETE");

			// Request headers you wish to allow
			res.setHeader(
				"Access-Control-Allow-Headers",
				"Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers,X-Access-Token,XKey,Authorization"
			);

			//  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");

			// Pass to next layer of middleware
			next();
		});
		app.use(express.json());
		app.use(userRouter);
		app.use(movieRouter);
		app.use(cinemaRouter);
		app.use(showtimeRouter);
		app.use(reservationRouter);
		app.use(invitationsRouter);

		// Return all metrics the Prometheus exposition format
		app.get('/metrics', async (req, res) => {
			res.set('Content-Type', register.contentType)
			res.end(await register.metrics())
		})

		app.get("/health", (req, res) => {
			res.send({ "API Server": "OK" });
		});

		// The "catchall" handler: for any request that doesn't
		// match one above, send back React's index.html file.
		app.get("/*", (req, res) => {
			res.status(404).send({message : "path not found"});
		});
		app.listen(port, () => console.log(`app is running in PORT: ${port}, Metrics are exposed on /metrics endpoint`));
	} catch (err) {
		console.log(err);
		app.get("/health", (req, res) => {
			res.send({ "API Server": "NOT OK" });
		});
	}
};

start();
