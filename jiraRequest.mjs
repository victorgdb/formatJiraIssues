import axios from "axios";
import dotenv from "dotenv";

dotenv.config();

const jiraBaseUrl = process.env.JIRA_BASE_URL;
const jiraUsername = process.env.JIRA_USERNAME;
const jiraApiToken = process.env.JIRA_API_TOKEN;

export const jiraRequest = axios.create({
  baseURL: jiraBaseUrl,
  headers: {
    Authorization:
      "Basic " +
      Buffer.from(jiraUsername + ":" + jiraApiToken).toString("base64"),
    "Content-Type": "application/json",
  },
});
