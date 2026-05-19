# Dynatrace Assist – Embedded Conversation Starters

> Source: https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/chat-with-dynatrace-assist/dynatrace-assist-conv-starters  
> Updated: Mar 25, 2026

Dynatrace applications including **Kubernetes**, **Vulnerabilities**, **Threats & Exploits**, **Security Posture Management**, **Databases**, and **Problems** allow you to trigger predefined, contextual Dynatrace Assist prompts directly from the UI to increase productivity and conversation efficiency.

---

## Prerequisites

- Dynatrace Intelligence generative AI must be enabled at the environment level.
  - Go to **Settings** > **Dynatrace Intelligence** > **Generative and agentic AI** > **Enable generative AI**.
  - From Dynatrace version **1.335+**, generative AI is enabled by default for all new tenants.
  - Tenants created before version 1.335 are unaffected and must enable it manually.
- Users must have the required [generative AI user permissions](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/agentic-and-generative-ai-getting-started#davis-copilot-user-permissions) if not using Dynatrace default policies.
- You must have access to the **conversational recommender** skill.

---

## Dynatrace Assist in Kubernetes

Get instant AI-powered explanations of warning signals — including root causes and remediation steps — without leaving the Kubernetes app.

1. Navigate to any list page in the **Kubernetes** app (Clusters, Nodes, Namespaces, or Workloads).
2. Select any warning signal, then select **Explain warning signal**.
3. Dynatrace Assist opens and auto-executes the predefined prompt.

**The response includes:**
- A general explanation of the event
- Typical root causes, starting with the most common
- Common remediation steps for each root cause

---

## Dynatrace Assist in Vulnerabilities

Get AI-generated explanations of security vulnerabilities to accelerate understanding and remediation.

1. In **Vulnerabilities**, select a vulnerability.
2. In the upper-right corner of the vulnerability details pane, select **Explain vulnerability**.

**The response includes:**
- A description of the vulnerability and its underlying cause
- Potential impact and conditions for exploitation
- Affected libraries, services, or code locations
- Relevant entry points or execution paths
- Recommended remediation actions (e.g. library upgrades, configuration changes)

> The structure and detail level vary depending on vulnerability type and available context.

---

## Dynatrace Assist in Threats & Exploits

Get plain-language explanations of detection findings to accelerate threat understanding and response.

1. In **Threats & Exploits**, select a finding.
2. In the upper-right corner of the finding details pane, select **Explain finding**.

**The response includes:**
- A description of the threat or exploit and its underlying conditions
- Potential impact and likelihood of exploitation
- Affected entities and relevant attack paths
- Indicators contributing to the threat assessment
- Recommended actions to reduce exposure or validate the finding

> Detail level varies by threat type, available context, and the nature of the exploit.

---

## Dynatrace Assist in Security Posture Management

Get AI explanations of configuration assessment findings to support compliance and misconfiguration remediation.

1. In **Security Posture Management**, go to the **Assessment results** page and select a rule.
2. On the **Assessed resources** tab, select **Explain assessment**.

**The response includes:**
- The intent and requirements of the configuration rule
- Specific configuration values that caused the failure
- Potential security or operational risks of the misconfiguration
- Affected resources
- Recommended remediation steps or configuration adjustments

---

## Dynatrace Assist in Databases

Get natural language summaries of SQL query execution plans, including performance insights and optimization recommendations — no expert database knowledge required.

1. In **Databases**, go to **Explorer**.
2. In the rightmost column, select the statement performance icon.
3. Expand the statement you want to improve. Request an execution plan if one is not yet available.
4. Select the **Execution plan** tab, then select **Summarize execution plan**.
5. Dynatrace Assist opens and auto-executes the predefined prompt.

**The response includes:**
- An explanation of how the database executes the query
- A breakdown of relevant performance details
- Recommendations on how to improve statement performance and reduce resource consumption

---

## Dynatrace Assist in Problems

Get clear, AI-generated summaries of problems, their root causes, and remediation steps — for both single and multiple problems.

### Explain a Single Problem

1. Navigate to any problem detail page.
2. Select **Explain** in the upper-right corner.
3. Dynatrace Assist opens and auto-executes the predefined prompt.

**The response includes:**
- What happened
- Why the problem occurred
- Actionable remediation steps

### Explain Multiple Problems (up to 5)

1. Navigate to the **Problems** list page.
2. Select up to **5 problems**.
3. Select **Explain** above the table.
4. Dynatrace Assist opens and auto-executes the predefined prompt.

**The response includes:**
- An explanation of each problem and why it occurred
- Actionable remediation steps for each
- Any relationships identified between the problems

---

## Dynatrace Assist in Dashboards

Integrate Dynatrace Assist directly into Dashboard tiles using DQL to predefine and optionally auto-execute prompts.

### Add Dynatrace Assist to a Dashboard Tile

1. Go to **Dashboards** and open an editable dashboard.
2. Select a tile containing a DQL query.
3. Select **Edit** to open the edit menu.
4. In the **DQL** section, append the following to your query:

```dql
| fieldsAdd prompt = concat("{your question}", your.field.name)
| fieldsAdd execute = true
```

> - Remove `| fieldsAdd execute = true` to predefine the prompt without auto-executing it.
> - This integration does **not** work for queries using the `makeTimeseries` command.

### Add Supplementary Context (Optional)

Provide hidden context to help Dynatrace Assist give more accurate answers:

```dql
| parse "{\"result\":[{\"type\":\"supplementary\", \"value\":\"The character * often represents sensitive data that has been masked\"}]}", "LD JSON_ARRAY:contexts"
```

For dynamic context based on a field value:

```dql
| fieldsAdd supplementaryContext = concat("{\"result\":[{\"type\":\"supplementary\", \"value\":\"Use the following info to answer the question: ", record.summary, "\"}]}")
| parse supplementaryContext, "LD JSON_ARRAY:contexts"
```

### Open Dynatrace Assist from a Dashboard Tile

1. Select the icon next to your chosen field entry.
2. Select **Open with…** > **Ask a question**.

If `| fieldsAdd execute = true` is present, the prompt executes automatically. Otherwise, you can review or edit the prompt before running it.

---

## Dynatrace Assist in Notebooks

The same DQL-based integration available for Dashboards also works in Notebooks.

### Add Dynatrace Assist to a Notebook Section

1. Go to **Notebooks** and open an editable notebook.
2. Select a section containing a DQL query.
3. Append the following to your query:

```dql
| fieldsAdd prompt = concat("{your question}", your.field.name)
| fieldsAdd execute = true
```

> - Remove `| fieldsAdd execute = true` to predefine without auto-executing.
> - This integration does **not** work for queries using the `makeTimeseries` command.

### Add Supplementary Context (Optional)

Same syntax as in Dashboards — see the [Dashboards section](#dynatrace-assist-in-dashboards) above.

### Open Dynatrace Assist from a Notebook

1. Select the icon next to your chosen field entry.
2. Select **Open with…** > **Ask a question**.

---

## Providing Feedback

You can submit feedback directly in the Dynatrace Assist chat window. See [Give feedback](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/chat-with-dynatrace-assist#feedback) for details.

---

## Related Resources

- [Get started with Dynatrace Intelligence agentic and generative AI](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/agentic-and-generative-ai-getting-started)
- [Dynatrace Intelligence agentic and generative AI FAQ](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/agentic-and-generative-ai-faq)
- [Dynatrace Assist overview](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/chat-with-dynatrace-assist)
