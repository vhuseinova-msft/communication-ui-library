// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { IButtonStyles, mergeStyles } from '@fluentui/react';

export const mobilePaneStyle = mergeStyles({ width: '100%', height: '100%' });

export const mobilePaneHiddenStyle = mergeStyles(mobilePaneStyle, { display: 'none' });

export const mobilePaneControlBarStyle = mergeStyles({ height: '3rem' });

export const mobilePaneCloseButtonStyles: IButtonStyles = {
  root: { border: 'none', minWidth: '1rem', height: '100%', background: 'none' }
};

export const mobilePaneButtonStyles: IButtonStyles = {
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

export const mobilePaneContentStyle = mergeStyles({ height: 'calc(100% - 3rem)' });

export const mobilePaneHiddenContentStyle = mergeStyles(mobilePaneContentStyle, { display: 'none' });
