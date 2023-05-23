import {
  DataQueryRequest,
  DataQueryResponse,
  DataSourceApi,
  DataSourceInstanceSettings,
  MutableDataFrame,
  FieldType,
} from '@grafana/data';

import { MyQuery, DataSourceOptions, DataSourceResponse, APIAccount } from './types';
import { getBackendSrv, isFetchError } from '@grafana/runtime';
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

  async query(options: DataQueryRequest<MyQuery>): Promise<DataQueryResponse> {
    const { range } = options;
    const from = range!.from.valueOf();
    const to = range!.to.valueOf();

    // Return a constant for each query.
    const data = options.targets.map((target) => {
      return new MutableDataFrame({
        refId: target.refId,
        fields: [
          { name: 'Time', values: [from, to], type: FieldType.time },
          { name: 'Value', values: [target.constant, target.constant], type: FieldType.number },
        ],
      });
    });

    return { data };
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
