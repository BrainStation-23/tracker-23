import React, { useContext, useEffect, useState } from "react";
import DisplayComponent from "./Components/DisplayComponent";
import { getTotalSpentTime } from "@/services/timeActions";
import { TaskContext } from "@/pages/taskList";
import { TaskDto } from "models/tasks";

type Props = {
  task: TaskDto;
  addSession: any;
  addEndTime: any;
};

function StopWatchTabular({ task }: Props) {
  const { sessions } = task;
  const { runningTask } = useContext(TaskContext);
  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [sessionTime, setSessionTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [status, setStatus] = useState<any>(0);
  const [resumeTime, setResumeTime] = useState<boolean>(false);

  let updatedMs = time.ms,
    updatedS = time.s,
    updatedM = time.m,
    updatedH = time.h;

  let updatedSessionMs = sessionTime.ms,
    updatedSessionS = sessionTime.s,
    updatedSessionM = sessionTime.m,
    updatedSessionH = sessionTime.h;

  const run = () => {
    if (updatedM >= 60) {
      updatedH++;
      updatedM = 0;
    }
    if (updatedS >= 60) {
      updatedM++;
      updatedS = 0;
    }
    if (updatedMs >= 10) {
      updatedS++;
      updatedMs = 0;
    }
    updatedMs++;
    setTime({ ms: updatedMs, s: updatedS, m: updatedM, h: updatedH });
    if (updatedSessionM >= 60) {
      updatedSessionH++;
      updatedSessionM = 0;
    }
    if (updatedSessionS >= 60) {
      updatedSessionM++;
      updatedSessionS = 0;
    }
    if (updatedSessionMs >= 10) {
      updatedSessionS++;
      updatedSessionMs = 0;
    }
    updatedSessionMs++;
    setSessionTime({
      ms: updatedSessionMs,
      s: updatedSessionS,
      m: updatedSessionM,
      h: updatedSessionH,
    });
  };

  const stop = () => {
    setStatus(2);
  };

  const resumeTimeFunction = () => {
    run();
    setStatus(1);
  };
  useEffect(() => {
    const initialTime = { ms: 0, s: 0, m: 0, h: 0 };
    let totalTime: number = getTotalSpentTime(sessions);
    if (totalTime > 0) {
      initialTime.ms += totalTime % 1000;
      totalTime = Math.floor(totalTime / 1000);
      if (totalTime > 0) {
        initialTime.s += totalTime % 60;
        totalTime = Math.floor(totalTime / 60);
        if (totalTime > 0) {
          initialTime.m += totalTime % 60;
          totalTime = Math.floor(totalTime / 60);
          if (totalTime > 0) {
            initialTime.h += totalTime;
          }
        }
      }
    }
    setTime(initialTime);
    setSessionTime(initialTime);

    sessions?.forEach((session: any) => {
      if (session.startTime && !session.endTime) {
        const initialTime = { ms: 0, s: 0, m: 0, h: 0 };
        const sessionStartTime: any = new Date(session.startTime);
        let totalTime: number = Date.now() - sessionStartTime;
        const totalSpentTime = getTotalSpentTime(sessions);
        if (totalSpentTime) totalTime += totalSpentTime;
        if (totalTime > 0) {
          initialTime.ms += totalTime % 1000;
          totalTime = Math.floor(totalTime / 1000);
          if (totalTime > 0) {
            initialTime.s += totalTime % 60;
            totalTime = Math.floor(totalTime / 60);
            if (totalTime > 0) {
              initialTime.m += totalTime % 60;
              totalTime = Math.floor(totalTime / 60);
              if (totalTime > 0) {
                initialTime.h += totalTime;
              }
            }
          }
        }
        setSessionTime(initialTime);
        setResumeTime(true);
      }
    });
  }, []);

  useEffect(() => {
    if (resumeTime) resumeTimeFunction();
  }, [resumeTime]);

  useEffect(() => {
    if (status) {
      if (!task.sessions) task.sessions = [];
      if (runningTask && runningTask.id !== task.id) {
        if (task.sessions[task.sessions.length - 1]?.status === "STARTED")
          stop();
      }
      if (
        !runningTask &&
        task.sessions[task.sessions.length - 1]?.status === "STOPPED"
      )
        stop();
      if (
        runningTask &&
        runningTask.id === task.id &&
        task.sessions[task.sessions.length - 1]?.status === "STARTED"
      )
        resumeTimeFunction();
    }
  }, [runningTask]);

  return (
    <div className="col-span-4 mx-auto grid w-40 grid-cols-6 items-center">
      <div className="col-span-5 flex flex-col gap-2 text-center">
        <DisplayComponent time={time} sessionTime={sessionTime} />
      </div>
    </div>
  );
}

export default StopWatchTabular;
