# RunReveal data source for Grafana

## Installation

For detailed instructions on how to install the plugin on Grafana Cloud or
locally, please checkout the [Plugin installation docs](https://grafana.com/docs/grafana/latest/plugins/installation/).

## Configuration

In order to use this data source you must have an account with *[RunReveal](https://runreveal.com)* that has a valid workspace.
To setup an account and get authenticated follow the [getting started](https://docs.runreveal.com/getting-started/guides/quickstart) guide in the docs.

Once you have created your *RunReveal* account and installed the plugin you can configure the data source. You will need your session token and the workspace id of the workspace that you want to run queries against. To acquire this info you can use the *RunReveal* cli and run the following command:

```bash
runreveal config show --grafana
```

Use the printed values to fill in the configuration fields for the data source.


## Building Queries

The query editor uses SQL queries to access your RunReveal log data. 
Your log data is stored in a 
[ClickHouse](https://clickhouse.com/docs/en/sql-reference/syntax) 
database and must be valid sql based on their syntax.

### Time series

Time series visualizations are selectable after adding a `datetime` field with the alias of `time`. Most queries will use the `eventTime` field when selecting time series data. All other fields will be treated as a value column based on the data type of the data returned. Here is an example query that could be written to get the number of readonly events per time interval.

```sql
SELECT $__timeInterval(eventTime) as time, readOnly, COUNT(*) as counts 
FROM runreveal_logs 
WHERE eventTime between $__fromTime and $__toTime 
GROUP by time, readOnly
ORDER BY time 
```

#### Multi-line time series

Grafana supports displaying multiple metrics on a single query. By default the query will display a separate metric for all numeric fields.

If you would like to split the data based on the values of a column you need to perform a transform on the query in Grafana.
When adding a transform choose the [Partition by values](https://grafana.com/docs/grafana/latest/panels-visualizations/query-transform-data/transform-data/?utm_source=grafana#partition-by-values) and select the columns that the data will be split on.

### Tables

*RunReveal* stores your normalized events in a table called `runreveal_logs`. This table offers a handful of columns that can be searched on. Since events are all stored in the same table data can be filtered by the `sourceType` column. The raw event from this source is stored in json format in the `rawLog` column.

*RunReveal* also offers some secondary tables which split the `rawLog` column into a normalized data structure.

In order to view which tables are accessible to your *RunReveal* account and which columns are available to select, you can run the following queries on the `Explore` tab in Grafana.

````sql
show tables

DESCRIBE [table_name]
````

### Macros

To allow for dynamic parts, like date range filters, the query can contain macros.

Here is an example of a query with a macro:
````sql
SELECT eventTime as time, sourceType
FROM runreveal_logs
WHERE time between $__fromTime AND $__toTime
````

| Macro                                        | Description                                                                                                                                                                         | Output example                                          |
|----------------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|---------------------------------------------------------|
| *$__fromTime*                                | Replaced by the starting time of the range of the panel casted to DateTime                                                                                                          | `toDateTime(intDiv(1415792726371,1000))`                |
| *$__toTime*                                  | Replaced by the ending time of the range of the panel casted to DateTime                                                                                                            | `toDateTime(intDiv(1415792726371,1000))`                |
| *$__timeInterval(columnName)*                | Replaced by a function calculating the interval based on window size, useful when grouping                                                                                          | `toStartOfInterval(column, INTERVAL intDiv(20000,1000) second)`         |

