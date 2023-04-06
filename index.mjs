import dotenv from "dotenv";
import { copyIssuesToClipboard, fetchIssues } from "./issueHandler.mjs";
import {
  promptStatusSelection,
  transitionAllIssues,
} from "./statusHandler.mjs";

dotenv.config();

const jql = process.argv[2];

(async function main() {
  try {
    // Fetch issues
    const issues = await fetchIssues(jql);

    // Copy issues to clipboard
    copyIssuesToClipboard(issues);

    // Prompt user to select a status
    const selectedStatus = await promptStatusSelection(issues[0].key);

    // Move all issues to the selected status
    await transitionAllIssues(issues, selectedStatus);
  } catch (error) {
    console.error(error.message);
  }
})();
