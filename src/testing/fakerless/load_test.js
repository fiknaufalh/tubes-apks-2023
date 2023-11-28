import { check } from "k6";
import http from "k6/http";

export const options = {
	insecureSkipTLSVerify: true,
	noConnectionReuse: false,
	stages: [
		{ duration: "1m", target: 400 }, // ramp up to 400 users
		{ duration: "8m", target: 400 }, // stay at 400 ~10 minute
		{ duration: "1m", target: 0 }, // scale down. (optional)
	],
};

// const PORT = process.env.PORT || 5000;
const API_BASE_URL = `http://localhost:5000`;

const names = ["John Doe", "Jane Doe", "Alice", "Bob", "Charlie"];
const usernames = ["john_doe", "jane_doe", "alice", "bob", "charlie"];
const emails = [
	"john@example.com",
	"jane@example.com",
	"alice@example.com",
	"bob@example.com",
	"charlie@example.com",
];
const phoneNumbers = [
	"082793878279",
	"081278728392",
	"087283782822",
	"082435237333",
	"081382947932",
];

export default function () {
	const randomName = names[Math.floor(Math.random() * names.length)];
	const randomUsername =
		usernames[Math.floor(Math.random() * usernames.length)];
	const randomEmail = emails[Math.floor(Math.random() * emails.length)];
	const randomPassword = "ran_word";
	const randomPhone =
		phoneNumbers[Math.floor(Math.random() * phoneNumbers.length)];
	const role = "admin";

	const registerRes = http.post(`${API_BASE_URL}/users`, {
		name: randomName,
		username: randomUsername,
		email: randomEmail,
		password: randomPassword,
		phone: randomPhone,
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
			date: "2023-12-01",
			startAt: "14:00",
			seats: [1, 2, 3],
			ticketPrice: 10,
			total: 30,
			movieId: 1,
			cinemaId: 1,
			username: randomUsername,
			phone: "1234567890",
		}
		// authHeaders
	);

	check(createReservationsRes, {
		"is status 200": (r) => r.status === 200,
	});

	const createInvitationRes = http.post(
		`${API_BASE_URL}/invitations`,
		{
			host: randomName,
			movie: "Sample Movie",
			date: "2023-12-05",
			time: "18:00",
			cinema: "Sample Cinema",
			image: "sample_image_url",
			seats: [4, 5, 6],
		}
		// authHeaders
	);

	check(createInvitationRes, {
		"is status 201": (r) => r.status === 201,
	});
}
