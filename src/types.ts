import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  rawQuery: string;
}

export interface DataPoint {
  resultCount: number;
  columns: string[];
  values: any[][];
  error: string;
  query: string;
}

/**
 * These are options configured for each DataSource instance
 */
export interface DataSourceOptions extends DataSourceJsonData {
  workspaceId?: string;
  apiURL?: string;
}

/**
 * Value that is used in the backend, but never sent over HTTP to the frontend
 */
export interface SecureSessionInfo {
  sessionToken?: string;
}

export interface DataSourceResponse<T> {
  success: boolean;
  error: string;
  result: T;
}

export interface APIAccount {
  id: string;
  email: string;
}
