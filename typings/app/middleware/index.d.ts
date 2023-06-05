// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportJwt from '../../../app/middleware/jwt';
import ExportMyLogger from '../../../app/middleware/myLogger';

declare module 'egg' {
  interface IMiddleware {
    jwt: typeof ExportJwt;
    myLogger: typeof ExportMyLogger;
  }
}
