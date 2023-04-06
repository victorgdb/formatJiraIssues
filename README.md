# Jira Issue CLI

This project provides a command-line tool for fetching issues from Jira, copying issue details to the clipboard, and transitioning issues to a selected status.

## Prerequisites

- Node.js (version 12.x or higher)
- Access to a Jira instance with API access enabled

## Installation

1. Clone the repository:

```
git clone https://github.com/yourusername/jira-issue-cli.git
cd jira-issue-cli
```

## Install dependencies:

```
npm install
```

Create a .env file in the project root with the following content:

```
JIRA_BASE_URL=https://your-jira-instance-url
JIRA_USERNAME=your_jira_username
JIRA_API_TOKEN=your_jira_api_token
```

Replace your-jira-instance-url, your_jira_username, and your_jira_api_token with the appropriate values for your Jira instance.

## Usage

To fetch issues and copy their details to the clipboard, run the following command:

```
node index.mjs "JQL_QUERY"
```

Replace JQL_QUERY with the Jira Query Language (JQL) query to filter the issues you want to fetch. For example:

```
node index.mjs "project = 'TEST' AND status = 'Open'"
```

The script will display the fetched issues in the console, separated into "Bugs" and "Others", and copy the issue details to the clipboard.

After displaying the issues, the script will prompt you to select a status to transition the issues to. Choose a status, and the script will move all fetched issues to the selected status.

## License

This project is licensed under the MIT License.
