// This file is created by egg-ts-helper@1.34.7
// Do not modify this file!!!!!!!!!
/* eslint-disable */

import 'egg';
import ExportTest from '../../../app/controller/test';
import ExportUser from '../../../app/controller/user';

declare module 'egg' {
  interface IController {
    test: ExportTest;
    user: ExportUser;
  }
}
