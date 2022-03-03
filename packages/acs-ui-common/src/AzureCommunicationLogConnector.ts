// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { ApplicationInsights } from '@microsoft/applicationinsights-web';
// eslint-disable-next-line @typescript-eslint/no-var-requires
import { AzureLogger } from '@azure/logger';

const logWhitelist = [
  'communication-react:callAdapter',
  'communication-react:chatAdapter',
  'communication-react:component'
];

/**
 * @public
 */
export interface AzureCommunicationLogConnector {
  log: (...args) => void;
  filter: (...args) => boolean;
}

/**
 * @public
 */
export const createAppInsightsConnector = (
  connectionString: string,
  filter: (...args) => boolean = azureCommunicationDefaultFilter
): AzureCommunicationLogConnector => {
  // Initialize and start collecting telemetry
  const appInsights = new ApplicationInsights({
    config: {
      disableCookiesUsage: true,
      connectionString,
      enableAutoRouteTracking: true
    }
  });

  appInsights.loadAppInsights();

  const log = (message: string, ...args): void => {
    appInsights.trackTrace({ message }, ...args);
  };

  return {
    log,
    filter
  };
};

/**
 * @public
 */
export const azureCommunicationDefaultFilter = (message: string): boolean => {
  for (const match of logWhitelist) {
    if (message.includes(match)) {
      return true;
    }
  }
  return false;
};

/**
 * @public
 */
export const connectAzureCommunicationLog = (connector: AzureCommunicationLogConnector): void => {
  const target = AzureLogger.log;
  AzureLogger.log = (message: string, ...args) => {
    if (connector.filter(message)) {
      connector.log(message, ...args);
    }
    target(message, ...args);
  };
};
