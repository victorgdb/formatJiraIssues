import axios from "axios";
import chalk from "chalk";
import clipboardy from "clipboardy";
import dotenv from "dotenv";
import inquirer from "inquirer";
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

async function getTransitions(issueId) {
  const response = await jiraRequest.get(
    `/rest/api/3/issue/${issueId}/transitions`
  );
  return response.data.transitions;
}

async function transitionIssue(issueId, transitionId) {
  await jiraRequest.post(`/rest/api/3/issue/${issueId}/transitions`, {
    transition: {
      id: transitionId,
    },
  });
}

jiraRequest
  .get("/rest/api/3/search", { params: { jql } })
  .then(async (response) => {
    const issues = response.data.issues;

    if (issues.length === 0) {
      console.log(chalk.yellow("No issues found."));
      process.exit(0);
    }

    // The initial feature: Copying and pasting issues
    let clipboardText = "";
    let bugIssues = [];
    let otherIssues = [];

    issues.forEach((issue) => {
      const issueType = issue.fields.issuetype.name;

      if (issueType.toLowerCase() === "bug") {
        bugIssues.push(issue);
      } else {
        otherIssues.push(issue);
      }
    });

    const formatIssues = (issueList) => {
      return issueList.map((issue) => {
        const issueLink = `${jiraBaseUrl}/browse/${issue.key}`;
        const sanitizedSummary = issue.fields.summary
          .replaceAll("[", "(")
          .replaceAll("]", ")");
        return `[${issue.key} - ${sanitizedSummary}](${issueLink})`;
      });
    };

    console.log(chalk.green("Bugs (" + bugIssues.length + " bugs):"));
    clipboardText += "Bugs (" + bugIssues.length + " bugs):\n";
    const formattedBugIssues = formatIssues(bugIssues);
    formattedBugIssues.forEach((formattedIssue) => {
      console.log(chalk.white(formattedIssue));
      clipboardText += formattedIssue + "\n";
    });

    console.log(chalk.green("\nOthers (" + otherIssues.length + " tickets):"));
    clipboardText += "\nOthers (" + otherIssues.length + " tickets):\n";
    const formattedOtherIssues = formatIssues(otherIssues);
    formattedOtherIssues.forEach((formattedIssue) => {
      console.log(chalk.white(formattedIssue));
      clipboardText += formattedIssue + "\n";
    });

    const totalIssuesText = `\nTotal issues: ${issues.length}`;
    console.log(chalk.green(totalIssuesText));
    clipboardText += totalIssuesText;

    clipboardy.writeSync(clipboardText);
    console.log(chalk.green("Issue list copied to clipboard."));

    // The new feature: Suggest status transitions and move issues

    // Get transitions for the first issue
    const transitions = await getTransitions(issues[0].id);

    // Display possible transitions
    console.log(chalk.green("\nAvailable status transitions:"));
    transitions.forEach((transition) => {
      console.log(chalk.white(transition.name));
    });

    // Prompt user to select a status
    const { selectedStatus } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedStatus",
        message: "Select a status to transition all issues to:",
        choices: transitions.map((transition) => transition.name),
      },
    ]);

    // Get the transition ID for the selected status
    const transitionId = transitions.find(
      (transition) => transition.name === selectedStatus
    ).id;

    // Move all issues to the selected status
    for (const issue of issues) {
      try {
        await transitionIssue(issue.id, transitionId);
        console.log(
          chalk.green(`Moved issue ${issue.key} to ${selectedStatus}.`)
        );
      } catch (error) {
        console.error(
          chalk.red(
            `Error transitioning issue ${issue.key} to ${selectedStatus}:`,
            error.message
          )
        );
      }
    }
  })
  .catch((error) => {
    console.error(chalk.red("Error fetching issues:"), error.message);
    process.exit(1);
  });
