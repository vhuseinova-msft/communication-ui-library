// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as express from 'express';
import fetch, { Headers } from 'node-fetch';

const router = express.Router();

/**
 * route: /createThread/
 *
 * purpose: Create a new chat thread.
 *
 * @returns The new threadId as string
 *
 */
interface DownloadAMSRequestInfo {
  token: string;
  url: string;
}

router.post('/', async function (req, res, next) {
  const params: DownloadAMSRequestInfo = req.body;
  const response = await fetch(params.url, {
    headers: new Headers({
      Authorization: 'skype_token ' + params.token
    })
  });
  const arrBuffer = await response.arrayBuffer();

  res.type('blob');
  res.setHeader('Content-Length', arrBuffer.byteLength);
  res.write(Buffer.from(new Uint8Array(arrBuffer)), 'binary');
  res.end();
});

export default router;
