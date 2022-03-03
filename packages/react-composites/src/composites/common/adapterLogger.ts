// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import { createClientLogger } from '@azure/logger';

/**
 * @private
 */
export const callAdapterLogger = createClientLogger('communication-react:callAdapter');

/**
 * @private
 */
export const chatAdapterLogger = createClientLogger('communication-react:chatAdapter');
