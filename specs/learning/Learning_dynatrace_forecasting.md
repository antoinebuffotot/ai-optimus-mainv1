# IT Capacity Forecasting with Dynatrace Davis AI

> Sources:
> - https://www.dynatrace.com/news/blog/stay-ahead-of-the-game-forecast-it-capacity-with-dynatrace-grail-and-davis-ai/
> - https://docs.dynatrace.com/docs/dynatrace-intelligence/reference/ai-models/forecast-analysis
> Updated: Jan 19, 2026 / Apr 10, 2026

Davis Forecast provides predictive capacity management on top of the Dynatrace Grail data lakehouse, enabling a shift from reactive alerting to proactive, anticipative strategies. It predicts future values for any time series of numeric data using AutoML — automatically selecting the best prediction model based on the characteristics of the input data.

---

## Why Use Forecasting?

Traditional capacity management relies on reactive, threshold-based alerts that often fire outside business hours, leading to alert fatigue and missed planning windows. Davis Forecast transforms this into a scheduled, anticipative model:

| Reactive Approach | Anticipative Approach |
|---|---|
| Static capacity thresholds | Predictive model trained on actual usage |
| Alerts fired when limits are exceeded | Notifications sent proactively, during business hours |
| Alert storms from thousands of resources | Single consolidated report of resources needing attention |
| No planning lead time | Days or weeks of advance warning |

---

## How Davis AI Forecasting Works

When a forecast is triggered, the time series is analyzed by an AutoML system that:

1. Examines statistical characteristics of the data (variance, seasonality, trend, noise).
2. Automatically selects the best algorithm:
   - **Sampling Forecaster** — for time series with significant variance; detects seasonal patterns (hourly, daily, weekly, day-of-week, etc.) and simulates multiple future paths to produce probabilistic forecasts.
   - **Linear Extrapolation Forecaster** — for stable, low-variance data; fits a line through recent data points and extends it into the future.
3. Returns a **probabilistic forecast** with:
   - A **predicted (median) value**
   - An **upper bound** (best case)
   - A **lower bound** (worst case)

> **Minimum requirement**: The input time series must contain at least **14 data points**. Fewer than 14 will cause the forecast to fail.

### Key Forecast Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| Forecast horizon | 100 | 1–600 | Number of future data points to predict |
| Coverage probability | 0.9 | 0–1 | Width of prediction interval (0.9 = 90% of future points expected within bounds) |
| Simulated paths | 200 | 1–1,000 | More paths = more accuracy, but slower |
| Forecast offset | 1 | 0–10 | Number of recent (potentially incomplete) data points to exclude |

---

## Part 1 – Forecast from a Chart (Notebooks)

This method is best for **exploratory, ad-hoc analysis** of a specific time series directly in the Notebooks UI.

### Step 1 – Open Notebooks and Write a DQL Query

1. In Dynatrace, navigate to **Notebooks**.
2. Create a new section with a **DQL** query input field.
3. Write a query that returns time series data. For example, to plot average free disk space over the last 7 days:

```dql
timeseries avg(dt.host.disk.avail), interval: 1h, by: {dt.entity.disk}, from: -7d
```

Other useful query examples:

```dql
-- CPU usage per host over 3 days
timeseries avg(dt.host.cpu.usage), interval: 1h, by: {dt.entity.host}, from: -3d
```

```dql
-- AWS RDS CPU usage
timeseries avg(dt.cloud.aws.rds.cpu.usage)
```

```dql
-- Log event count per minute
fetch logs
| summarize value = count(), by: {timestamp = bin(timestamp, 1m)}
```

4. Run the query and review the chart output.

> The query must return data in either **time series record format** (using `timeseries`) or **single value format** (using `fetch` + `summarize` with a field named `value`).

---

### Step 2 – Trigger the Forecast from the Chart

1. In the chart output, **select (click) any line** you want to forecast.
2. A context menu appears — select **Filter and forecast**.
3. Davis AI will:
   - Analyze the selected time series.
   - Automatically choose the best prediction model (sampling or linear extrapolation).
   - Train the model on the historical data.

---

### Step 3 – Interpret the Forecast Result

Once training is complete, the chart updates to show the forecast:

- **Solid line** — the predicted (median) future value.
- **Shaded area (upper/lower bounds)** — the probabilistic prediction interval (e.g. at 90% coverage, 90% of future values are expected to fall within this range).
- **Lower bound** represents the **worst-case scenario** — use this to determine when a resource will reach a critical threshold.

**Example interpretation**: If the lower bound of free disk space is forecast to fall below 6% in the next 10 days, the operations team should plan to resize the disk before that date — during business hours.

---

### Step 4 – Act on the Results

Based on the forecast output, the team can:

- Prioritize which disks, hosts, or services need attention this week.
- Schedule capacity changes proactively rather than reactively.
- Share the Notebook with stakeholders as a living capacity planning document.

---

## Part 2 – Forecast in a Workflow (Automation)

This method is best for **scheduled, automated capacity forecasting** across many resources — for example, running a weekly forecast across thousands of disks and sending a consolidated report.

### Step 1 – Open the Workflows App

1. In Dynatrace, navigate to **Workflows** (press `CTRL+K` and search for Workflows).
2. Select **+ Workflow** to create a new workflow.
3. Give the workflow a descriptive name (e.g. `Weekly Disk Capacity Forecast`).

