import React, { useContext, useEffect, useState } from "react";
import DisplayComponent from "./Components/DisplayComponent";
import BtnComponent from "./Components/BtnComponent";
import { getTotalSpentTime } from "@/services/timeActions";
import { TaskContext } from "@/components/tasks";

function ReactStopWatchCopy({ task }: any) {
  const { sessions } = task;

  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [sessionTime, setSessionTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [interv, setInterv] = useState<any>();
  const [status, setStatus] = useState<any>(0);
  const [resumeTime, setResumeTime] = useState<boolean>(false);
  const { runningTask } = useContext(TaskContext);

  const startSession = async () => {
    console.log("start");
  };
  const stopSession = async () => {
    console.log("stop");
  };

  const start = async () => {
    startSession();
    setSessionTime({ ms: 0, s: 0, m: 0, h: 0 });
    (updatedSessionMs = 0),
      (updatedSessionS = 0),
      (updatedSessionM = 0),
      (updatedSessionH = 0);
    run();
    setStatus(1);
    setInterv(setInterval(run, 100));
  };
  var updatedMs = time.ms,
    updatedS = time.s,
    updatedM = time.m,
    updatedH = time.h;

  var updatedSessionMs = sessionTime.ms,
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
    stopSession();
    setStatus(2);
  };

  const reset = () => {
    clearInterval(interv);
    setStatus(0);
  };

  const resume = () => start();
  const resumeTimeFunction = () => {
    run();
    setStatus(1);
    setInterv(setInterval(run, 100));
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

    sessions?.forEach((session: any) => {
      if (session.startTime && !session.endTime) {
        const initialTime = { ms: 0, s: 0, m: 0, h: 0 };

        const sessionStartTime: any = new Date(session.startTime);

        let totalTime: number = Date.now() - sessionStartTime;
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
    if (runningTask?.id !== task.id) {
      reset();
    } else if (resumeTime) resumeTimeFunction();
  }, [resumeTime, task]);

  return (
    <div className="mx-auto flex w-min flex-col">
      <DisplayComponent time={time} sessionTime={sessionTime} />
      <div className="mx-auto w-min py-6">
        <BtnComponent
          status={status}
          resume={resume}
          reset={reset}
          stop={stop}
          start={start}
          id={task.id}
        />
      </div>
    </div>
  );
}

export default ReactStopWatchCopy;
