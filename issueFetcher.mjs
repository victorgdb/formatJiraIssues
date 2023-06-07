import axios from "axios";
import dotenv from "dotenv";
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

export async function fetchIssues(jql) {
  try {
    const response = await jiraRequest.get("/rest/api/3/search", {
      params: { jql },
    });
    return response.data.issues;
  } catch (error) {
    console.error("Error fetching issues:", error.message);
    process.exit(1);
  }
}
