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

export class DataSource extends DataSourceApi<MyQuery, DataSourceOptions> {
  url?: string;
  baseurl?: string;

  constructor(instanceSettings: DataSourceInstanceSettings<DataSourceOptions>) {
    super(instanceSettings);

    this.url = instanceSettings.url!;
    this.baseurl = instanceSettings.jsonData.apiURL!;
  }

  replaceMacros(from: number, to: number, query: string): string {
      query = query.replace("$__fromTime", `toDateTime(intDiv(${from},1000))`);
      query = query.replace("$__toTime", `toDateTime(intDiv(${to},1000))`);

      return query;
  }

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
     const { range } = options;
     const from = range!.from.valueOf();
     const to = range!.to.valueOf();


    // Return a constant for each query.
    const data = options.targets.map(async (target) => {
      let rawQuery = target.rawQuery || '';
      const templateSrv = getTemplateSrv();
      rawQuery = this.replaceMacros(from, to, rawQuery);
      rawQuery = templateSrv.replace(rawQuery);

      console.log(rawQuery)

      const promiseResponse = getBackendSrv().fetch<DataSourceResponse<DataPoint>>({
        url: this.url + '/api/logs/query',
        method: 'POST',
        data: {
          query: rawQuery
        }
      });
      const response = await firstValueFrom(promiseResponse);
      const datapoints = response.data.result;
      const timestamps: number[] = [];
      const values: number[] = [];


      
      datapoints.columns.forEach((val, idx) => {
        if (val == "Time") {
          datapoints.values[idx].forEach(time => {
            timestamps.push(Date.parse(time))
          });
        }
        if (val == "Value") {
          datapoints.values[idx].forEach(value => {
            values.push(value)
          });
        }
      });



        // if (datapoints[i].Time === undefined) {
        //   throw new Error(`Data point ${i} does not contain "Time" property`);
        // }
        // if (datapoints[i].Value === undefined) {
        //   throw new Error(`Data point ${i} does not contain "Value" property`);
        // }


      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', type: FieldType.time, values: timestamps },
          { name: 'Value', type: FieldType.number, values: values },
        ],
      });
    });

    return Promise.all(data).then((data) => ({ data }));
  }


  async testDatasource() {
    console.log(this.baseurl);

    try {
      const response = await firstValueFrom(getBackendSrv().fetch<DataSourceResponse<APIAccount>>({
        url: this.url + '/api/account',
        method: 'GET',
      }));
    
      if (response.status != 200) {
        return {
          status: 'fail',
          message: 'Request to RunReveal failed with: ' + response.statusText
        }
      } else if (response.status == 200 && !response.data.success) {
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
        message = 'Fetch error: ' + (err.statusText ? err.statusText : "Error connecting to RunReveal.");
        if (err.data && err.data.error && err.data.error.code) {
          message += ': ' + err.data.error.code + '. ' + err.data.error.message;
        }
      }
      return {
        status: 'error',
        message,
      };
    }
  }
}
