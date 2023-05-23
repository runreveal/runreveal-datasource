import React, { ChangeEvent } from 'react';
import { FieldSet, InlineField, Input, SecretInput } from '@grafana/ui';
import { DataSourcePluginOptionsEditorProps } from '@grafana/data';
import { DataSourceOptions, SecureSessionInfo } from '../types';

interface Props extends DataSourcePluginOptionsEditorProps<DataSourceOptions> {}

export function ConfigEditor(props: Props) {
  const { onOptionsChange, options } = props;
  const onWorkspaceIdChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      workspaceId: event.target.value,
    };
    onOptionsChange({ ...options, jsonData });
  };

  const onTimeFieldChange = (event: ChangeEvent<HTMLInputElement>) => {
    const jsonData = {
      ...options.jsonData,
      defaultTimeField: event.target.value,
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
    let basicAuth = ":" + event.target.value;
    let encodedAuth = btoa(basicAuth);
    console.log(encodedAuth)
    onOptionsChange({
      ...options,
      secureJsonData: {
        sessionToken: event.target.value,
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
      <InlineField label="API URL" labelWidth={15}>
          <Input
            onChange={onApiUrlChange}
            value={jsonData.apiURL || 'https://michael.runreveal.com'}
            placeholder="RunReveal API URL"
            // readOnly
            width={40}
          />
        </InlineField>

        <InlineField label="Session Token" labelWidth={15}
            tooltip="Session Token used to make calls to your RunReveal account">
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
        <InlineField label="Workspace Id" labelWidth={12}>
          <Input
            onChange={onWorkspaceIdChange}
            value={jsonData.workspaceId || ''}
            placeholder="Workspace Id for events"
            width={40}
          />
        </InlineField>

        <InlineField label="Time Field" tooltip="Default time field used when interpolate the $__timeFilter().">
          <Input
            onChange={onTimeFieldChange}
            placeholder="eventTime"
            value={jsonData?.defaultTimeField ?? 'eventTime'}
          />
        </InlineField>
      </FieldSet>
    </>
  );
}
