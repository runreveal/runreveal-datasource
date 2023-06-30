import React from 'react';
import { QueryEditorProps } from '@grafana/data';
import { DataSource } from '../datasource';
import { DataSourceOptions, MyQuery } from '../types';
import { Button, CodeEditor } from '@grafana/ui';
import { styles } from 'styles';

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
    <div className={'gf-form ' + styles.QueryEditor.queryType }>
      <Button onClick={() => onRunQuery()}>Run Query</Button>
      </div>
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
