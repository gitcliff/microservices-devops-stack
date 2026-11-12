import { TextEncoder, TextDecoder } from 'node:util';
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom (required by react-router v7)
Object.assign(global, { TextEncoder, TextDecoder });
