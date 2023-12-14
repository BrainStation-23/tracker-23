import ProgressComponent from "./progressComponent";
import SprintReportTabel from "./sprintReportTable";

const SprintReportComponent = ({ data = data2 }: any) => {
  const modifiedData = data2.data.flatMap((record) => {
    const len = record.users.length;

    const devidedByUser: any = record.users.map((user: any, index: any) => ({
      ...user,
      key: user.id,
      date: record.date,
      name: user.name,
      sprintAssignedTasks: user.assignedTasks,
      yesterdayTasks: user.yesterdayTasks,
      todayTasks: user.todayTasks,
      dateColSpan: index > 0 ? 0 : len,
    }));

    const uptoTasks: any = [];
    for (let d of devidedByUser) {
      console.log(
        "🚀 ~ file: sprintReportComponents.tsx:20 ~ modifiedData ~ d:",
        d,
        Math.max(d.assassignedTasks?.length + 1, d.yesterdayTasks?.length),
        d?.todayTasks.length,
        d.assignedTasks.length,
        typeof d.yesterdayTasks?.length
      );
      const mx = Math.max(
        Math.max(d.assignedTasks?.length, d.yesterdayTasks?.length),
        d?.todayTasks.length
      );
      console.log(
        "🚀 ~ file: sprintReportComponents.tsx:24 ~ modifiedData ~ mx:",
        mx
      );
      uptoTasks.push({
        ...d,
        userSpan: mx + 1,
        assignedTask: null,
        todayTask: null,
        yesterdayTask: null,
      });
      for (let i = 0; i < mx; i++) {
        uptoTasks.push({
          ...d,
          userSpan: 0,
          assignedTask: d.assignedTasks[i],
          todayTask: d.todayTasks[i],
          yesterdayTask: d.yesterdayTasks[i],
        });
      }
    }

    console.log(
      "🚀 ~ file: sprintReportComponents.tsx:19 ~ modifiedData ~ uptoTasks:",
      uptoTasks
    );

    const final = [];

    const dateSpans: any = {};

    for (let d of uptoTasks) {
      let dateSpan = 0;
      if (typeof dateSpans[d.date] !== "number") {
        const filteredUsers = uptoTasks.filter(
          (t: any) => t.date === d.date && d.userSpan > 0
        );
        for (let tt of filteredUsers) dateSpan += tt.userSpan;
        dateSpans[d.date] = dateSpan;
      }
      final.push({ ...d, dateColSpan: dateSpan });
    }
    console.log(
      "🚀 ~ file: sprintReportComponents.tsx:60 ~ modifiedData ~ final:",
      final
    );
    return final;
  });
  console.log(
    "🚀 ~ file: sprintReportComponents.tsx:14 ~ SprintReportComponent ~ modifiedData:",
    modifiedData
  );
  return (
    <div className="flex w-full flex-col gap-5">
      <ProgressComponent
        done={data?.sprintInfo?.done}
        total={data?.sprintInfo?.total}
      />

      <SprintReportTabel data={modifiedData} />
    </div>
  );
};

export default SprintReportComponent;

const data2 = {
  data: [
    {
      date: "2023-12-05T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-06T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-07T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-08T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-09T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-10T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 2,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 1,
            done: 0,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [],
        },
      ],
    },
    {
      date: "2023-12-11T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 10,
            done: 0,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title:
                "Fix Report Page API calling System (Call API with tab change)",
              key: "T23-512",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint 8 Planning",
              key: "T23-511",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint 8 Deploy",
              key: "T23-510",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI R&D",
              key: "T23-509",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report API Integration",
              key: "T23-508",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI",
              key: "T23-507",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Himel",
              key: "T23-503",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Report page tables - Fill with blank columns",
              key: "T23-500",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [
            {
              title: "Sprint 8 Planning",
              key: "T23-511",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI R&D",
              key: "T23-509",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Himel",
              key: "T23-503",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 5,
            done: 2,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report API",
              key: "T23-506",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "Fix Invitation System (BE)",
              key: "T23-504",
              status: "Done",
              statusCategoryName: "DONE",
            },
            {
              title: "Bala",
              key: "T23-502",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "BE: Sprint update in sync call",
              key: "T23-513",
              status: "Done",
              statusCategoryName: "DONE",
            },
          ],
          yesterdayTasks: [],
          todayTasks: [
            {
              title: "Bala",
              key: "T23-502",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "BE: Sprint update in sync call",
              key: "T23-513",
              status: "Done",
              statusCategoryName: "DONE",
            },
          ],
        },
      ],
    },
    {
      date: "2023-12-12T06:13:56.397Z",
      users: [
        {
          userId: 1,
          name: "Seefat Hossain",
          picture:
            "https://lh3.googleusercontent.com/a/ACg8ocIRa3eRL0BE_RxKcrFhEK35Y8V4LApwg06PJFBU7EIP5WY=s96-c",
          devProgress: {
            total: 12,
            done: 5,
          },
          assignedTasks: [
            {
              title: "FE : API Integration",
              key: "T23-408",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "FE : UI ",
              key: "T23-407",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title:
                "Fix Report Page API calling System (Call API with tab change)",
              key: "T23-512",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint 8 Planning",
              key: "T23-511",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint 8 Deploy",
              key: "T23-510",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI R&D",
              key: "T23-509",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report API Integration",
              key: "T23-508",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI",
              key: "T23-507",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Himel",
              key: "T23-503",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Report page tables - Fill with blank columns",
              key: "T23-500",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "User Onboarding system R&D",
              key: "T23-515",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI Planning ",
              key: "T23-514",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
          ],
          yesterdayTasks: [
            {
              title: "Sprint 8 Planning",
              key: "T23-511",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI R&D",
              key: "T23-509",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Himel",
              key: "T23-503",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "User Onboarding system R&D",
              key: "T23-515",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
          ],
          todayTasks: [
            {
              title: "Himel",
              key: "T23-503",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report UI Planning ",
              key: "T23-514",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
          ],
        },
        {
          userId: 25,
          name: "Dipu Bala",
          picture: null,
          devProgress: {
            total: 5,
            done: 2,
          },
          assignedTasks: [
            {
              title: "BE : Related API ",
              key: "T23-409",
              status: "To Do",
              statusCategoryName: "TO_DO",
            },
            {
              title: "Sprint view report API",
              key: "T23-506",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "Fix Invitation System (BE)",
              key: "T23-504",
              status: "Done",
              statusCategoryName: "DONE",
            },
            {
              title: "Bala",
              key: "T23-502",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "BE: Sprint update in sync call",
              key: "T23-513",
              status: "Done",
              statusCategoryName: "DONE",
            },
          ],
          yesterdayTasks: [
            {
              title: "Bala",
              key: "T23-502",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "BE: Sprint update in sync call",
              key: "T23-513",
              status: "Done",
              statusCategoryName: "DONE",
            },
          ],
          todayTasks: [
            {
              title: "Sprint view report API",
              key: "T23-506",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
            {
              title: "Fix Invitation System (BE)",
              key: "T23-504",
              status: "Done",
              statusCategoryName: "DONE",
            },
            {
              title: "Bala",
              key: "T23-502",
              status: "In Progress",
              statusCategoryName: "IN_PROGRESS",
            },
          ],
        },
      ],
    },
  ],
  sprintInfo: {
    name: "TT2 Sprint 8",
    projectName: "Tracker 23",
    total: 20,
    done: 2,
  },
};
