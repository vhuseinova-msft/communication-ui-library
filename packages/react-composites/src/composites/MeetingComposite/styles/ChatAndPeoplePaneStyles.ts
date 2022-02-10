// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IButtonStyles, mergeStyles } from '@fluentui/react';

export const chatAndPeoplePaneStyle = mergeStyles({ width: '100%', height: '100%' });

export const chatAndPeoplePaneHiddenStyle = mergeStyles(chatAndPeoplePaneStyle, { display: 'none' });

export const chatAndPeoplePaneControlBarStyle = mergeStyles({ height: '3rem' });

export const chatAndPeoplePaneCloseButtonStyles: IButtonStyles = {
  root: { border: 'none', minWidth: '1rem', height: '100%', background: 'none' }
};

export const chatAndPeoplePaneButtonStyles: IButtonStyles = {
  root: {
    border: 'none',
    borderBottom: '0.125rem solid transparent',
    width: '6.75rem',
    borderRadius: 'none',
    height: '100%',
    background: 'none'
  },
  rootChecked: { background: 'none' },
  rootCheckedHovered: { background: 'none' }
};

export const chatAndPeoplePaneContentStyle = mergeStyles({ height: 'calc(100% - 3rem)' });

export const chatAndPeoplePaneContentHiddenStyle = mergeStyles(chatAndPeoplePaneContentStyle, { display: 'none' });
