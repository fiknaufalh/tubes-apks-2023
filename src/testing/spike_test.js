import { check, sleep } from "k6";
import http from "k6/http";

export const options = {
	insecureSkipTLSVerify: true,
	noConnectionReuse: false,
	stages: [
		{ duration: "10s", target: 100 }, // below normal load
		{ duration: "30s", target: 100 },
		{ duration: "10s", target: 1400 }, // spike to 1400 users
		{ duration: "1m", target: 1400 }, // stay at 1400 for 3 minutes
		{ duration: "10s", target: 100 }, // scale down. Recovery stage.
		{ duration: "30s", target: 100 },
		{ duration: "10s", target: 0 },
	],
};

// const PORT = process.env.PORT || 5000;
const API_BASE_URL = `http://localhost:5000`;

// let registrationDone = false;
let token; // Declare token at a higher scope

export default function () {
  const currentUnixTime = Math.floor(new Date().getTime() / 1000);
  const randomName = `Test User ${currentUnixTime}`;
  const randomUsername = `testuser${currentUnixTime}`;
  const randomEmail = `${currentUnixTime}@gmail.com`;
  const randomPassword = `testuser${currentUnixTime}`;
  const randomPhone = `${currentUnixTime % 1000000000000}`;
  const role = "admin";

  const registrationPayload = {
    name: randomName,
    username: randomUsername,
    email: randomEmail,
    password: randomPassword,
    role: role,
    phone: randomPhone,
  };

  const registrationHeaders = { "Content-Type": "application/json" };

  const registrationResponse = http.post(
    `${API_BASE_URL}/users`,
    JSON.stringify(registrationPayload),
    {
      headers: registrationHeaders,
    }
  );

  check(registrationResponse, {
    "Registration successful": (resp) => resp.status === 201,
  });

  // Set token to the value obtained from the registration response
  token = registrationResponse.json().token;

  // Set registrationDone to true to indicate that registration has been done
//   registrationDone = true;

  // Sleep for a short duration before making the next request
  sleep(2);

  const loginPayload = {
    username: randomUsername,
    password: randomPassword,
  };

  const loginHeaders = { "Content-Type": "application/json" };

  const loginResponse = http.post(
    `${API_BASE_URL}/users/login`,
    JSON.stringify(loginPayload),
    {
      headers: loginHeaders,
    }
  );

  check(loginResponse, {
    "Login successful": (resp) => resp.status === 200,
  });

  // Sleep for a short duration before making the next request
  sleep(1);

  const reservationPayload = {
    date: "2023/09/24",
    startAt: "bandung",
    seats: ["B"],
    ticketPrice: 50000,
    total: 1,
    movieId: "650d3fa4dd4dc724ef947f6c",
    cinemaId: "650c5c2ee1101d1be65d8a48",
    username: "wisnuas",
    phone: "08123456789",
    checkin: false,
  };
  const reservationHeaders = { "Content-Type": "application/json" };

  const reservationResponse = http.post(
    `${API_BASE_URL}/reservations`,
    JSON.stringify(reservationPayload),
    {
      headers: reservationHeaders,
    }
  );

  check(reservationResponse, {
    "is status 201": (r) => r.status === 201,
  });

  sleep(1);

  const getShowtimes = http.get(`${API_BASE_URL}/showtimes`);

  check(getShowtimes, {
    "is status 200": (r) => r.status === 200,
  });
}
