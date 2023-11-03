require('dotenv').config()
const express = require("express");
const path = require("path");
const connectDB = require("./db/mongoose");

const app = express();

/** Milestone 2 */
// const { Sentry, sentryInit} = require("./utils/sentry");

// sentryInit(app);

const start = async () => {
	try {
		// The request handler must be the first middleware on the app
		// app.use(Sentry.Handlers.requestHandler());
		
		// TracingHandler creates a trace for every incoming request
		// app.use(Sentry.Handlers.tracingHandler());

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

		app.get("/health", (req, res) => {
			res.send({ "API Server": "OK" });
		});

		// app.get("/debug-sentry", function mainHandler(req, res) {
		// 	throw new Error("My first Sentry error!");
		// });
		
		// The "catchall" handler: for any request that doesn't
		// match one above, send back React's index.html file.
		app.get("/*", (req, res) => {
			res.status(404).send({message : "path not found"});
		});

		// // The error handler must be registered before any other error middleware and after all controllers
		// app.use(Sentry.Handlers.errorHandler());
			
		// // Optional fallthrough error handler
		// app.use(function onError(err, req, res, next) {
		//   // The error id is attached to `res.sentry` to be returned
		//   // and optionally displayed to the user for support.
		//   res.statusCode = 500;
		//   res.end(res.sentry + "\n");
		// });

		app.listen(port, () => console.log(`app is running in PORT: ${port}, Metrics are exposed on /metrics endpoint`));
	} catch (err) {
		console.log(err);
		app.get("/health", (req, res) => {
			res.send({ "API Server": "NOT OK" });
		});
	}
};

start();
