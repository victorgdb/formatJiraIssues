import chalk from "chalk";
import clipboardy from "clipboardy";
export function copyIssuesToClipboard(issues) {
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
      const issueLink = `${process.env.JIRA_BASE_URL}/browse/${issue.key}`;
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
}
