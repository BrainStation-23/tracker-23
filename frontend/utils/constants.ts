import SecondaryButton from "../src/components/common/buttons/secondaryButton";

export const publicRoutes = [
  "/login",
  "/registration",
  "/socialLogin/redirect",
  "/forgotPassword",
  "/resetPassword",
  "/inviteLink",
  // "/images",
];
export const ignoreRoutes = [
  "/_next",
  "/assets",
  "/integrations",
  "/images",
  "/inviteLink",
];
export const noNavbar = ["/taskList"];
export const menuOptions = [
  { link: "/taskList", title: "Tasks Page" },
  // { link: "/dashboard", title: "Dashboard Page" },
  // { link: "/integrations", title: "Integrations Page" },
  // { link: "/onBoarding", title: "OnBoarding Page" },
];

export const SecondaryColor = "#E0E0E0";

export enum progressColorEnum {
  IN_PROGRESS = "#85C6DB",
  TO_DO = "#0099ff",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export const taskStatusEnum = {
  IN_PROGRESS: "In progress",
  TO_DO: "To do",
  DONE: "Done",
};

export enum statusBorderColorEnum {
  IN_PROGRESS = "#56A2E9",
  TO_DO = "#ADACB0",
  DONE = "#BADF4F",
  BG = "#ECECED",
}
export enum statusBGColorEnum {
  IN_PROGRESS = "#E4F2FF",
  TO_DO = "#F9F9F9",
  DONE = "#FAFFEA",
  BG = "#ECECED",
}
export const taskPriorityEnum = {
  HIGHEST: "Highest",
  HIGH: "High",
  LOW: "Low",
  MEDIUM: "Medium",
  NORMAL: "Medium",
};
export enum PriorityBGColorEnum {
  HIGHEST = "#FFF0ED",
  HIGH = "#FFF0ED",
  LOW = "#FFF9E2",
  MEDIUM = "#FFF4E8",
  NORMAL = "#FFF4E8",
}
export enum PriorityBorderColorEnum {
  HIGHEST = "#FE8A6F",
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

export const supportedIntegrations = ["JIRA", "OUTLOOK"];
export const allIntegrations = ["JIRA", "OUTLOOK", "TRELLO"];

export enum IntegrationTitlesEnum {
  JIRA = "Jira Software",
  TRELLO = "Trello",
}

export enum IntegrationDescriptionsEnum {
  JIRA = "Connect JIRA tickets to your WorkSpace",
  TRELLO = "Connect Trello to your WorkSpace",
  OUTLOOK = "Connect Outlook to your WorkSpace",
  TRACKER23 = "Connect Tracker 23 to your WorkSpace",
}

export const outlookSourceUrl = "https://outlook.office.com/calendar/view";

export enum Roles {
  USER = "USER",
  ADMIN = "ADMIN",
}

export const whiteListEmails = [
  "seefathimel1@gmail.com",
  "seefathimel8@gmail.com",
  "test@gmail.com",
  "himel.bs23@gmail.com",
  "dipubala.bs23@gmail.com",
  "dipubala466@gmail.com",
  "dipubala46@gmail.com",
  "sudipta@timetackle.com",
  "dipankar.bala@brainstation-23.com",
  "rizwanur.rahman17@gmail.com",
  "abdullahxaied@gmail.com",
  "belal.cseai@gmail.com",
  "dinar@timetackle.com",
  "shakil@timetackle.com",
  "shatabdibiswasswarna@gmail.com",
  "ismail.hosen@brainstation-23.com",
  "belal.cseai@gmail.com",
  "belal.hossain@brainstation-23.com",
  "rezve.hasan@brainstation-23.com",
  "anjarul.islam@brainstation-23.com",
  "ismail.hosen@brainstation-23.com",
  "rakib@brainstation-23.com",
  "shaishab.roy@brainstation-23.com",
  "diptonil.singho@brainstation-23.com",
  "zeeshan.ahmed@brainstation-23.com",
  "katha@brainstation-23.com",
  "ayman.wasif@brainstation-23.com",
  "maria.sultana@brainstation-23.com",
  "saikee.siddique@brainstation-23.com",
  "mahmudul@brainstation23.com",
  "kaiser.rahman@brainstation23.com",
  "shakib.chowdhury@brainstation-23.com",
  "tasneem.arif@brainstation-23.com",
  "mobarak.hossain@brainstation-23.com",
  "nazmus.sakib@brainstation-23.com",
  "safin.ridhwan@brainstation-23.com",
  "naveed.abrar@brainstation-23.com",
  "samiul.alim@brainstation-23.com",
  "manosh@brainstation-23.com",
  "shamsul.tahsin@brainstation-23.com",
  "dumyshala420@gmail.com",
  "tracker23.team@gmail.com",
  "dipankar47@student.sust.edu",
];

export const colorPairs = [
  // Visually appealing colors
  // { background: "#82e0aa", color: "#333333" }, // Mint Green
  { background: "#a2c4c9", color: "#333333" }, // Silver Blue
  { background: "#e59866", color: "#333333" }, // Dark Salmon
  { background: "#f5cba7", color: "#333333" }, // Light Apricot
  { background: "#a9dfbf", color: "#333333" }, // Pastel Green
  { background: "#d4a5a5", color: "#333333" }, // Misty Rose
  { background: "#b3b6b7", color: "#333333" }, // Silver
  { background: "#f0b27a", color: "#333333" }, // Pumpkin
  { background: "#48c9b0", color: "#333333" }, // Medium Turquoise
  { background: "#d6dbdf", color: "#333333" }, // Iron

  // Additional colors
  { background: "#2ecc71", color: "#333333" }, // Emerald Green
  { background: "#3498db", color: "#333333" }, // Dodger Blue
  { background: "#e74c3c", color: "#333333" }, // Alizarin Red
  { background: "#f39c12", color: "#333333" }, // Orange
  { background: "#1abc9c", color: "#333333" }, // Turquoise
  { background: "#9b59b6", color: "#333333" }, // Amethyst Purple
  { background: "#34495e", color: "#333333" }, // Wet Asphalt
  { background: "#e67e22", color: "#333333" }, // Carrot Orange
  { background: "#16a085", color: "#333333" }, // Green Sea
  { background: "#95a5a6", color: "#333333" }, // Concrete Gray

  // ... (continue adding more pairs)

  // Earthy tones
  { background: "#d2b4a9", color: "#333333" }, // Dusty Rose
  { background: "#bedbbb", color: "#333333" }, // Pale Aqua
  { background: "#b0a99d", color: "#333333" }, // Rosy Brown
  { background: "#d0ccd0", color: "#333333" }, // Languid Lavender
  { background: "#a0b3c5", color: "#333333" }, // Light Slate Gray
  { background: "#8dd2c2", color: "#333333" }, // Opal
  { background: "#9fc5e8", color: "#333333" }, // Periwinkle
  { background: "#c98576", color: "#333333" }, // Antique Ruby
  { background: "#82c3b2", color: "#333333" }, // Ocean Mist
  { background: "#93b5e1", color: "#333333" }, // Cornflower Blue

  // ... (continue adding more pairs)

  // Neutral tones
  { background: "#f0f8ff", color: "#333333" }, // Alice Blue
  { background: "#f5f5f5", color: "#333333" }, // White Smoke
  { background: "#f8f8ff", color: "#333333" }, // Ghost White
  { background: "#f0f8ff", color: "#333333" }, // Alice Blue
  { background: "#f5f5f5", color: "#333333" }, // White Smoke
  { background: "#f8f8ff", color: "#333333" }, // Ghost White
  { background: "#f5f5dc", color: "#333333" }, // Beige
  { background: "#f0e68c", color: "#333333" }, // Khaki
  { background: "#dcdcdc", color: "#333333" }, // Gainsboro
  { background: "#d3d3d3", color: "#333333" }, // Light Gray

  // ... (continue adding more pairs)
];

export const rowColors = [
  { background: "#6ba9ff", text: "#333333" }, // Amethyst Purple
  { background: "#3498db", color: "#333333" }, // Dodger Blue
];

