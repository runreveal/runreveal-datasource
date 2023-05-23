import { DataQuery, DataSourceJsonData } from '@grafana/data';

export interface MyQuery extends DataQuery {
  queryText?: string;
  constant: number;
}

export const DEFAULT_QUERY: Partial<MyQuery> = {
  constant: 6.5,
};

export interface DataPoint {
  Time: number;
  Value: number;
}

/**
 * These are options configured for each DataSource instance
 */
export interface DataSourceOptions extends DataSourceJsonData {
  workspaceId?: string;
  apiURL? : string;
  defaultTimeField?: string
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