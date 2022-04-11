// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { Icon, IStyle, mergeStyles, useTheme } from '@fluentui/react';
import React from 'react';
import { sendIconStyle } from './styles/SendBox.styles';

/**
 * @internal
 */
export interface _SendBoxSendButtonProps {
  disabled?: boolean;
  hovered?: boolean;
  styles?: {
    icon?: IStyle;
  };
}

/**
 * @internal
 */
export const _SendBoxSendButton = (props: _SendBoxSendButtonProps): JSX.Element => {
  const { disabled, hovered, styles } = props;
  const theme = useTheme();
  const mergedSendIconStyle = React.useMemo(
    () =>
      mergeStyles(
        sendIconStyle,
        {
          color: disabled ? theme.palette.neutralTertiary : theme.palette.themePrimary
        },
        styles?.icon
      ),
    [disabled, theme, styles]
  );

  return <Icon iconName={hovered ? 'SendBoxSendHovered' : 'SendBoxSend'} className={mergedSendIconStyle} />;
};
