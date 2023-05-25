import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { DataSourceOptions, MyQuery } from '../types';
import { CodeEditor } from '@grafana/ui';

type Props = QueryEditorProps<DataSource, MyQuery, DataSourceOptions>;

export function QueryEditor({ query, onChange, onRunQuery }: Props) {

  const onChangeRawQuery = (rq: string) => {
    onChange({ ...query, rawQuery: rq });
    // executes the query
    onRunQuery();
  };

  // Do a raw query to start with and only allow that.
  // Then add functionality into the app to support other features.
  
  // 

  return (
    <>
      <CodeEditor
          height="200px"
          showLineNumbers={true}
          language="sql"
          onBlur={onChangeRawQuery}
          value={query.rawQuery}
        />
    </>
  );
}
