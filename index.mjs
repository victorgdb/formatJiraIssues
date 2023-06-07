import inquirer from "inquirer";
import { copyIssuesToClipboard } from "./clipboardHandler.mjs";
import { fetchIssues } from "./issueFetcher.mjs";
import {
  promptStatusSelection,
  transitionAllIssues,
} from "./statusHandler.mjs";

if (process.argv.length < 3) {
  console.error("Error: JQL string is required as a command-line argument.");
  process.exit(1);
}

const jql = process.argv[2];

async function main() {
  const { action } = await inquirer.prompt([
    {
      type: "list",
      name: "action",
      message: "Select an action:",
      choices: [
        { name: "List issues and copy to clipboard", value: "list" },
        { name: "Move issues", value: "move" },
      ],
    },
  ]);
  const issues = await fetchIssues(jql);

  if (issues.length === 0) {
    console.log("No issues found.");
    process.exit(0);
  }

  switch (action) {
    case "list":
      copyIssuesToClipboard(issues);
      break;
    case "move":
      const selectedStatus = await promptStatusSelection(issues[0].key);
      await transitionAllIssues(issues, selectedStatus);
      break;
    default:
      console.error("Invalid action selected.");
      process.exit(1);
  }
}

main();
