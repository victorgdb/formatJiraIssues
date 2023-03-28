// jira.js
import axios from "axios";
import chalk from "chalk";
import clipboardy from "clipboardy";
import dotenv from "dotenv";
dotenv.config();

if (process.argv.length < 3) {
  console.error(
    chalk.red("Error: JQL string is required as a command-line argument.")
  );
  process.exit(1);
}

const jql = process.argv[2];
const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraApiToken = process.env.JIRA_API_TOKEN;

const jiraRequest = axios.create({
  baseURL: jiraBaseUrl,
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(jiraUsername + ":" + jiraApiToken).toString("base64"),
    "Content-Type": "application/json",
  },
});

jiraRequest
  .get("/rest/api/3/search", { params: { jql } })
  .then((response) => {
    const issues = response.data.issues;

    if (issues.length === 0) {
      console.log(chalk.yellow("No issues found."));
      process.exit(0);
    }

    let clipboardText = "";

    console.log(chalk.green("Issues found:"));
    issues.forEach((issue) => {
      const issueLink = `${jiraBaseUrl}/browse/${issue.key}`;
      const sanitizedSummary = issue.fields.summary
        .replace("[", "(")
        .replace("]", ")");
      const slackFormattedLink = `[${issue.key} - ${sanitizedSummary}](${issueLink})`;
      console.log(chalk.white(slackFormattedLink));
      clipboardText += slackFormattedLink + "\n";
    });

    const totalIssuesText = `Total issues: ${issues.length}`;
    console.log(chalk.green(`\n${totalIssuesText}`));
    clipboardText += totalIssuesText;

    clipboardy.writeSync(clipboardText);
    console.log(chalk.green("Issue list copied to clipboard."));
  })
  .catch((error) => {
    console.error(chalk.red("Error fetching issues:"), error.message);
    process.exit(1);
  });
