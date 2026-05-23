import type { GuideSectionData } from "../components/GuideSection";

export type IntegrationSection = GuideSectionData;

export interface IntegrationGuide {
  id: string;
  name: string;
  overview: string;
  sections: IntegrationSection[];
}

const WORKFLOW_VARIABLES_NOTE: IntegrationSection = {
  type: "paragraph",
  text:
    "All variables below are evaluated at workflow execution time using the Dynatrace event payload.",
};

export const integrationGuides: IntegrationGuide[] = [
  {
    id: "servicenow",
    name: "ServiceNow",
    overview:
      "Integrate Dynatrace Workflows with ServiceNow to automatically create, update, and resolve incidents or change requests based on Dynatrace problem events.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed environment (version 1.260+)",
          "ServiceNow instance with admin access",
          "A dedicated ServiceNow service account for API access",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "ServiceNow Configuration" },
      { type: "heading", level: 3, text: "1. Create a Service Account" },
      {
        type: "ordered-list",
        items: [
          "In ServiceNow, navigate to User Administration > Users.",
          "Create a new user (e.g., `dynatrace-integration`).",
          {
            text: "Assign the following roles:",
            sub: ["itil", "rest_service"],
          },
          "Note the username and password for later use.",
        ],
      },
      { type: "heading", level: 3, text: "2. Enable REST API Access" },
      {
        type: "paragraph",
        text: "Ensure the REST API plugin is active: navigate to System Definition > Plugins, search for `com.glide.rest` and confirm it is active.",
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      { type: "heading", level: 3, text: "1. Create a ServiceNow Connection" },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Settings > Integrations > ServiceNow.",
          {
            text: "Click Add connection and fill in:",
            sub: [
              "Name: ServiceNow Production",
              "Instance URL: https://<your-instance>.service-now.com",
              "Username: service account username",
              "Password: service account password",
            ],
          },
          "Click Test connection and then Save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Navigate to Automations > Workflows.",
          "Click Create workflow and choose Problem trigger.",
          {
            text: "Configure the trigger:",
            sub: [
              "Event type: Problem opened / Problem closed",
              'Filter (optional): e.g., event.category == "AVAILABILITY"',
            ],
          },
        ],
      },
      { type: "heading", level: 3, text: "3. Add a ServiceNow Action" },
      {
        type: "paragraph",
        text: "Within the workflow, add a new action step. Select ServiceNow from the action catalog and choose one of the available action types:",
      },
      {
        type: "table",
        headers: ["Action", "Description"],
        rows: [
          ["Create Incident", "Opens a new incident in ServiceNow"],
          ["Update Incident", "Updates an existing incident"],
          [
            "Resolve Incident",
            "Closes an incident when the problem is resolved",
          ],
          ["Create Change Request", "Opens a change request"],
        ],
      },
      {
        type: "code",
        title: "Example: Create Incident",
        language: "yaml",
        content: `action: servicenow.create_incident
parameters:
  connection: "ServiceNow Production"
  short_description: "{{ event.title }}"
  description: |
    Problem ID: {{ event.id }}
    Severity: {{ event.severityLevel }}
    Affected Entity: {{ event.affectedEntities[0].name }}
    Impact: {{ event.impactLevel }}
    URL: {{ event.url }}
  urgency: "2"        # 1=High, 2=Medium, 3=Low
  impact: "2"
  category: "software"
  assignment_group: "IT Operations"`,
      },
      {
        type: "code",
        title: "Example: Resolve Incident (on Problem Close)",
        language: "yaml",
        content: `action: servicenow.update_incident
parameters:
  connection: "ServiceNow Production"
  sys_id: "{{ execution.output['create_incident'].sys_id }}"
  state: "6"          # 6 = Resolved
  close_code: "Solved (Permanently)"
  close_notes: "Dynatrace problem {{ event.id }} resolved automatically."`,
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["{{ event.id }}", "Dynatrace Problem ID"],
          ["{{ event.title }}", "Problem title"],
          [
            "{{ event.severityLevel }}",
            "Severity (e.g., AVAILABILITY, PERFORMANCE)",
          ],
          [
            "{{ event.impactLevel }}",
            "Impact level (APPLICATION, SERVICE, INFRASTRUCTURE)",
          ],
          [
            "{{ event.affectedEntities }}",
            "List of affected Dynatrace entities",
          ],
          ["{{ event.url }}", "Link to the problem in Dynatrace"],
          ["{{ event.startTime }}", "Problem start timestamp"],
        ],
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Detected
        |
        v
  Workflow Triggered
        |
        v
  ServiceNow Action
  +-------------------------------+
  |  Create Incident in ServiceNow|
  |  (with problem details)       |
  +-------------------------------+
        |
  [Problem Resolved]
        |
        v
  Workflow Triggered (close event)
        |
        v
  +-------------------------------+
  |  Update & Resolve Incident    |
  +-------------------------------+`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "Manually trigger a problem in Dynatrace (via Settings > Anomaly detection) or use the Simulate event option in Workflows.",
          "Confirm that a new incident appears in ServiceNow.",
          "Resolve the Dynatrace problem and verify the ServiceNow incident is updated accordingly.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "Connection test fails",
            "Verify instance URL, credentials, and network firewall rules",
          ],
          [
            "Incident not created",
            "Check workflow execution logs under Automations > Executions",
          ],
          [
            "Fields missing in ServiceNow",
            "Ensure the service account has `itil` role and field-level permissions",
          ],
          [
            "Duplicate incidents",
            "Add a condition to check if a problem is already mapped to an existing incident",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "ServiceNow REST API Reference",
        href: "https://docs.servicenow.com/bundle/washingtondc-api-reference/page/integrate/inbound-rest/concept/c_RESTAPI.html",
      },
    ],
  },

  {
    id: "jira",
    name: "Jira",
    overview:
      "Integrate Dynatrace Workflows with Jira (Cloud or Data Center) to automatically create and manage issues based on Dynatrace problem events.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed (version 1.260+)",
          "Jira Cloud or Jira Data Center instance",
          "Jira account with project admin rights",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "Jira Configuration" },
      { type: "heading", level: 3, text: "1. Generate an API Token (Jira Cloud)" },
      {
        type: "ordered-list",
        items: [
          "Log in to your Atlassian Account (id.atlassian.com/manage-profile/security/api-tokens).",
          "Click Create API token, name it `Dynatrace Workflow`, and copy the token.",
        ],
      },
      {
        type: "note",
        text: "For Jira Data Center, use a Personal Access Token (PAT) generated under Profile > Personal Access Tokens.",
      },
      { type: "heading", level: 3, text: "2. Identify Your Project Details" },
      {
        type: "list",
        items: [
          "Project Key (e.g., OPS)",
          "Issue Type (e.g., Bug, Incident, Task)",
          "Board ID (if using Scrum/Kanban)",
        ],
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      { type: "heading", level: 3, text: "1. Create a Jira Connection" },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Settings > Integrations > Jira.",
          {
            text: "Click Add connection and fill in:",
            sub: [
              "Name: Jira Cloud Production",
              "Base URL: https://<your-org>.atlassian.net (Cloud) or your Data Center URL",
              "Username / Email: your Jira account email",
              "API Token / PAT: token from the previous step",
            ],
          },
          "Click Test connection and Save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Go to Automations > Workflows > Create workflow.",
          "Set the trigger to Problem event.",
          "Configure filters as needed (e.g., severity, entity type).",
        ],
      },
      { type: "heading", level: 3, text: "3. Add a Jira Action" },
      {
        type: "paragraph",
        text: "Add a Jira action step and configure it:",
      },
      {
        type: "table",
        headers: ["Action", "Description"],
        rows: [
          ["Create issue", "Opens a new Jira issue"],
          ["Update issue", "Modifies fields on an existing issue"],
          [
            "Transition issue",
            "Moves an issue through workflow states",
          ],
          ["Add comment", "Appends a comment to an existing issue"],
        ],
      },
      {
        type: "code",
        title: "Example: Create Issue",
        language: "yaml",
        content: `action: jira.create_issue
