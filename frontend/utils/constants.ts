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
  IN_PROGRESS = "#85C6DB",
  TODO = "#0099ff",
  DONE = "#BADF4F",
  BG = "#ECECED",
}

export const taskPriorityEnum = {
  HIGH: "High",
  LOW: "Low",
  MEDIUM: "Medium",
  NORMAL: "Medium",
};
export enum PriorityBGColorEnum {
  HIGH = "#FFF0ED",
  LOW = "#FFF9E2",
  MEDIUM = "#FFF4E8",
  NORMAL = "#FFF4E8",
}
export enum PriorityBorderColorEnum {
  HIGH = "#FE8A6F",
  LOW = "#F7DC7E",
  MEDIUM = "#FEBC6F",
  NORMAL = "#FEBC6F",
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
