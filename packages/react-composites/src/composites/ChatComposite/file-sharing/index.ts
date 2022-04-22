// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { _FILE_SHARING_METADATA_KEY } from '@internal/acs-ui-common';

// Licensed under the MIT license.
export * from './FileUpload';
export * from './FileUploadButton';
export * from './FileUploadHandler';

/**
 * Metadata used for setting uploaded files by a user using chat composite in a group call.
 * @internal
 */
export type FileSharingMetadata = {
  [_FILE_SHARING_METADATA_KEY]: string;
};
