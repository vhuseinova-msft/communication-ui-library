// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import * as express from 'express';
import { getBackendUrl } from '../lib/envHelper';

const router = express.Router();

/**
 * handleUserTokenRequest will return a default scoped token if no scopes are provided.
 * @param requestedScope [optional] string from the request, this should be a comma seperated list of scopes.
 */
const handleBackendUrlRequest = async (requestedScope?: string): Promise<{ backendUrl: string }> => {
  return { backendUrl: getBackendUrl() };
};

/**
 * route: /token/
 *
 * purpose: To get Azure Communication Services token with the given scope.
 *
 * @param scope: scope for the token as string
 *
 * @returns The token as string
 *
 * @remarks
 * By default the get and post routes will return a token with scopes ['chat', 'voip'].
 * Optionally ?scope can be passed in containing scopes seperated by comma
 * e.g. ?scope=chat,voip
 *
 */
router.get('/', async (req, res, next) => res.send(await handleBackendUrlRequest()));

export default router;