---

### Step 2 – Configure a Trigger

1. Select the **Trigger** block.
2. Choose **Scheduled** as the trigger type.
3. Set the schedule (e.g. every **Monday at 8:00 AM**) to run the forecast during business hours.

---

### Step 3 – Add a Davis Forecast Action

1. Select **+** to add a new action step after the trigger.
2. Search for and select **Davis Forecast** (or **Forecast** under Dynatrace Intelligence actions).
3. Configure the action:
   - **DQL query** — provide the time series query for the resources you want to forecast. For example:

     ```dql
     timeseries avg(dt.host.disk.avail), interval: 1h, by: {dt.entity.disk}, from: -14d
     ```

   - **Forecast horizon** — set how far ahead to forecast (e.g. `168` for 7 days at 1-hour intervals).
   - **Coverage probability** — e.g. `0.9` for a 90% prediction interval.
   - **Forecast offset** — set to `1` (default) to exclude the most recent incomplete data point.

---

### Step 4 – Add a Condition to Filter Critical Resources

1. Add a **Condition / Script** action step after the Forecast step.
2. Filter forecast results to only include resources where the **lower bound** is forecast to fall below your critical threshold within the forecast window. For example:

   ```javascript
   // Pseudocode: filter disks where lower bound < 10% free space
   return execution.result.forecasts.filter(
     disk => disk.lowerBound.min < 10
   );
   ```

   Adjust thresholds to match your SLA requirements.

---

### Step 5 – Add a Notification Action

1. Add a **Send email** (or Slack / PagerDuty / webhook) action after the filter step.
2. Configure the notification:
   - **Recipients** — the operations or capacity planning team.
   - **Subject** — e.g. `[Dynatrace] Weekly Disk Capacity Forecast Report`
   - **Body** — include the list of resources identified in Step 4, with their forecast values and estimated time to threshold breach.

This produces a **single, consolidated proactive report** sent during business hours, replacing the alert storm of hundreds of reactive notifications.

---

### Step 6 – (Optional) Add Automated Remediation

Once the team is confident in the anticipatory approach, you can extend the workflow further:

1. Add an additional action after the notification step (e.g. **AWS resize disk**, **Terraform provisioning**, or a **custom script**).
2. Automatically resize or provision resources for any disk/host identified as approaching its threshold.
3. This achieves **full automation**: forecast → identify → remediate — without human intervention.

---

### Step 7 – Save and Activate the Workflow

1. Review all steps in the workflow editor.
2. Select **Save**.
3. Toggle the workflow to **Active** to begin running on the configured schedule.

---

## DQL Query Reference for Forecasting

### Valid Query Formats

Davis Forecast accepts two DQL output formats:

**1. Time Series Record Format** (using `timeseries` command — recommended):

```dql
timeseries avg(dt.host.cpu.usage), interval: 1h, by: {dt.entity.host}, from: -3d
```

```dql
timeseries avg(dt.host.disk.used), interval: 15m, by: {dt.entity.disk}, from: now()-2d, to: now()
```

**2. Single Value Format** (using `fetch` + `summarize` with a `value` field):

```dql
fetch logs
| summarize value = count(), by: {timestamp = bin(timestamp, 1m)}
```

```dql
fetch events, from: -3d
| filter event.kind == "DAVIS_PROBLEM"
| summarize count(), by:{bin(timestamp, 1h), alias: timestamp}
| fieldsRename value=`count()`
```

### Important Constraints

- The time series must contain **at least 14 data points**.
- For the single value format, the field must be named **`value`** and be of type `double` or `long`.
- The `makeTimeseries` command is **not supported** for Dynatrace Assist integration.
- All records in single value format must have the **same interval** between them.
- The minimum allowed interval in single value format is **1 minute**.

---

## Seasonality Detection Reference

The sampling forecaster automatically detects the following seasonal patterns:

| Seasonal Pattern | Minimum Data Required |
|---|---|
| 1 hour | 2+ hours of data |
| 1 day (24 hours) | 7+ days of data |
| 1 week (7 days) | 14+ days of data |
| Day of week | 7+ days of data |
| Time of day | 2+ days of data |
| Minute of hour | 2+ hours of data |

---

## Summary: Chart vs. Workflow Forecasting

| | Forecast from Chart | Forecast in Workflow |
|---|---|---|
| **Best for** | Ad-hoc exploration, one resource at a time | Automated, scheduled forecasting at scale |
| **Trigger** | Manual click on a chart line | Time-based schedule (e.g. weekly) |
| **Output** | Visual probabilistic chart in Notebook | Filtered report / notification / remediation action |
| **Scale** | Single time series | Thousands of resources in parallel |
| **Automation** | None | Full end-to-end automation possible |
| **Use case** | Investigate a specific resource | Proactive capacity management across the fleet |

---

## Related Resources

- [Davis AI Forecast Analysis Documentation](https://docs.dynatrace.com/docs/dynatrace-intelligence/reference/ai-models/forecast-analysis)
- [Dynatrace Workflows (AutomationEngine)](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows)
- [Dynatrace Notebooks](https://docs.dynatrace.com/docs/analyze-explore-automate/dashboards-and-notebooks/notebooks)
- [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language)
- [Dynatrace Grail Data Lakehouse](https://www.dynatrace.com/platform/grail/)
