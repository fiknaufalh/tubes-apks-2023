import { check } from "k6";
import http from "k6/http";
import faker from "faker";
require("dotenv").config();

export const options = {
	insecureSkipTLSVerify: true,
	noConnectionReuse: false,
	stages: [
		{ duration: "1m", target: 100 }, // below normal load
		{ duration: "3m", target: 100 },
		{ duration: "1m", target: 200 }, // normal load
		{ duration: "3m", target: 200 },
		{ duration: "1m", target: 300 }, // arround the breaking point
		{ duration: "3m", target: 300 },
		{ duration: "1m", target: 400 }, // beyond the breaking point
		{ duration: "3m", target: 400 },
		{ duration: "5m", target: 0 }, // scale down. Recovery state.
	],
};

const PORT = process.env.PORT || 5000;
const API_BASE_URL = `https://localhost:${PORT}`;

export default function () {
	unixTimeStamp = Math.floor(date.getTime() / 1000);

	const randomName = faker.name.findName();
	const randomUsername = `${unixTimeStamp} ${faker.internet.userName()}`;
	const randomEmail = faker.internet.email();
	const randomPassword = faker.internet.password();
	const role = "admin";

	const registerRes = http.post(`${API_BASE_URL}/register`, {
		name: randomName,
		username: randomUsername,
		email: randomEmail,
		password: randomPassword,
		role: "admin",
	});

	check(registerRes, {
		"is status 201": (r) => r.status === 201,
	});

	const loginRes = http.post(`${API_BASE_URL}/login`, {
		username: randomUsername,
		password: randomPassword,
	});

	check(loginRes, {
		"is status 200": (r) => r.status === 200,
	});

	const authHeaders = {
		headers: {
			Authorization: `Bearer ${loginRes.json("token")}`,
		},
	};

	const createReservationsRes = http.post(
		`${API_BASE_URL}/reservations`,
		{
			date: faker.date.future(),
			startAt: faker.date.future().toString(),
			seats: [faker.random.number()],
			ticketPrice: faker.random.number(),
			total: faker.random.number(),
			movieId: faker.random.number(),
			cinemaId: faker.random.number(),
			username: `${unixTimeStamp} ${faker.internet.userName()}`,
			phone: faker.internet.phoneNumber(),
		},
		authHeaders
	);

	check(createReservationsRes, {
		"is status 200": (r) => r.status === 200,
	});

	const createInvitationRes = http.post(
		`${API_BASE_URL}/invitations`,
		{
			host: faker.name.findName(),
			movie: faker.random.string(),
			date: faker.date.future().toString(),
			time: faker.date.future().toString(),
			cinema: faker.random.string(),
			image: faker.random.string(),
			seats: [faker.random.number()],
		},
		authHeaders
	);

	check(createInvitationRes, {
		"is status 201": (r) => r.status === 201,
	});
}
