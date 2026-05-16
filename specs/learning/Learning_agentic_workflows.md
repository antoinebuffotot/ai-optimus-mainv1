# Dynatrace Agentic Workflows

> Source: https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/agentic-workflows  
> Status: Preview | Published: Jan 28, 2026

---

## What is an Agentic Workflow?

An agentic workflow is a Dynatrace workflow that uses at least one **Dynatrace Intelligence action** to fulfill its purpose. This can range from simple tasks (e.g., summarizing a problem in natural language) to complex pipelines (e.g., evaluating a data situation, generating a score, and triggering a remediation action).

---

## Key Concepts

- Generative and agentic AI actions offer a flexible way to automate tasks, handling uncertainties based on the prompt defined within the action.
- Unlike hardcoded flows, a generative AI action can deal with unknown or dynamic situations where a fixed action might fail.
- The **Dynatrace Intelligence prompt action** uses generative AI to automate based on a natural language prompt combined with a data context provided by the workflow.
- Multiple prompt actions can be chained within a single agentic workflow to achieve a broader goal.
- Generative actions can be mixed with **data queries** or **code actions** for complex tasks requiring both data context and code-level flexibility.
- The output of a prompt action can dynamically influence any subsequent actions and their execution.

---

## Creating a Workflow from a Template

Dynatrace Intelligence ships a collection of ready-to-use agentic workflow templates.

1. Open the **Workflows** section in Dynatrace.
2. Select **Create workflow**.
3. Choose one of the available agentic workflow templates from the dialog.
4. Instantiate and configure the template to match your use case.

---

## Available Agent Templates

| Agent | Description |
|---|---|
| [Alert Reduction Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/alert-reduction-agent) | Minimize alert fatigue |
| [Database Operations Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/databases-operations-agent) | Analyze database performance issues and get recommendations |
| [Infrastructure Optimization Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/infrastructure-optimization-agent) | Reduce cost and minimize risk by optimizing infrastructure |
| [Kubernetes Troubleshooting Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/kubernetes-troubleshooting-agent) | AI-driven diagnostics, signal correlation, and remediation |
| [Mobile Crash Remediation Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/mobile-crash-remediation-agent) | In-depth analysis of mobile crashes |
| [Threat Triage Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/threat-triage-agent) | Proactive action on emerging threats |
| [Vulnerability Verification Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/vulnerability-verification-agent) | Prioritize vulnerability findings |
| [Security Insights Report Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/security-insights-report-agent) | Enhance your organization's security posture |
| [Security Association Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/security-association-agent) | Prioritize problems and create notifications |
| [Kubernetes Operations Agent](https://docs.dynatrace.com/docs/dynatrace-intelligence/dynatrace-intelligence-integrations/kubernetes-operations-agent) | Analyze exposure to threat alerts across your environment |

---

## Use Cases

Examples of what agentic workflows can automate:

- Summarize a problem in natural language and send a Slack message in your preferred language.
- Trigger deep analysis of a detected spike in mobile app crashes and generate a code fix suggestion.
- Analyze all weekly alerts and summarize the sources of alert noise.
- Evaluate application vulnerabilities and generate a risk score based on runtime context.

---

## Related Resources

- [Dynatrace Workflows Overview](https://docs.dynatrace.com/docs/analyze-explore-automate/workflows)
- [Dynatrace Intelligence Agentic & Generative AI Overview](https://docs.dynatrace.com/docs/dynatrace-intelligence/agentic-and-generative-ai/dynatrace-generative-ai-overview)
