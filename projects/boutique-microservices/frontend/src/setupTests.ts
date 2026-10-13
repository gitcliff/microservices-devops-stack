import { TextEncoder, TextDecoder } from 'util';
import '@testing-library/jest-dom';

// Polyfill TextEncoder/TextDecoder for jsdom (required by react-router v7)
Object.assign(global, { TextEncoder, TextDecoder });
