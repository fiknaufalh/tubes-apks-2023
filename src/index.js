require('dotenv').config()
const express = require("express");
const path = require("path");
const connectDB = require("./db/mongoose");
const app = express();

const prometheus = require("prom-client");

// Create a Registry to register the metrics
const register = new prometheus.Registry();
prometheus.collectDefaultMetrics({register});

// Create a custom histogram metric
const httpRequestTimer = new prometheus.Histogram({
	name: 'http_request_duration_seconds',
	help: 'Duration of HTTP requests in seconds',
	labelNames: ['method', 'route', 'code'],
	buckets: [0.1, 0.3, 0.5, 0.7, 1, 3, 5, 7, 10] // 0.1 to 10 seconds
  });
  
// Register the histogram
register.registerMetric(httpRequestTimer);

/** Debugging */
// Mock slow endpoint, waiting between 3 and 6 seconds to return a response
const createDelayHandler = async (req, res) => {
	if ((Math.floor(Math.random() * 100)) === 0) {
	  throw new Error('Internal Error')
	}
	// Generate number between 3-6, then delay by a factor of 1000 (miliseconds)
	const delaySeconds = Math.floor(Math.random() * (6 - 3)) + 3
	await new Promise(res => setTimeout(res, delaySeconds * 1000))
	res.end('Slow url accessed!');
  };

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
		app.use((req, res, next) => {
			// Histogram
			httpRequestTimer.observe()

			// Counter
			
			next()
		})

		app.get("/health", (req, res) => {
			res.send({ "API Server": "OK" });
		});

		/* Prometheus Metrics Endpoint */
		app.get('/metrics', async (req, res) => {
			res.setHeader('Content-Type', register.contentType);
			res.send(await register.metrics());
		});

		/* Debugging for slow request*/
		app.get('/slow', async (req, res) => {
			const end = httpRequestTimer.startTimer();
			const route = req.route.path;
			await createDelayHandler(req, res);
			end({ route, code: res.statusCode, method: req.method });
		  });

		// The "catchall" handler: for any request that doesn't
		// match one above, send back React's index.html file.
		app.get("/*", (req, res) => {
			res.status(404).send({message : "path not found"});
		});

		app.listen(port, () => console.log(`app is running in PORT: ${port}, metrics can be accessed using '/metrics' endpoint`));
	} catch (err) {
		console.log(err);
		app.get("/health", (req, res) => {
			res.send({ "API Server": "NOT OK" });
		});
	}
};

start();
