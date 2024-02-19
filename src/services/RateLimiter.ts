import { RateLimiterMemory } from 'rate-limiter-flexible';

const MAX_REQUEST = 5;
const SECONDS = 60 * 60;

export const RateLimiter = new RateLimiterMemory({
    points: MAX_REQUEST,
    duration: SECONDS,
});