parameters:
  connection: "Jira Cloud Production"
  project_key: "OPS"
  issue_type: "Incident"
  summary: "[Dynatrace] {{ event.title }}"
  description: |
    *Problem Details*
    - *Problem ID:* {{ event.id }}
    - *Severity:* {{ event.severityLevel }}
    - *Impact:* {{ event.impactLevel }}
    - *Affected Entity:* {{ event.affectedEntities[0].name }}
    - *Start Time:* {{ event.startTime }}
    - *Dynatrace URL:* {{ event.url }}
  priority: "High"
  labels:
    - "dynatrace"
    - "auto-created"
  assignee: "ops-team-lead@example.com"`,
      },
      {
        type: "code",
        title: "Example: Transition Issue to Done (on Problem Close)",
        language: "yaml",
        content: `action: jira.transition_issue
parameters:
  connection: "Jira Cloud Production"
  issue_key: "{{ execution.output['create_issue'].key }}"
  transition: "Done"
  comment: "Dynatrace problem {{ event.id }} has been resolved. Closing automatically."`,
      },

      { type: "heading", level: 2, text: "Storing the Issue Key Across Steps" },
      {
        type: "paragraph",
        text: 'To link the "create" and "close" steps, store the issue key from the creation step and reference it in subsequent steps:',
      },
      {
        type: "code",
        language: "yaml",
        content: `# Step 1 — Create issue, store result
- id: create_issue
  action: jira.create_issue
  ...

