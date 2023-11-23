export type getTimeSheetReportDto = {
    startDate?: any;
    endDate?: any;
    userIds?: any;
};

type SprintUserData = {
    estimation: number;
    timeSpent: number;
};
export type SprintData = {
    sprintId: number;
    name: string;
} & Record<string, any>;

export type SprintTableData = {
    columns: string[];
    rows: SprintData[];
};
