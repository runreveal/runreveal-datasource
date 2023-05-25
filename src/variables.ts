import { DataSourceVariableSupport } from "@grafana/data";
import { DataSource } from "datasource";
import { MyQuery } from "types";

export class VariableSupport extends DataSourceVariableSupport<DataSource, MyQuery> {
    constructor(){
        super();
    }
}