# Step 2 — Transition on resolve (separate workflow or condition branch)
- id: close_issue
  action: jira.transition_issue
  parameters:
    issue_key: "{{ steps.create_issue.output.key }}"`,
      },
      {
        type: "note",
        text: "Tip: Use the Dynatrace problem ID (event.id) as a custom field or label in Jira to look up existing issues reliably in subsequent workflows.",
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["{{ event.id }}", "Dynatrace Problem ID"],
          ["{{ event.title }}", "Problem title"],
          [
            "{{ event.severityLevel }}",
            "AVAILABILITY / PERFORMANCE / ERROR / RESOURCE",
          ],
          [
            "{{ event.impactLevel }}",
            "APPLICATION / SERVICE / INFRASTRUCTURE",
          ],
          [
            "{{ event.affectedEntities[0].name }}",
            "Name of the first affected entity",
          ],
          ["{{ event.url }}", "Deep-link to the problem in Dynatrace"],
          ["{{ event.startTime }}", "ISO 8601 problem start time"],
        ],
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Opened
        |
        v
  Workflow Triggered
        |
        v
  +-------------------------+
  | Create Jira Issue (OPS) |
  | Returns issue key       |
  +-------------------------+
        |
  [Problem Resolved]
        |
        v
  Workflow Triggered (close)
        |
        v
  +--------------------------+
  | Transition Issue -> Done |
  | + Add resolution comment |
  +--------------------------+`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "Use Simulate event in the Workflow editor or trigger a real Dynatrace problem.",
          "Confirm the Jira issue is created with the correct fields.",
          "Resolve the problem in Dynatrace and verify the Jira issue transitions to the expected state.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "401 Unauthorized",
            "Verify API token is correct and not expired",
          ],
          [
            "Project not found",
            "Check the project key is exact and the user has access",
          ],
          [
            "Issue type invalid",
            "Confirm issue type name matches exactly (case-sensitive)",
          ],
          [
            "Transition fails",
            "Ensure the issue is in a state that allows the target transition",
          ],
          [
            "Fields rejected",
            "Check required fields for the project's issue creation screen",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "Jira Cloud REST API",
        href: "https://developer.atlassian.com/cloud/jira/platform/rest/v3/",
      },
      {
        type: "link",
        label: "Jira Data Center REST API",
        href: "https://developer.atlassian.com/server/jira/platform/rest-apis/",
      },
    ],
  },

  {
    id: "slack",
    name: "Slack",
    overview:
      "Integrate Dynatrace Workflows with Slack to send automated notifications to channels or users when Dynatrace detects problems, anomalies, or other events.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed (version 1.260+)",
          "Slack workspace with admin rights (or permission to install apps)",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "Slack Configuration" },
      { type: "heading", level: 3, text: "1. Create a Slack App" },
      {
        type: "ordered-list",
        items: [
          "Go to api.slack.com/apps and click Create New App > From scratch.",
          "Name the app (e.g., `Dynatrace Alerts`) and select your workspace.",
          {
            text: "Under OAuth & Permissions, add the following Bot Token Scopes:",
            sub: [
              "chat:write",
              "chat:write.public",
              "channels:read",
              "users:read (optional, for DMs)",
            ],
          },
          "Click Install to Workspace and authorize.",
          "Copy the Bot User OAuth Token (xoxb-...).",
        ],
      },
      { type: "heading", level: 3, text: "2. Invite the Bot to a Channel" },
      {
        type: "code",
        language: "bash",
        content: "/invite @DynatraceAlerts",
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      { type: "heading", level: 3, text: "1. Create a Slack Connection" },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Settings > Integrations > Slack.",
          {
            text: "Click Add connection and fill in:",
            sub: [
              "Name: Slack Workspace",
              "Bot Token: paste the xoxb-... token",
            ],
          },
          "Click Test connection and Save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Go to Automations > Workflows > Create workflow.",
          "Select a trigger (e.g., Problem, Custom event, or Schedule).",
          "Add a Slack action step.",
        ],
      },
      { type: "heading", level: 3, text: "3. Configure the Slack Action" },
      {
        type: "table",
        headers: ["Action", "Description"],
        rows: [
          ["Send message", "Posts a message to a channel or user"],
          ["Send direct message", "Sends a DM to a specific user"],
          [
            "Update message",
            "Edits a previously sent message (requires `ts`)",
          ],
        ],
      },
      {
        type: "code",
        title: "Example: Problem Alert to Channel",
        language: "yaml",
        content: `action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  text: |
    :red_circle: *Dynatrace Problem Detected*
    *Title:* {{ event.title }}
    *Severity:* {{ event.severityLevel }}
    *Impact:* {{ event.impactLevel }}
    *Affected:* {{ event.affectedEntities[0].name }}
    *Started:* {{ event.startTime }}
    <{{ event.url }}|View in Dynatrace>`,
      },
      {
        type: "code",
        title: "Example: Resolution Notification",
        language: "yaml",
        content: `action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  text: |
    :large_green_circle: *Dynatrace Problem Resolved*
    *Title:* {{ event.title }}
    *Problem ID:* {{ event.id }}
    *Duration:* {{ event.duration }}
    <{{ event.url }}|View in Dynatrace>`,
      },
      {
        type: "code",
        title: "Example: Rich Block Kit Message",
        language: "yaml",
        content: `action: slack.send_message
parameters:
  connection: "Slack Workspace"
  channel: "#ops-alerts"
  blocks:
    - type: header
      text:
        type: plain_text
        text: "Dynatrace Problem Detected"
    - type: section
      fields:
        - type: mrkdwn
          text: "*Title:*\\n{{ event.title }}"
        - type: mrkdwn
          text: "*Severity:*\\n{{ event.severityLevel }}"
        - type: mrkdwn
          text: "*Impact:*\\n{{ event.impactLevel }}"
        - type: mrkdwn
          text: "*Affected Entity:*\\n{{ event.affectedEntities[0].name }}"
    - type: actions
      elements:
        - type: button
          text:
            type: plain_text
            text: "View in Dynatrace"
          url: "{{ event.url }}"
          style: danger`,
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["{{ event.id }}", "Dynatrace Problem ID"],
          ["{{ event.title }}", "Problem title"],
          ["{{ event.severityLevel }}", "Severity category"],
          ["{{ event.impactLevel }}", "Impact level"],
          [
            "{{ event.affectedEntities[0].name }}",
            "First affected entity name",
          ],
          ["{{ event.url }}", "Deep-link to the Dynatrace problem"],
          ["{{ event.startTime }}", "Problem start time"],
          ["{{ event.duration }}", "Total problem duration (on close)"],
        ],
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Event
        |
        v
  Workflow Triggered
        |
        +--- Problem Opened ---> Slack #ops-alerts (red alert message)
        |
        +--- Problem Resolved --> Slack #ops-alerts (green resolved message)`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "Use Simulate event in the Workflow editor.",
          "Confirm the message appears in the target Slack channel.",
          "Check formatting, links, and variable substitution are correct.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "`not_in_channel` error",
            "Invite the bot to the target channel with /invite",
          ],
          [
            "`invalid_auth` error",
            "Verify the Bot Token is correct and the app is installed",
          ],
          [
            "Message not formatted",
            "Check Block Kit JSON syntax; use the Slack Block Kit Builder",
          ],
          [
            "Variables showing raw",
            "Ensure workflow trigger returns the expected event fields",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "Slack API Documentation",
        href: "https://api.slack.com/docs",
      },
      {
        type: "link",
        label: "Slack Block Kit Builder",
        href: "https://app.slack.com/block-kit-builder",
      },
    ],
  },

  {
    id: "msteams",
    name: "Microsoft Teams",
    overview:
      "Integrate Dynatrace Workflows with Microsoft Teams to send automated notifications to Teams channels when Dynatrace detects problems or anomalies.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed (version 1.260+)",
          "Microsoft Teams workspace with admin or team owner access",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "Microsoft Teams Configuration" },
      {
        type: "heading",
        level: 3,
        text: "Option A: Incoming Webhook (Recommended for Simplicity)",
      },
      {
        type: "ordered-list",
        items: [
          "In Microsoft Teams, open the target channel.",
          "Click ··· (More options) next to the channel name > Connectors.",
          "Search for Incoming Webhook and click Configure.",
          "Name it `Dynatrace Alerts`, optionally upload an icon, and click Create.",
          "Copy the Webhook URL provided.",
        ],
      },
      {
        type: "note",
        text: "As of late 2024, Microsoft is phasing out Office 365 Connectors in favor of Workflows (Power Automate). If Incoming Webhook is unavailable in your tenant, use Option B below.",
      },
      {
        type: "heading",
        level: 3,
        text: "Option B: Power Automate Flow (Modern Approach)",
      },
      {
        type: "ordered-list",
        items: [
          "Go to make.powerautomate.com.",
          "Create a new flow: Instant cloud flow > When an HTTP request is received.",
          "Add a Post message in a chat or channel Teams action.",
          "Save the flow and copy the generated HTTP POST URL.",
        ],
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      {
        type: "heading",
        level: 3,
        text: "1. Create a Microsoft Teams Connection",
      },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Settings > Integrations > Microsoft Teams.",
          {
            text: "Click Add connection and fill in:",
            sub: [
              "Name: Teams Operations Channel",
              "Webhook URL: URL from Option A or B above",
            ],
          },
          "Click Test connection and Save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Go to Automations > Workflows > Create workflow.",
          "Choose a trigger (e.g., Problem opened, Problem resolved).",
          "Add a Microsoft Teams action step.",
        ],
      },
      { type: "heading", level: 3, text: "3. Configure the Teams Action" },
      {
        type: "code",
        title: "Example: Problem Alert (Adaptive Card)",
        language: "yaml",
        content: `action: msteams.send_message
parameters:
  connection: "Teams Operations Channel"
  message:
    type: AdaptiveCard
    version: "1.4"
    body:
      - type: TextBlock
        text: "Dynatrace Problem Detected"
        size: Large
        weight: Bolder
        color: Attention
      - type: FactSet
        facts:
          - title: "Title"
            value: "{{ event.title }}"
          - title: "Severity"
            value: "{{ event.severityLevel }}"
          - title: "Impact"
            value: "{{ event.impactLevel }}"
          - title: "Affected Entity"
            value: "{{ event.affectedEntities[0].name }}"
          - title: "Start Time"
            value: "{{ event.startTime }}"
    actions:
      - type: Action.OpenUrl
        title: "View in Dynatrace"
        url: "{{ event.url }}"`,
      },
      {
        type: "code",
        title: "Example: Simple Text Message (Problem Resolved)",
        language: "yaml",
        content: `action: msteams.send_message
parameters:
  connection: "Teams Operations Channel"
  text: |
    **Dynatrace Problem Resolved**
    **Title:** {{ event.title }}
    **Problem ID:** {{ event.id }}
    **Duration:** {{ event.duration }}
    [View in Dynatrace]({{ event.url }})`,
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["{{ event.id }}", "Dynatrace Problem ID"],
          ["{{ event.title }}", "Problem title"],
          ["{{ event.severityLevel }}", "Severity category"],
          ["{{ event.impactLevel }}", "Impact scope"],
          [
            "{{ event.affectedEntities[0].name }}",
            "First affected entity",
          ],
          ["{{ event.url }}", "Deep-link to the problem"],
          ["{{ event.startTime }}", "Problem start time (ISO 8601)"],
          ["{{ event.duration }}", "Problem duration (on close)"],
        ],
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Event
        |
        v
  Workflow Triggered
        |
        +--- Problem Opened ---> Teams Channel (Adaptive Card alert)
        |
        +--- Problem Resolved --> Teams Channel (resolution message)`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "In the Workflow editor, click Simulate event.",
          "Verify the Adaptive Card or text message appears in the correct Teams channel.",
          "Click the View in Dynatrace button to confirm the link resolves correctly.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "Webhook URL returns 410 Gone",
            "Office 365 Connector deprecated; migrate to Power Automate",
          ],
          [
            "Message not delivered",
            "Check that the Webhook URL is still valid and not expired",
          ],
          [
            "Adaptive Card not rendered",
            "Validate the card schema at adaptivecards.io/designer",
          ],
          [
            "Variables not substituted",
            "Verify the trigger event type includes the expected fields",
          ],
          [
            "Test passes but live events fail",
            "Check workflow execution log under Automations > Executions",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "Microsoft Teams Incoming Webhooks",
        href: "https://learn.microsoft.com/en-us/microsoftteams/platform/webhooks-and-connectors/how-to/add-incoming-webhook",
      },
      {
        type: "link",
        label: "Adaptive Cards Designer",
        href: "https://adaptivecards.io/designer/",
      },
      {
        type: "link",
        label: "Power Automate HTTP Trigger",
        href: "https://learn.microsoft.com/en-us/power-automate/workflow-trigger-http",
      },
    ],
  },

  {
    id: "pagerduty",
    name: "PagerDuty",
    overview:
      "Integrate Dynatrace Workflows with PagerDuty to automatically trigger, acknowledge, and resolve PagerDuty incidents based on Dynatrace problem lifecycle events.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed (version 1.260+)",
          "PagerDuty account with service admin access",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "PagerDuty Configuration" },
      {
        type: "heading",
        level: 3,
        text: "1. Create an Integration on a PagerDuty Service",
      },
      {
        type: "ordered-list",
        items: [
          "In PagerDuty, go to Services > Service Directory.",
          "Select your target service (or create a new one).",
          "Go to the Integrations tab and click Add an integration.",
          "Search for Dynatrace or use Events API v2.",
          "Click Add and copy the Integration Key (routing key).",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "2. (Optional) Create a Dedicated Service",
      },
      {
        type: "paragraph",
        text: "For better noise isolation, create a dedicated PagerDuty service for Dynatrace alerts:",
      },
      {
        type: "ordered-list",
        items: [
          "Services > Service Directory > New Service.",
          "Name it `Dynatrace Monitoring`.",
          "Assign an escalation policy.",
          "Add the Events API v2 integration and note the integration key.",
        ],
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      { type: "heading", level: 3, text: "1. Create a PagerDuty Connection" },
      {
        type: "ordered-list",
        items: [
          "In Dynatrace, go to Settings > Integrations > PagerDuty.",
          {
            text: "Click Add connection and fill in:",
            sub: [
              "Name: PagerDuty Production",
              "Integration Key: key from PagerDuty",
              "API Token (optional, for advanced operations): PagerDuty API key from User settings > API Access",
            ],
          },
          "Click Test connection and Save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Go to Automations > Workflows > Create workflow.",
          "Set the trigger to Problem events.",
          "Use branching logic to handle open vs. resolved events.",
        ],
      },
      { type: "heading", level: 3, text: "3. Configure PagerDuty Actions" },
      {
        type: "code",
        title: "Example: Trigger Incident (Problem Opened)",
        language: "yaml",
        content: `action: pagerduty.trigger_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"    # Prevents duplicate incidents
  summary: "{{ event.title }}"
  severity: "critical"                      # critical | error | warning | info
  source: "Dynatrace"
  component: "{{ event.affectedEntities[0].name }}"
  group: "{{ event.impactLevel }}"
  custom_details:
    problem_id: "{{ event.id }}"
    severity_level: "{{ event.severityLevel }}"
    impact_level: "{{ event.impactLevel }}"
    affected_entity: "{{ event.affectedEntities[0].name }}"
    dynatrace_url: "{{ event.url }}"
    start_time: "{{ event.startTime }}"
  links:
    - href: "{{ event.url }}"
      text: "View Problem in Dynatrace"`,
      },
      {
        type: "code",
        title: "Example: Resolve Incident (Problem Closed)",
        language: "yaml",
        content: `action: pagerduty.resolve_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"    # Must match the trigger dedup_key
  summary: "Dynatrace problem {{ event.id }} resolved automatically."`,
      },
      {
        type: "code",
        title: "Example: Acknowledge Incident",
        language: "yaml",
        content: `action: pagerduty.acknowledge_incident
