# Parse Log Lines and Extract a Metric with Dynatrace OpenPipeline

> Source: https://docs.dynatrace.com/docs/platform/openpipeline/use-cases/tutorial-log-processing-pipeline  
> Updated: Jun 23, 2025

This tutorial shows how to parse important information from log lines into dedicated fields and extract a metric from them. Dedicated fields improve querying and allow long-term metric data to be displayed on dashboards.

---

## Who This Is For

Administrators controlling log ingestion configuration, data storage, enrichment, and transformation policies.

---

## What You Will Learn

- Narrow thousands of log lines down to only the relevant ones
- Transform raw log input into structured results with dedicated fields (`userId`, `productId`, `quantity`)
- Extract a metric measuring quantity per product from parsed log data

### Example Raw Log Line

```json
{
  "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
  "k8s.namespace.name": "online-boutique"
}
```

---

## Prerequisites

- Dynatrace SaaS environment powered by **Grail** and **AppEngine**
- Either a Dynatrace Platform Subscription (DPS) with **Log Analytics** capabilities, or **DDUs for Log Management and Analytics**

**Helpful prior knowledge:**
- [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language)
- [Processing in OpenPipeline](https://docs.dynatrace.com/docs/platform/openpipeline/concepts/processing)

---

## Overview

| Step | Description |
|---|---|
| Step 1 | Find the relevant log lines in Grail |
| Step 2 | Create a pipeline for parsing and metric extraction |
| Step 3 | Route data to the pipeline |
| Step 4 *(optional)* | Verify the configuration |

---

## Step 1 – Find the Relevant Log Lines in Grail

1. Go to **Notebooks**.
2. Run a DQL query to narrow down to the relevant log lines.

The following example fetches the first 250 logs from the `online-boutique` namespace containing `AddItemAsync`:

```dql
fetch logs
| filter k8s.namespace.name == "online-boutique"
| filter matchesValue(content, "AddItemAsync*")
| fields timestamp, content
| limit 250
```

Review the results to confirm the log lines match what you want to parse and process.

---

## Step 2 – Create a Pipeline for Parsing and Metric Extraction

### 2a. Create the Pipeline

1. Go to **Settings** > **Process and contextualize** > **OpenPipeline** > **Logs** > **Pipelines**.
2. Select **+ Pipeline** and enter a name (e.g. `Online Boutique`).

---

### 2b. Configure a Parsing Processor

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

3. *(Optional)* Verify the processor with sample data:
   1. Enter the following sample data:
      ```json
      {
        "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
        "k8s.namespace.name": "online-boutique"
      }
      ```
   2. Select **Run sample data**.
   3. Review the preview result. Adjust the matching condition or processor definition if needed.

---

### 2c. Configure Metric Extraction

1. Go to **Metric extraction** > **+ Processor** > **Value metric**.
2. Define the processor:
   - **Name**: e.g. `Extract quantity by product for AddItem`
   - **Matching condition**: same as parsing — `matchesValue(content, "AddItemAsync*")`
   - **Field name**: `quantity`
   - **Metric key**: `add_item_product_quantity_by_product`
   - **Metric dimension**:
     1. Select **Custom** dimensions.
     2. Enter `productId`.
     3. Select **Add**.
3. Select **Save**.

The new pipeline now contains two processors: one for parsing and one for metric extraction.

---

## Step 3 – Route Data to the Pipeline

1. Go to **Settings** > **Process and contextualize** > **OpenPipeline** > **Logs** > **Dynamic routing**.
2. Select **+ Dynamic route** and configure it:
   - **Name**: e.g. `Online Boutique`
   - **Matching condition**:
     ```
     k8s.namespace.name == "online-boutique"
     ```
   - **Pipeline**: `Online Boutique` (the pipeline created in Step 2)
3. Select **Add**.

The new dynamic route is now listed and will direct matching log records to the configured pipeline.

---

## Step 4 – Verify the Configuration *(Optional)*

### 4a. Generate an Access Token

1. Go to **Access Tokens** > **Generate new token**.
2. Enter a token name and set the scope to **Ingest logs** (`logs.ingest`).
3. Select **Generate token**.
4. Copy and store the token securely — it can only be viewed once.

---

### 4b. Send a Test Log Record

Run the following `curl` command to send a sample log record to your Dynatrace environment:

```bash
curl -i -X POST "https://{your-environment-id}.live.dynatrace.com/api/v2/logs/ingest" \
  -H "Content-Type: application/json" \
  -H "Authorization: Api-Token <your-API-token>" \
  -d "{\"k8s.namespace.name\":\"online-boutique\",\"content\":\"AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4\"}"
```

Replace:
- `{your-environment-id}` — your Dynatrace environment ID
- `<your-API-token>` — the token generated above

A **204 response code** confirms the request was successful.

---

### 4c. Verify Parsing and Metric Extraction in a Notebook

1. Open a new or existing **Notebook**.
2. Add a DQL section to verify the parsed log record:

```dql
fetch logs
| filter userId == "6517055a-9fcc-4707-8786-e33a767a90c4"
```

3. Add another DQL section to verify the extracted metric:

```dql
timeseries avg(log.add_item_product_quantity_by_product), by:{productId}
| fieldsAdd sum = arraySum(`avg(log.add_item_product_quantity_by_product)`)
| fields sum, productId
```

Both queries should return results confirming the pipeline is correctly parsing and extracting the metric.

---

## Result

### Before (Raw Log Record)

```json
{
  "content": "AddItemAsync called with userId=6517055a-9fcc-4707-8786-e33a767a90c4, productId=OLJCESPC7Z, quantity=4",
  "k8s.namespace.name": "online-boutique"
}
```

### After (Structured Log Record)

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

Raw log data is now transformed into structured records with dedicated `userId`, `productId`, and `quantity` fields, and a new metric (`log.add_item_product_quantity_by_product`) is available for dashboards and analytics.

---

## Related Resources

- [Dynatrace Query Language (DQL)](https://docs.dynatrace.com/docs/platform/grail/dynatrace-query-language)
- [Processing in OpenPipeline](https://docs.dynatrace.com/docs/platform/openpipeline/concepts/processing)
- [OpenPipeline Overview](https://docs.dynatrace.com/docs/platform/openpipeline)
- [Log Analytics (DPS)](https://docs.dynatrace.com/docs/license/capabilities/log-analytics)
- [Dynatrace API Authentication](https://docs.dynatrace.com/docs/dynatrace-api/basics/dynatrace-api-authentication)
