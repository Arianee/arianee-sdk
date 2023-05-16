/* eslint-disable @typescript-eslint/no-explicit-any */
import { Buffer } from 'buffer';

(window as any).global = window;
global.Buffer = Buffer;
global.process = {
  env: { DEBUG: undefined },
  version: '',
} as any;
