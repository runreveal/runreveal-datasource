import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, DataSourceOptions, DataSourceResponse, APIAccount, DataPoint } from './types';
import { getBackendSrv, getTemplateSrv, isFetchError } from '@grafana/runtime';
import { firstValueFrom } from 'rxjs';
import _ from 'lodash';
import { VariableSupport } from 'variables';

export class DataSource extends DataSourceApi<MyQuery, DataSourceOptions> {
  url?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);
    this.variables = new VariableSupport();
    this.url = instanceSettings.url!;
    this.annotations = {}
  }

  replaceMacros(from: number, to: number, query: string): string {
    query = query.replace(/\$__fromTime/g, `toDateTime(intDiv(${from},1000))`);
    query = query.replace(/\$__toTime/g, `toDateTime(intDiv(${to},1000))`);
    query = query.replace(/\$__timeInterval\((.+?)\)/g, "toStartOfInterval($1, INTERVAL intDiv(${__interval_ms:raw},1000) second)")

    return query;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    const data = options.targets.map(async (target) => {
      let rawQuery = target.rawQuery || '';
      const templateSrv = getTemplateSrv();
      rawQuery = this.replaceMacros(from, to, rawQuery);
      rawQuery = templateSrv.replace(rawQuery, options.scopedVars, 'sqlstring');

      const promiseResponse = getBackendSrv().fetch<DataSourceResponse<DataPoint>>({
        url: this.url + '/api/logs/query',
        method: 'POST',
        data: {
          query: rawQuery,
          source: "grafana-plugin"
        }
      });
      const response = await firstValueFrom(promiseResponse);
      const datapoints = response.data.result;
      if (datapoints.error !== undefined && datapoints.error !== '') {
        throw new Error(datapoints.error);
      }

      const dataFrame: MutableDataFrame = new MutableDataFrame({ refId: target.refId, fields: [] });

      datapoints.columns.forEach((val, idx) => {
        let valtype: FieldType;
        if (datapoints.values[idx] === null || datapoints.values[idx].length === 0) {
          valtype = FieldType.other;
        } else {
          switch (typeof datapoints.values[idx][0]) {
            case 'string':
              if (val === "time") {
                valtype = FieldType.time;
              } else if (val === "geo") {
                valtype = FieldType.geo;
              } else {
                valtype = FieldType.string;
              }
              break;
            case 'number':
              valtype = FieldType.number;
              break;
            case 'boolean':
              valtype = FieldType.boolean;
              break;
            default:
              valtype = FieldType.other;
          }
        }

        dataFrame.addField({ name: val, type: valtype, values: (datapoints.values[idx] === null ? [] : datapoints.values[idx]) })
      });

      return dataFrame;
    });

    return Promise.all(data).then((data) => ({ data }));
  }


  async testDatasource() {

    try {
      const response = await firstValueFrom(getBackendSrv().fetch<DataSourceResponse<APIAccount>>({
        url: this.url + '/api/workspace/roles/list',
        method: 'GET',
      }));

      if (response.status !== 200) {
        return {
          status: 'fail',
          message: 'Request to RunReveal failed with: ' + response.statusText
        }
      } else if (response.status === 200 && !response.data.success) {
        return {
          status: 'fail',
          message: 'RunReveal datasource test failed: ' + response.data.error
        }
      } else {
        return {
          status: 'success',
          message: 'Success',
        };
      }
    } catch (err) {
      let message = '';
      if (_.isString(err)) {
        message = err;
      } else if (isFetchError(err)) {
        message = err.data.error + ": " + err.data.message
      }
      else {
        message += "An unknown error occurred authenticating to the RunReveal system"
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
