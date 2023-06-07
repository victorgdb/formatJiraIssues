import axios from "axios";
import dotenv from "dotenv";
import inquirer from "inquirer";
dotenv.config();

const jiraRequest = axios.create({
  baseURL: process.env.JIRA_BASE_URL,
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(
        process.env.JIRA_USERNAME + ":" + process.env.JIRA_API_TOKEN
      ).toString("base64"),
    "Content-Type": "application/json",
  },
});

export async function promptStatusSelection(issueKey) {
  try {
    const response = await jiraRequest.get(
      `/rest/api/3/issue/${issueKey}/transitions`
    );
    const transitions = response.data.transitions;

    const { selectedStatus } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedStatus",
        message: "Select a status to transition to:",
        choices: transitions.map((transition) => ({
          name: `${transition.name} (Transition: ${transition.to.name})`,
          value: transition.id,
        })),
      },
    ]);

    return selectedStatus;
  } catch (error) {
    console.error("Error fetching transitions:", error.message);
    process.exit(1);
  }
}

export async function transitionAllIssues(issues, statusId) {
  try {
    const transitionPromises = issues.map((issue) =>
      jiraRequest.post(`/rest/api/3/issue/${issue.key}/transitions`, {
        transition: { id: statusId },
      })
    );

    await Promise.all(transitionPromises);
    console.log("All issues have been transitioned to the selected status.");
  } catch (error) {
    console.error("Error transitioning issues:", error.message);
    process.exit(1);
  }
}
