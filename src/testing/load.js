import http from 'k6/http';
import { sleep } from 'k6';

export const options = {
  insecureSkipTLSVerify: true,
  noConnectionReuse: true,
  stages: [
    {
        duration: '2m',
        target: 400,
    },
    {
        duration: '2m',
        target: 400,
    },
    {
        duration: '2m',
        target: 0,
    },
  ],
  ext: {
    loadimpact: {
      // Project: Default project
      projectID: 3669379,
      // Test runs with the same name groups test runs together.
      name: 'Test (14/11/2023-20:48:04)'
    }
  }
};

export default function() {
  http.get('http://localhost:5000/movies');
  sleep(1);
}