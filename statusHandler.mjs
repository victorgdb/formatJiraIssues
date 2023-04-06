import inquirer from "inquirer";
import { jiraRequest } from "./jiraRequest.mjs";

export async function promptStatusSelection(issueKey) {
  try {
    const response = await jiraRequest.get(
      `/rest/api/3/issue/${issueKey}/transitions`
    );
    const transitions = response.data.transitions;

    const statusOptions = transitions.map((transition) => ({
      name: `${transition.name} (${transition.to.name})`,
      value: transition.id,
    }));

    const { selectedStatus } = await inquirer.prompt([
      {
        type: "list",
        name: "selectedStatus",
        message: "Select a status to transition the issues to:",
        choices: statusOptions,
      },
    ]);

    return selectedStatus;
  } catch (error) {
    console.error(
      chalk.red("Error fetching available statuses:"),
      error.message
    );
    process.exit(1);
  }
}

export async function transitionAllIssues(issues, selectedStatus) {
  const transitionPromises = issues.map((issue) => {
    return jiraRequest.post(`/rest/api/3/issue/${issue.key}/transitions`, {
      transition: {
        id: selectedStatus,
      },
    });
  });

  try {
    await Promise.all(transitionPromises);
    console.log("All issues have been transitioned to the selected status.");
  } catch (error) {
    console.error(chalk.red("Error transitioning issues:"), error.message);
    process.exit(1);
  }
}