parameters:
  connection: "PagerDuty Production"
  routing_key: "{{ connection.integration_key }}"
  dedup_key: "dynatrace-{{ event.id }}"`,
      },

      { type: "heading", level: 2, text: "Severity Mapping" },
      {
        type: "paragraph",
        text: "Map Dynatrace severity levels to PagerDuty severities:",
      },
      {
        type: "table",
        headers: ["Dynatrace Severity", "PagerDuty Severity"],
        rows: [
          ["AVAILABILITY", "critical"],
          ["PERFORMANCE", "error"],
          ["ERROR", "error"],
          ["RESOURCE_CONTENTION", "warning"],
          ["CUSTOM_ALERT", "info"],
          ["MONITORING_UNAVAILABLE", "critical"],
        ],
      },
      {
        type: "paragraph",
        text: "You can implement this mapping with a conditional expression in the workflow:",
      },
      {
        type: "code",
        language: "javascript",
        content: `// Dynatrace JavaScript expression
const severityMap = {
  "AVAILABILITY": "critical",
  "PERFORMANCE": "error",
  "ERROR": "error",
  "RESOURCE_CONTENTION": "warning",
  "CUSTOM_ALERT": "info"
};
return severityMap[event.severityLevel] || "error";`,
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          [
            "{{ event.id }}",
            "Dynatrace Problem ID (use as `dedup_key`)",
          ],
          ["{{ event.title }}", "Problem title"],
          ["{{ event.severityLevel }}", "Severity category"],
          ["{{ event.impactLevel }}", "Impact scope"],
          [
            "{{ event.affectedEntities[0].name }}",
            "First affected entity",
          ],
          ["{{ event.url }}", "Deep-link to the problem"],
          ["{{ event.startTime }}", "Problem start time"],
          ["{{ event.duration }}", "Duration (available on close)"],
        ],
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Opened
        |
        v
  Workflow Triggered
        |
        v
  PagerDuty: Trigger Incident
  (dedup_key = dynatrace-{{ event.id }})
        |
        v
  On-call engineer notified
        |
  [Problem Resolved in Dynatrace]
        |
        v
  Workflow Triggered (close event)
        |
        v
  PagerDuty: Resolve Incident
  (matched by same dedup_key)`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "Simulate a Dynatrace problem or use Simulate event in the Workflow editor.",
          "Confirm a new incident appears in PagerDuty with the correct severity and details.",
          "Resolve the Dynatrace problem and verify the PagerDuty incident auto-resolves.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "Incident not created",
            "Verify the integration key is from Events API v2, not v1",
          ],
          [
            "Duplicate incidents triggered",
            "Ensure `dedup_key` is consistent across trigger and resolve steps",
          ],
          [
            "Resolve event not matching",
            "Confirm `dedup_key` in the resolve action matches the trigger exactly",
          ],
          [
            "Wrong severity in PagerDuty",
            "Implement the severity mapping expression above",
          ],
          [
            "API token errors",
            "Ensure the PagerDuty API token has `incidents:write` scope",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "PagerDuty Events API v2",
        href: "https://developer.pagerduty.com/docs/events-api-v2/overview/",
      },
      {
        type: "link",
        label: "PagerDuty Deduplication",
        href: "https://support.pagerduty.com/docs/event-management#deduplication",
      },
    ],
  },

  {
    id: "webhook",
    name: "Generic Webhook / REST",
    overview:
      "Use the Generic Webhook action in Dynatrace Workflows to send HTTP requests to any external system that exposes a REST API. This is the most flexible integration option, used when no native connector is available.",
    sections: [
      { type: "heading", level: 2, text: "Prerequisites" },
      {
        type: "list",
        items: [
          "Dynatrace SaaS or Managed (version 1.260+)",
          "A target endpoint that accepts HTTP requests (GET, POST, PUT, PATCH, DELETE)",
          "Dynatrace Workflow automation license",
        ],
      },

      { type: "heading", level: 2, text: "When to Use a Generic Webhook" },
      {
        type: "list",
        items: [
          "No native Dynatrace connector exists for your target tool",
          "You need full control over the HTTP request (headers, body, method)",
          "Integrating with internal/custom systems",
          "Calling third-party REST APIs directly (e.g., OpsGenie, Freshservice, custom ITSM)",
        ],
      },

      { type: "heading", level: 2, text: "Dynatrace Configuration" },
      {
        type: "heading",
        level: 3,
        text: "1. (Optional) Create a Credential Vault Entry",
      },
      {
        type: "paragraph",
        text: "For secure storage of API keys or tokens:",
      },
      {
        type: "ordered-list",
        items: [
          "Go to Settings > Integrations > Credential vault.",
          {
            text: "Click Add credentials and choose the type:",
            sub: [
              "Username/Password for Basic Auth",
              "Token for Bearer or API key auth",
            ],
          },
          "Name it (e.g., `MyTool API Key`) and save.",
        ],
      },
      { type: "heading", level: 3, text: "2. Create a Workflow" },
      {
        type: "ordered-list",
        items: [
          "Go to Automations > Workflows > Create workflow.",
          "Choose your trigger (e.g., Problem, Schedule, Custom event).",
          "Add an HTTP request action step.",
        ],
      },
      {
        type: "heading",
        level: 3,
        text: "3. Configure the HTTP Request Action",
      },
      {
        type: "code",
        title: "Basic POST Example",
        language: "yaml",
        content: `action: http.request
parameters:
  method: POST
  url: "https://api.example.com/v1/incidents"
  headers:
    Content-Type: "application/json"
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
    X-Source: "Dynatrace"
  body: |
    {
      "title": "{{ event.title }}",
      "severity": "{{ event.severityLevel }}",
      "impact": "{{ event.impactLevel }}",
      "affected_entity": "{{ event.affectedEntities[0].name }}",
      "problem_id": "{{ event.id }}",
      "start_time": "{{ event.startTime }}",
      "url": "{{ event.url }}",
      "source": "Dynatrace"
    }`,
      },
      {
        type: "code",
        title: "GET Request with Query Parameters",
        language: "yaml",
        content: `action: http.request
parameters:
  method: GET
  url: "https://api.example.com/v1/services/lookup"
  headers:
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
  query_params:
    entity: "{{ event.affectedEntities[0].entityId }}"
    env: "production"`,
      },
      {
        type: "code",
        title: "PUT Request (Update a Resource)",
        language: "yaml",
        content: `action: http.request
parameters:
  method: PUT
  url: "https://api.example.com/v1/incidents/{{ steps.create_incident.output.id }}"
  headers:
    Content-Type: "application/json"
    Authorization: "Bearer {{ vault['MyTool API Key'].token }}"
  body: |
    {
      "status": "resolved",
      "resolved_at": "{{ event.endTime }}",
      "resolution_note": "Auto-resolved by Dynatrace Workflow"
    }`,
      },

      { type: "heading", level: 2, text: "Reading the HTTP Response" },
      {
        type: "paragraph",
        text: "Use the response from a previous HTTP action step in subsequent steps:",
      },
      {
        type: "code",
        language: "javascript",
        content: `// Access response body (parsed as JSON)
const responseBody = execution.output['create_incident'];
const incidentId = responseBody.id;

// Access HTTP status code
const statusCode = execution.output['create_incident'].statusCode;

// Conditional logic based on response
if (statusCode >= 200 && statusCode < 300) {
  return { success: true, incident_id: incidentId };
} else {
  throw new Error(\`API call failed with status \${statusCode}\`);
}`,
      },

      { type: "heading", level: 2, text: "Authentication Patterns" },
      {
        type: "code",
        title: "Bearer Token",
        language: "yaml",
        content: `headers:
  Authorization: "Bearer {{ vault['MyAPIToken'].token }}"`,
      },
      {
        type: "code",
        title: "Basic Authentication",
        language: "yaml",
        content: `headers:
  Authorization: "Basic {{ (vault['MyCredentials'].username + ':' + vault['MyCredentials'].password) | base64encode }}"`,
      },
      {
        type: "code",
        title: "API Key in Header",
        language: "yaml",
        content: `headers:
  X-API-Key: "{{ vault['MyAPIKey'].token }}"`,
      },
      {
        type: "code",
        title: "API Key in Query String",
        language: "yaml",
        content: `url: "https://api.example.com/endpoint?api_key={{ vault['MyAPIKey'].token }}"`,
      },
      {
        type: "paragraph",
        text: "For mTLS, upload the certificate under Settings > Integrations > Credential vault > Certificate and reference it in the action.",
      },

      { type: "heading", level: 2, text: "Workflow Variable Reference" },
      WORKFLOW_VARIABLES_NOTE,
      {
        type: "table",
        headers: ["Variable", "Description"],
        rows: [
          ["{{ event.id }}", "Dynatrace Problem ID"],
          ["{{ event.title }}", "Problem title"],
          ["{{ event.severityLevel }}", "Severity category"],
          ["{{ event.impactLevel }}", "Impact scope"],
          [
            "{{ event.affectedEntities }}",
            "Array of affected entities",
          ],
          [
            "{{ event.affectedEntities[0].entityId }}",
            "Entity ID of the first affected entity",
          ],
          [
            "{{ event.affectedEntities[0].name }}",
            "Name of the first affected entity",
          ],
          ["{{ event.url }}", "Deep-link to the problem"],
          ["{{ event.startTime }}", "ISO 8601 start time"],
          ["{{ event.endTime }}", "ISO 8601 end time (on close)"],
          [
            "{{ vault['CredentialName'].token }}",
            "Secret from the credential vault",
          ],
          [
            "{{ steps.<step_id>.output }}",
            "Output from a previous workflow step",
          ],
        ],
      },

      { type: "heading", level: 2, text: "Advanced Patterns" },
      { type: "heading", level: 3, text: "Retry on Failure" },
      {
        type: "code",
        language: "yaml",
        content: `action: http.request
retry:
  max_attempts: 3
  wait_seconds: 10
  retry_on_status_codes:
    - 429    # Too Many Requests
    - 503    # Service Unavailable`,
      },
      { type: "heading", level: 3, text: "Chaining Multiple Webhook Calls" },
      {
        type: "code",
        language: "markdown",
        content: `Step 1: POST /incidents          -> Returns { "id": "INC-001" }
Step 2: POST /incidents/INC-001/comments  -> Uses ID from Step 1
Step 3: PUT /incidents/INC-001   -> Updates status`,
      },
      { type: "heading", level: 3, text: "Conditional Execution" },
      {
        type: "paragraph",
        text: "Use a Condition step to skip the webhook if criteria aren't met:",
      },
      {
        type: "code",
        language: "javascript",
        content: `// Only call webhook if impact is APPLICATION level
return event.impactLevel === "APPLICATION";`,
      },

      { type: "heading", level: 2, text: "End-to-End Flow" },
      {
        type: "ascii",
        content: `Dynatrace Problem Event
        |
        v
  Workflow Triggered
        |
        v
  [Optional] Condition Check
        |
        v
  HTTP Request Action
  +--------------------------------------+
  |  POST https://api.example.com/...    |
  |  Headers: Authorization, Content-Type|
  |  Body: event details (JSON)          |
  +--------------------------------------+
        |
        v
  Read Response (status, body)
        |
        v
  [Optional] Follow-up actions
  (update, comment, notify)`,
      },

      { type: "heading", level: 2, text: "Testing the Integration" },
      {
        type: "ordered-list",
        items: [
          "Use a tool like webhook.site as a temporary endpoint to inspect the raw payload.",
          "Use Simulate event in the Workflow editor to fire a test event.",
          "Inspect the request body in webhook.site and validate all variable substitutions.",
          "Switch the URL to your production endpoint once validated.",
        ],
      },

      { type: "heading", level: 2, text: "Troubleshooting" },
      {
        type: "table",
        headers: ["Issue", "Resolution"],
        rows: [
          [
            "`4xx` response from endpoint",
            "Check URL, auth headers, and request body format",
          ],
          [
            "`401 Unauthorized`",
            "Verify the credential vault entry and token scope",
          ],
          [
            "`SSL certificate error`",
            "Ensure the endpoint uses a valid TLS cert, or configure custom CA",
          ],
          [
            "Variables not substituted",
            "Confirm the trigger event provides the expected fields",
          ],
          [
            "Response body empty",
            "Some APIs return `204 No Content`; handle gracefully in downstream steps",
          ],
          [
            "Workflow fails silently",
            "Check Automations > Executions for error details",
          ],
        ],
      },

      { type: "heading", level: 2, text: "References" },
      {
        type: "link",
        label: "Dynatrace Workflow Documentation",
        href: "https://docs.dynatrace.com/docs/platform/workflows",
      },
      {
        type: "link",
        label: "Dynatrace Credential Vault",
        href: "https://docs.dynatrace.com/docs/manage/credential-vault",
      },
      {
        type: "link",
        label: "Webhook Testing Tool",
        href: "https://webhook.site",
      },
      {
        type: "link",
        label: "HTTP Status Codes Reference",
        href: "https://developer.mozilla.org/en-US/docs/Web/HTTP/Status",
      },
    ],
  },
];

export const getIntegrationGuide = (id: string): IntegrationGuide | undefined =>
  integrationGuides.find((g) => g.id === id);
