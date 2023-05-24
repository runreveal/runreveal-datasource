import { DataSourcePlugin } from '@grafana/data';
import { DataSource } from './datasource';
import { ConfigEditor } from './components/ConfigEditor';
import { QueryEditor } from './components/QueryEditor';
import { MyQuery, DataSourceOptions } from './types';
//import { VariableQueryEditor } from 'components/VariableQueryEditor';

export const plugin = new DataSourcePlugin<DataSource, MyQuery, DataSourceOptions>(DataSource)
  .setConfigEditor(ConfigEditor)
  .setQueryEditor(QueryEditor);
