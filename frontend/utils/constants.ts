export const menuOptions = [
  { link: "/taskList", title: "Tasks Page" },
  // { link: "/dashboard", title: "DashBoard Page" },
  // { link: "/integrations", title: "Integrations Page" },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];

export const taskStatusEnum = {
  IN_PROGRESS: "In Progress",
  TODO: "To Do",
  DONE: "Done",
};
export enum statusColorEnum {
  IN_PROGRESS = "#bf80ff",
  TODO = "#0099ff",
  DONE = "#04AA6D",
}

export const monthsList = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export const supportedIntegrations = ["JIRA"];
export const importCardData = [
  {
    title: "Jira Software",
    type: "JIRA",
    logo: "jira.png",
    description: "Connect JIRA tickets to your Project",
  },

  {
    title: "Trello",
    type: "Trello",
    logo: "trello.png",
    full: true,
    description: "Connect Trello to your Project",
  },
];
