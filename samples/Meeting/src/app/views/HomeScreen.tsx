// Copyright (c) Microsoft Corporation.
// Licensed under the MIT license.

import React, { useState } from 'react';
import { Stack, PrimaryButton, Image, ChoiceGroup, IChoiceGroupOption, Text, TextField, Link } from '@fluentui/react';
import heroSVG from '../../assets/hero.svg';
import {
  imgStyle,
  infoContainerStyle,
  callContainerStackTokens,
  callOptionsGroupStyles,
  configContainerStyle,
  configContainerStackTokens,
  containerStyle,
  containerTokens,
  headerStyle,
  teamsItemStyle,
  buttonStyle
} from '../styles/HomeScreen.styles';
import { ThemeSelector } from '../theming/ThemeSelector';
import { localStorageAvailable, LocalStorageKeys } from '../utils/localStorage';
import { getDisplayNameFromLocalStorage, saveDisplayNameToLocalStorage } from '../utils/localStorage';
import { DisplayNameField } from './DisplayNameField';
import { TeamsMeetingLinkLocator } from '@azure/communication-calling';

export interface HomeScreenProps {
  startMeetingHandler: (callDetails: { displayName: string; teamsLink?: TeamsMeetingLinkLocator }) => void;
  startTeamsAdhocCall: (callDetails: { displayName: string; mri: string }) => void;
  joiningExistingCall: boolean;
}

type MeetingType = 'ACSMeeting' | 'TeamsMeeting' | 'TeamsAdhocCall';
type MeetingRadialOptions = IChoiceGroupOption & {
  key: MeetingType;
};

const callOptions: MeetingRadialOptions[] = [
  { key: 'ACSMeeting', text: 'Start a ACS Meeting' },
  { key: 'TeamsMeeting', text: 'Join a Teams meeting' },
  { key: 'TeamsAdhocCall', text: 'Call a Teams user' }
];

const callOptionsGroupLabel = 'Select a Meeting option';
const buttonText = 'Next';

export const HomeScreen = (props: HomeScreenProps): JSX.Element => {
  const { startMeetingHandler, startTeamsAdhocCall } = props;
  const imageProps = { src: heroSVG.toString() };
  const headerTitle = props.joiningExistingCall ? 'Join Meeting' : 'Start or join a Meeting';

  // Get display name from local storage if available
  const defaultDisplayName = localStorageAvailable ? getDisplayNameFromLocalStorage() : null;
  const [displayName, setDisplayName] = useState<string | undefined>(defaultDisplayName ?? undefined);

  const [chosenCallOption, setChosenCallOption] = useState<MeetingRadialOptions>(callOptions[0]);
  const [teamsLink, setTeamsLink] = useState<TeamsMeetingLinkLocator>();

  const teamsMRIDefaultValue = window.localStorage.getItem(LocalStorageKeys.AdhocTeamsUserMRI) ?? undefined;
  const [teamsUserMRI, setTeamsUserMRI] = useState<string | undefined>(teamsMRIDefaultValue);

  const buttonEnabled =
    displayName &&
    (chosenCallOption.key !== 'TeamsMeeting' || teamsLink) &&
    (chosenCallOption.key !== 'TeamsAdhocCall' || teamsUserMRI);

  return (
    <Stack
      horizontal
      wrap
      horizontalAlign="center"
      verticalAlign="center"
      tokens={containerTokens}
      className={containerStyle}
    >
      <Image alt="Welcome to the ACS Meeting sample app" className={imgStyle} {...imageProps} />
      <Stack className={infoContainerStyle}>
        <Text role={'heading'} aria-level={1} className={headerStyle}>
          {headerTitle}
        </Text>
        <Stack className={configContainerStyle} tokens={configContainerStackTokens}>
          <Stack tokens={callContainerStackTokens}>
            {!props.joiningExistingCall && (
              <ChoiceGroup
                styles={callOptionsGroupStyles}
                label={callOptionsGroupLabel}
                defaultSelectedKey="ACSMeeting"
                options={callOptions}
                required={true}
                onChange={(_, option) => option && setChosenCallOption(option as MeetingRadialOptions)}
              />
            )}
            {chosenCallOption.key === 'TeamsMeeting' && (
              <TextField
                required
                className={teamsItemStyle}
                iconProps={{ iconName: 'Link' }}
                placeholder={'Enter a Teams meeting link'}
                onChange={(_, newValue) => setTeamsLink(newValue ? { meetingLink: newValue } : undefined)}
              />
            )}
            {chosenCallOption.key === 'TeamsAdhocCall' && (
              <>
                <Text>
                  <b>
                    This feature is currently in{' '}
                    <Link
                      href="https://docs.microsoft.com/en-us/azure/communication-services/concepts/interop/calling-chat"
                      target="_blank"
                    >
                      private preview
                    </Link>
                    .
                  </b>
                </Text>
                <TextField
                  required
                  defaultValue={teamsMRIDefaultValue}
                  className={teamsItemStyle}
                  iconProps={{ iconName: 'Contact' }}
                  placeholder={'Enter a Teams user MRI'}
                  onChange={(_, newValue) => setTeamsUserMRI(newValue)}
                />
              </>
            )}
          </Stack>
          <DisplayNameField defaultName={displayName} setName={setDisplayName} />

          <PrimaryButton
            disabled={!buttonEnabled}
            className={buttonStyle}
            text={buttonText}
            onClick={() => {
              if (displayName) {
                saveDisplayNameToLocalStorage(displayName);
                if (chosenCallOption.key === 'TeamsMeeting' || chosenCallOption.key === 'ACSMeeting') {
                  startMeetingHandler({ displayName, teamsLink });
                } else if (chosenCallOption.key === 'TeamsAdhocCall') {
                  teamsUserMRI && startTeamsAdhocCall({ displayName, mri: teamsUserMRI });
                }
              }
            }}
          />
          <div>
            <ThemeSelector label="Theme" horizontal={true} />
          </div>
        </Stack>
      </Stack>
    </Stack>
  );
};
