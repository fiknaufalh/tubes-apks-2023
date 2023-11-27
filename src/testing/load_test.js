import { check } from "k6";
import http from "k6/http";
import * as faker from 'faker/locale/en_US'; 

export const options = {
	insecureSkipTLSVerify: true,
	noConnectionReuse: false,
	stages: [
		{ duration: "1m", target: 400 }, // ramp up to 400 users
		{ duration: "8m", target: 400 }, // stay at 400 ~10 minute
		{ duration: "1m", target: 0 }, // scale down. (optional)
	],
};

const API_BASE_URL = `http://localhost:5000`;

export default function () {
	unixTimeStamp = Math.floor(date.getTime() / 1000);

	const randomName = faker.name.firstName();
	const randomUsername = `${unixTimeStamp} ${faker.internet.userName()}`;
	const randomEmail = faker.internet.email();
	const randomPassword = faker.internet.password();
	const role = "admin";

	const registerRes = http.post(`${API_BASE_URL}/users`, {
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
