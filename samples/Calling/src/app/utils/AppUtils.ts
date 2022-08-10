// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import { GroupLocator, TeamsMeetingLinkLocator } from '@azure/communication-calling';
import { CommunicationUserIdentifier } from '@azure/communication-common';
import { v1 as generateGUID } from 'uuid';

/**
 * Get ACS user token from the Contoso server.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type UserAndToken = {
  user: CommunicationUserIdentifier;
  token: string;
};

export const fetchFunctionBaseUrl = async (): Promise<string> => {
  const response = await fetch(`/backend`, { method: 'GET' });
  if (!response.ok) {
    throw new Error(`Error! status: ${response.status}`);
  }
  const output = await response.json();
  return output.backendUrl;
};

export const fetchUserAndToken = async (baseUrl): Promise<UserAndToken> => {
  try {
    const response = await fetch(`${baseUrl}/api/Identity-CreateUserAndToken`, { method: 'POST', mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Error! status: ${response.status}`);
    }
    // if the response is okay then apply the json() function on url response
    const output = await response.json();
    // return the result(response) from the url
    return { token: output.accessToken.token, user: output.user };
  } catch (ex) {
    console.log(ex);
  }

  throw 'unable to retrieve user and token';
};

/**
 * Generate a random user name.
 * @return username in the format user####
 */
export const createRandomDisplayName = (): string => 'user' + Math.ceil(Math.random() * 1000);

/**
 * Get group id from the url's query params.
 */
export const getGroupIdFromUrl = (): GroupLocator | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  const gid = urlParams.get('groupId');
  return gid ? { groupId: gid } : undefined;
};

export const createGroupId = (): GroupLocator => ({ groupId: generateGUID() });

/**
 * Get teams meeting link from the url's query params.
 */
export const getTeamsLinkFromUrl = (): TeamsMeetingLinkLocator | undefined => {
  const urlParams = new URLSearchParams(window.location.search);
  const teamsLink = urlParams.get('teamsLink');
  return teamsLink ? { meetingLink: teamsLink } : undefined;
};

/*
 * TODO:
 *  Remove this method once the SDK improves error handling for unsupported browser.
 */
export const isOnIphoneAndNotSafari = (): boolean => {
  const userAgent = navigator.userAgent;

  // Chrome uses 'CriOS' in user agent string and Firefox uses 'FxiOS' in user agent string.
  return userAgent.includes('iPhone') && (userAgent.includes('FxiOS') || userAgent.includes('CriOS'));
};

export const isLandscape = (): boolean => window.innerWidth < window.innerHeight;

export const navigateToHomePage = (): void => {
  window.location.href = window.location.href.split('?')[0];
};

export const WEB_APP_TITLE = document.title;

declare let __BUILDTIME__: string; // Injected by webpack
export const buildTime = __BUILDTIME__;

declare let __CALLINGVERSION__: string; // Injected by webpack
export const callingSDKVersion = __CALLINGVERSION__;

declare let __COMMUNICATIONREACTVERSION__: string; //Injected by webpack
export const communicationReactSDKVersion = __COMMUNICATIONREACTVERSION__;
