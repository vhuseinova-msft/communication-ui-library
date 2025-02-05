// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { CommonCallControlOptions, _CommonCallControlOptions } from '../../common/types/CommonCallControlOptions';

/**
 * Customization options for the control bar in calling experience.
 *
 * @public
 */
export type CallControlOptions =
  | CommonCallControlOptions & {
      /**
       * Show, Hide or Disable participants button during a call. This is the option only work for legacyControl bar.
       * @defaultValue true
       */
      participantsButton?: boolean | { disabled: boolean };
      legacyControlBarExperience?: boolean;
    };

/**
 * While the API for the legacyControlBarExperience is in beta. Use this type to access the internal
 * API.
 * @internal
 */
export type _CallControlOptions = _CommonCallControlOptions & {
  legacyControlBarExperience?: boolean;
};
