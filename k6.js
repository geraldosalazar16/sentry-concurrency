import http from 'k6/http';
import { sleep } from 'k6';

export default function () {
    const url = 'http://localhost:3000';
    http.get(url);
}