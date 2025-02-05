// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IStackStyles, mergeStyles } from '@fluentui/react';
import { SMALL_FLOATING_MODAL_SIZE_REM } from './FloatingLocalVideo.styles';
import {
  SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM,
  SMALL_HORIZONTAL_GALLERY_TILE_STYLE
} from './VideoGalleryResponsiveHorizontalGallery.styles';

/**
 * @private
 */
export const scrollableHorizontalGalleryStyles: IStackStyles = {
  root: {
    width: '100%',
    minHeight: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
    paddingRight: '0.5rem',
    '> *': SMALL_HORIZONTAL_GALLERY_TILE_STYLE
  }
};

/**
 * @private
 */
export const scrollableHorizontalGalleryContainerStyles = (fullWidth: boolean): string => {
  return mergeStyles({
    display: 'flex',
    width: fullWidth ? '100%' : `calc(100% - ${SMALL_FLOATING_MODAL_SIZE_REM.width}rem)`,
    minHeight: `${SMALL_HORIZONTAL_GALLERY_TILE_SIZE_REM.height}rem`,
    overflow: 'scroll',
    '-ms-overflow-style': 'none',
    'scrollbar-width': 'none',
    '::-webkit-scrollbar': { display: 'none' }
  });
};
