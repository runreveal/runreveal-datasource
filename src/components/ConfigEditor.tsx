import React, { ChangeEvent } from 'react';
import { FieldSet, InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceOptions, SecureSessionInfo } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<DataSourceOptions> { }

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onWorkspaceIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      workspaceId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onApiUrlChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      apiURL: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  // Secure field (only sent to the backend)
  const onSessionChange = (event: ChangeEvent<HTMLInputElement>) => {
    let tok = event.target.value
    if (!atob(event.target.value).startsWith(':')) {
      tok = btoa(":" + event.target.value)
    }

    onOptionsChange({
      ...options,
      secureJsonData: {
        sessionToken: tok,
      },
    });
  };

  const onResetSessionToken = () => {
    onOptionsChange({
      ...options,
      secureJsonFields: {
        ...options.secureJsonFields,
        sessionToken: false,
      },
      secureJsonData: {
        ...options.secureJsonData,
        sessionToken: '',
      },
    });
  };

  const { jsonData, secureJsonFields } = options;
  const secureJsonData = (options.secureJsonData || {}) as SecureSessionInfo;

  return (
    <>
      <FieldSet label="API Settings">
        <InlineField label="API URL" labelWidth={20}>
          <Input
            onChange={onApiUrlChange}
            value={jsonData.apiURL || 'https://www-api.runreveal.com'}
            placeholder="RunReveal API URL"
            readOnly
            width={40}
          />
        </InlineField>

        <InlineField label="Session Token" labelWidth={20}
          tooltip="Session Token is your account authentication token, calls made to RunReveal will be made using the account this was generated from">
          <SecretInput
            onChange={onSessionChange}
            onReset={onResetSessionToken}
            isConfigured={(secureJsonFields && secureJsonFields.sessionToken) as boolean}
            value={secureJsonData.sessionToken || ''}
            placeholder="RunReveal session token"
            width={40}
          />
        </InlineField>
      </FieldSet>

      <FieldSet label="General">
        <InlineField label="Workspace ID" labelWidth={20}
          tooltip="The workspace that queries will be made against">
          <Input
            onChange={onWorkspaceIdChange}
            value={jsonData.workspaceId || ''}
            placeholder="Workspace Id for events"
            width={40}
          />
        </InlineField>
      </FieldSet>
    </>
  );
}
