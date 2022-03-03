// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.
import React, { ErrorInfo } from 'react';
import { AzureLogger, createClientLogger, setLogLevel } from '@azure/logger';

setLogLevel('error');

type AzureCommunicationErrorBoundaryProps = {
  fallbackElement: React.ReactNode;
};

type AzureCommunicationErrorBoundaryState = {
  hasError: boolean;
};

/**
 * @private
 */
export class AzureCommunicationErrorBoundary extends React.Component<
  AzureCommunicationErrorBoundaryProps,
  AzureCommunicationErrorBoundaryState
> {
  _logger: AzureLogger;

  constructor(props: AzureCommunicationErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
    this._logger = createClientLogger('communication-react:component');
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    // You can also log the error to an error reporting service
    this._logger.error(`Uncaught error for component! \n Error: ${error} \n Error info: ${info.componentStack}`);
    this.setState({ hasError: true });
  }

  render(): React.ReactNode {
    if (this.state.hasError && this.props.fallbackElement) {
      // You can render any custom fallback UI
      return this.props.fallbackElement;
    }

    return this.props.children;
  }
}
