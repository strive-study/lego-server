// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportMyLogger from '../../../app/middleware/myLogger';

declare module 'egg' {
  interface IMiddleware {
    myLogger: typeof ExportMyLogger;
  }
}
