export const publicRoutes = [
  "/login",
  "/registration",
  "/socialLogin/redirect",
];
export const ignoreRoutes = [
  "/_next",
  "/assets",
  "/socialLogin/redirect",
  "/integrations",
];
export const menuOptions = [
  { link: "/taskList", title: "Tasks Page" },
  // { link: "/dashboard", title: "DashBoard Page" },
  // { link: "/integrations", title: "Integrations Page" },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];

export enum progressColorEnum {
  IN_PROGRESS = "#85C6DB",
  TODO = "#0099ff",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export const taskStatusEnum = {
  IN_PROGRESS: "In progress",
  TODO: "To do",
  DONE: "Done",
};

export enum statusBorderColorEnum {
  IN_PROGRESS = "#56A2E9",
  TODO = "#ADACB0",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export enum statusBGColorEnum {
  IN_PROGRESS = "#E4F2FF",
  TODO = "#F9F9F9",
  DONE = "#FAFFEA",
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
    type: "TRELLO",
    logo: "trello.png",
    full: true,
    description: "Connect Trello to your Project",
  },
];
export const whiteListEmails = [
  "seefathimel1@gmail.com",
  "himel.bs23@gmail.com",
  "dipubala.bs23@gmail.com",
  "dipubala466@gmail.com",
  "sudipta@timetackle.com",
  "dipankar.bala@brainstation-23.com",
  "rizwanur.rahman17@gmail.com",
  "abdullahxaied@gmail.com",
  "belal.cseai@gmail.com",
  "dinar@timetackle.com",
  "shakil@timetackle.com",
];
