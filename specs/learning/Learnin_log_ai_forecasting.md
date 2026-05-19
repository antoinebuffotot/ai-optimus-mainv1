# Log AI Forecasting with Dynatrace – Complete Guide

> Sources:
> - https://docs.dynatrace.com/docs/platform/openpipeline/use-cases/tutorial-log-processing-pipeline *(Updated: Jun 23, 2025)*
> - https://www.dynatrace.com/news/blog/stay-ahead-of-the-game-forecast-it-capacity-with-dynatrace-grail-and-davis-ai/ *(Updated: Jan 19, 2026)*
> - https://docs.dynatrace.com/docs/dynatrace-intelligence/reference/ai-models/forecast-analysis *(Updated: Apr 10, 2026)*

This guide walks through an end-to-end workflow for extracting metrics from raw log data using OpenPipeline, then applying Davis AI forecasting to those metrics for proactive capacity planning and anomaly anticipation.

---

## Overview

| Step | Topic | Description |
|---|---|---|
| **Step 1** | Log Metric Extraction | Parse raw log lines into structured fields and extract a numeric metric via OpenPipeline |
| **Step 2** | AI Forecasting | Use Davis AI to forecast the extracted metric and automate proactive capacity alerts |

---

## Prerequisites

- Dynatrace SaaS environment powered by **Grail** and **AppEngine**
- Either a Dynatrace Platform Subscription (DPS) with **Log Analytics** capabilities, or **DDUs for Log Management and Analytics**
- Basic familiarity with [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language) and [OpenPipeline concepts](https://docs.dynatrace.com/docs/platform/openpipeline/concepts/processing)

---

## What You Will Learn

- Narrow thousands of log lines down to only the relevant ones
- Transform raw log input into structured records with dedicated fields
- Extract a numeric metric from parsed log data
- Forecast the extracted metric using Davis AI (AutoML)
- Automate proactive capacity alerts via a scheduled Workflow

---

# Step 1 – Log Metric Extraction (OpenPipeline)

## Context

Raw log lines contain valuable operational signals buried in unstructured text. OpenPipeline lets you parse those lines into dedicated fields and extract metrics — enabling long-term trending, dashboarding, and forecasting downstream.

### Example Raw Log Line

```json
{
  "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
  "k8s.namespace.name": "online-boutique"
}
```

**Goal**: Extract `userId`, `productId`, and `quantity` as dedicated fields, and create a metric measuring quantity per product.

---

## 1.1 – Find the Relevant Log Lines in Grail

1. Go to **Notebooks**.
2. Run a DQL query to identify the relevant log lines:

```dql
fetch logs
| filter k8s.namespace.name == "online-boutique"
| filter matchesValue(content, "AddItemAsync*")
| fields timestamp, content
| limit 250
```

Review the results to confirm these are the log lines you want to parse.

---

## 1.2 – Create the OpenPipeline Pipeline

1. Go to **Settings** > **Process and contextualize** > **OpenPipeline** > **Logs** > **Pipelines**.
2. Select **+ Pipeline** and name it (e.g. `Online Boutique`).

---

## 1.3 – Configure a Parsing Processor

1. Go to **Processing** > **+ Processor** > **DQL**.
2. Define the processor:
   - **Name**: e.g. `Parse product, user, and quantity`
   - **Matching condition**:
     ```
     matchesValue(content, "AddItemAsync*")
     ```
   - **Processor definition**:
     ```
     parse content, "\"AddItemAsync called with userId=\"LD:userId\", productId=\"LD:productId, \"quantity=\"INT:quantity"
     ```

3. *(Optional)* Verify with sample data:
   1. Paste the following sample:
      ```json
      {
        "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
        "k8s.namespace.name": "online-boutique"
      }
      ```
   2. Select **Run sample data** and confirm `userId`, `productId`, and `quantity` appear as separate fields.

---

## 1.4 – Configure Metric Extraction

1. Go to **Metric extraction** > **+ Processor** > **Value metric**.
2. Define the processor:
   - **Name**: e.g. `Extract quantity by product for AddItem`
   - **Matching condition**: `matchesValue(content, "AddItemAsync*")`
   - **Field name**: `quantity`
   - **Metric key**: `add_item_product_quantity_by_product`
   - **Metric dimension**:
     1. Select **Custom** dimensions.
     2. Enter `productId` and select **Add**.
3. Select **Save**.

The pipeline now has two processors: one for parsing, one for metric extraction.

---

## 1.5 – Route Data to the Pipeline

1. Go to **OpenPipeline** > **Logs** > **Dynamic routing**.
2. Select **+ Dynamic route**:
   - **Name**: e.g. `Online Boutique`
   - **Matching condition**: `k8s.namespace.name == "online-boutique"`
   - **Pipeline**: `Online Boutique`
3. Select **Add**.

---

## 1.6 – Verify the Configuration *(Optional)*

### Generate an Access Token

1. Go to **Access Tokens** > **Generate new token**.
2. Set the scope to `logs.ingest` and select **Generate token**.
3. Copy and store the token securely — it can only be viewed once.

### Send a Test Log Record

```bash
curl -i -X POST "https://{your-environment-id}.live.dynatrace.com/api/v2/logs/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Api-Token <your-API-token>" \
  -d "{\"k8s.namespace.name\":\"online-boutique\",\"content\":\"AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4\"}"
```

A **204 response code** confirms success.

### Verify in a Notebook

Add two DQL sections in a Notebook:

```dql
-- Verify parsed log record
fetch logs
| filter userId == "6517055a-9fcc-4707-8786-e33a767a90c4"
```

```dql
-- Verify extracted metric
timeseries avg(log.add_item_product_quantity_by_product), by:{productId}
| fieldsAdd sum = arraySum(`avg(log.add_item_product_quantity_by_product)`)
| fields sum, productId
```

---

## Step 1 Result

### Before (Raw Log Record)

```json
{
  "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
  "k8s.namespace.name": "online-boutique"
}
```

### After (Structured Log Record + Metric)

```json
{
  "k8s.namespace.name": "online-boutique",
  "quantity": 4,
  "productId": "OLJCESPC7Z",
  "userId": "6517055a-9fcc-4707-8786-e33a767a90c4",
  "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
  "timestamp": "2024-06-19T15:29:54.125000000Z"
}
```

The metric `log.add_item_product_quantity_by_product` is now available for dashboards, analytics — and forecasting in Step 2.

---

# Step 2 – AI Forecasting (Davis AI)

## Context

With the metric extracted from logs in Step 1, Davis AI can now analyze its historical values and forecast future trends using AutoML — automatically selecting the best prediction model based on data characteristics (variance, seasonality, trend, noise).

### How Davis AI Forecasting Works

When a forecast is triggered, the AutoML system:

1. Examines the statistical characteristics of the time series.
2. Selects the best algorithm:
   - **Sampling Forecaster** — for data with significant variance; detects seasonal patterns and simulates multiple future paths to produce a probabilistic forecast.
   - **Linear Extrapolation Forecaster** — for stable, low-variance data; fits a line through recent data points and extends it forward.
3. Returns a **probabilistic forecast** with:
   - A **predicted (median) value**
   - An **upper bound** (best case)
   - A **lower bound** (worst case)

> **Minimum requirement**: The input time series must contain at least **14 data points**.

### Key Forecast Parameters

| Parameter | Default | Range | Description |
|---|---|---|---|
| Forecast horizon | 100 | 1–600 | Number of future data points to predict |
| Coverage probability | 0.9 | 0–1 | Width of prediction interval |
| Simulated paths | 200 | 1–1,000 | More paths = more accuracy, but slower |
| Forecast offset | 1 | 0–10 | Recent (potentially incomplete) data points to exclude |

---

## Part A – Forecast from a Chart (Notebooks)

Best for **ad-hoc, exploratory analysis** of the extracted log metric.

### 2A.1 – Query the Extracted Log Metric

1. Go to **Notebooks** and open a new DQL section.
2. Query the metric extracted in Step 1:

```dql
timeseries avg(log.add_item_product_quantity_by_product), interval: 1h, by: {productId}, from: -14d
```

Other useful queries:

```dql
-- Host CPU usage for capacity planning
timeseries avg(dt.host.cpu.usage), interval: 1h, by: {dt.entity.host}, from: -3d
```

```dql
-- Disk availability forecast
timeseries avg(dt.host.disk.avail), interval: 1h, by: {dt.entity.disk}, from: -7d
```

3. Run the query and review the chart output.

> Queries must return either **time series record format** (`timeseries` command) or **single value format** (`fetch` + `summarize` with a field named `value`).

---

### 2A.2 – Trigger the Forecast from the Chart

1. In the chart output, **select (click) any line** you want to forecast.
2. From the context menu, select **Filter and forecast**.
3. Davis AI will analyze the time series, select the best model, and train it on the historical data.

---

### 2A.3 – Interpret the Forecast Result

Once training completes, the chart updates to show:

- **Solid line** — the predicted (median) future value.
- **Shaded area** — the probabilistic prediction interval (upper and lower bounds).
- **Lower bound** — the worst-case scenario; use this to determine when a resource may breach a critical threshold.

**Example interpretation**: If the lower bound of `add_item_product_quantity_by_product` for a specific product shows a sharp spike in the next 7 days, the team can plan infrastructure scaling or inventory replenishment ahead of time.

---

### 2A.4 – Act on the Results

- Prioritize products or hosts that need attention.
- Schedule capacity changes proactively.
- Share the Notebook as a living planning document with stakeholders.

---

## Part B – Forecast in a Workflow (Automation)

Best for **scheduled, automated forecasting** across many products or resources, producing a consolidated proactive report.

### 2B.1 – Create a New Workflow

1. In Dynatrace, press `CTRL+K` and search for **Workflows**.
2. Select **+ Workflow** and name it (e.g. `Weekly Log Metric Forecast`).

---

### 2B.2 – Configure a Scheduled Trigger

1. Select the **Trigger** block.
2. Choose **Scheduled** as the trigger type.
3. Set a recurring schedule (e.g. every **Monday at 8:00 AM**) to ensure reports arrive during business hours.

---

### 2B.3 – Add a Davis Forecast Action

1. Select **+** after the trigger and search for **Davis Forecast**.
2. Configure the action using the metric extracted in Step 1:

```dql
timeseries avg(log.add_item_product_quantity_by_product), interval: 1h, by: {productId}, from: -14d
```

Set forecast parameters:
- **Forecast horizon**: e.g. `168` (7 days at 1-hour intervals)
- **Coverage probability**: `0.9`
- **Forecast offset**: `1` (default)

---

### 2B.4 – Filter on Critical Threshold

1. Add a **Condition / Script** step after the Forecast action.
2. Filter to only resources where the lower bound breaches your critical threshold:

```javascript
// Filter products where forecast lower bound exceeds capacity threshold
return execution.result.forecasts.filter(
  product => product.lowerBound.max > threshold
);
```

Adjust threshold values to match your SLA or capacity limits.

---

### 2B.5 – Add a Notification Action

1. Add a **Send email** (or Slack / PagerDuty / webhook) action.
2. Configure:
   - **Recipients** — operations or capacity planning team
   - **Subject** — e.g. `[Dynatrace] Weekly Log Metric Forecast Report`
   - **Body** — list of products/resources from Step 2B.4, with forecast values and estimated threshold breach timing

This replaces alert storms with a single, consolidated proactive report during business hours.

---

### 2B.6 – (Optional) Add Automated Remediation

Extend the workflow to act automatically on forecast results:

1. Add an action step (e.g. **scale infrastructure**, **trigger a Terraform plan**, or **call a custom API**).
2. Automatically provision or scale resources identified in Step 2B.4.
3. This achieves full automation: **extract metric → forecast → identify → remediate**.

---

### 2B.7 – Save and Activate

1. Review all steps in the workflow editor.
2. Select **Save**.
3. Toggle the workflow to **Active**.

---

## DQL Query Reference for Forecasting

### Valid Formats

**Time Series Record Format** (recommended):

```dql
timeseries avg(log.add_item_product_quantity_by_product), interval: 1h, by: {productId}, from: -14d
```

```dql
timeseries avg(dt.host.disk.used), interval: 15m, by: {dt.entity.disk}, from: now()-2d, to: now()
```

**Single Value Format**:

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

### Constraints

- Minimum **14 data points** required in the time series.
- Single value format field must be named **`value`** and be of type `double` or `long`.
- The `makeTimeseries` command is **not supported** for Dynatrace Assist integration.
- All records in single value format must have the **same interval** (minimum: 1 minute).

---

## Seasonality Detection Reference

| Seasonal Pattern | Minimum Data Required |
|---|---|
| 1 hour | 2+ hours |
| 1 day (24 hours) | 7+ days |
| 1 week (7 days) | 14+ days |
| Day of week | 7+ days |
| Time of day | 2+ days |
| Minute of hour | 2+ hours |

---

## End-to-End Summary

| Stage | What Happens |
|---|---|
| **Raw log ingestion** | Unstructured log lines arrive in Dynatrace |
| **OpenPipeline parsing** | DQL processor extracts `userId`, `productId`, `quantity` as structured fields |
| **Metric extraction** | `log.add_item_product_quantity_by_product` metric created and stored in Grail |
| **Ad-hoc forecast** | Click a chart line in Notebooks → Davis AI trains a model and visualizes bounds |
| **Automated forecast** | Weekly workflow queries the metric, forecasts future values, filters critical items |
| **Proactive notification** | Consolidated report sent during business hours — before thresholds are breached |
| **Optional remediation** | Automated scaling or provisioning triggered directly from workflow |

---

## Related Resources

- [OpenPipeline Overview](https://docs.dynatrace.com/docs/platform/openpipeline)
- [Processing in OpenPipeline](https://docs.dynatrace.com/docs/platform/openpipeline/concepts/processing)
- [Davis AI Forecast Analysis Documentation](https://docs.dynatrace.com/docs/dynatrace-intelligence/reference/ai-models/forecast-analysis)
- [Dynatrace Workflows (AutomationEngine)](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows)
- [Dynatrace Notebooks](https://docs.dynatrace.com/docs/analyze-explore-automate/dashboards-and-notebooks/notebooks)
- [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language)
- [Log Analytics (DPS)](https://docs.dynatrace.com/docs/license/capabilities/log-analytics)
- [Dynatrace API Authentication](https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication)
