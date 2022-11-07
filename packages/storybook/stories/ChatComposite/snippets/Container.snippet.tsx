import { AzureCommunicationTokenCredential } from '@azure/communication-common';
import { ChatComposite, CompositeLocale, FakeChatAdapter } from '@azure/communication-react';
import { PartialTheme, Theme } from '@fluentui/react';
import React, { useMemo } from 'react';

export type ContainerProps = {
  /** UserIdentifier is of type CommunicationUserIdentifier see below how to construct it from a string input */
  userIdentifier: string;
  token: string;
  displayName: string;
  endpointUrl: string;
  threadId: string;
  fluentTheme?: PartialTheme | Theme;
  errorBar?: boolean;
  participants?: boolean;
  topic?: boolean;
  locale?: CompositeLocale;
  formFactor?: 'desktop' | 'mobile';
};

export const ContosoChatContainer = (props: ContainerProps): JSX.Element => {
  const credential = useMemo(() => {
    try {
      return new AzureCommunicationTokenCredential(props.token);
    } catch {
      console.error('Failed to construct token credential');
      return undefined;
    }
  }, [props.token]);

  const adapter = useMemo(() => {
    return new FakeChatAdapter();
  }, []);
  if (adapter) {
    return (
      <div style={{ height: '90vh', width: '90vw' }}>
        <ChatComposite
          adapter={adapter}
          fluentTheme={props.fluentTheme}
          options={{
            errorBar: props.errorBar,
            topic: props.topic
          }}
          locale={props.locale}
          formFactor={props.formFactor}
        />
      </div>
    );
  }
  if (credential === undefined) {
    return <>Failed to construct credential. Provided token is malformed.</>;
  }
  return <>Initializing...</>;
};
