import React, { useEffect, useState } from "react";
import DisplayComponent from "./Components/DisplayComponent";
import BtnComponent from "./Components/BtnComponent";
import { userAPI } from "APIs";
import { getTotalSpentTime } from "@/services/timeActions";
import { toast } from "react-toastify";
import { message } from "antd";

function StopWatch({ task, addSession, addEndTime, disable }: any) {
  const { sessions } = task;

  const [time, setTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [sessionTime, setSessionTime] = useState({ ms: 0, s: 0, m: 0, h: 0 });
  const [interv, setInterv] = useState<any>();
  const [status, setStatus] = useState<any>(0);
  const [resumeTime, setResumeTime] = useState<boolean>(false);

  const startSession = async () => {
    console.log("start");
    const res = await userAPI.createSession(task.id);
    res && addSession(res);
    res && message.success("Session Started");
    console.log("🚀 ~ file: reactStopWatch.tsx:19 ~ startSession ~ res", res);
  };
  const stopSession = async () => {
    console.log("stop");
    const res = await userAPI.stopSession(task.id);
    res && addEndTime(res);
    res && message.success("Session Ended");
    console.log("🚀 ~ file: reactStopWatch.tsx:19 ~ startSession ~ res", res);
  };

  const start = async () => {
    startSession();
    // setSessionTime({ ms: 0, s: 0, m: 0, h: 0 });
    (updatedSessionMs = sessionTime.ms),
      (updatedSessionS = sessionTime.s),
      (updatedSessionM = sessionTime.m),
      (updatedSessionH = sessionTime.h);
    run();
    setStatus(1);
    setInterv(setInterval(run, 100));
  };
  // console.log(time);
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
    const res = clearInterval(interv);
    setStatus(2);
  };

  const reset = () => {
    clearInterval(interv);
    setStatus(0);
    setTime({ ms: 0, s: 0, m: 0, h: 0 });
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
    setSessionTime(initialTime);
    // console.log(
    //   "🚀 ~ file: reactStopWatch.tsx:122 ~ useEffect ~ initialTime",
    //   initialTime
    // );

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  useEffect(() => {
    if (resumeTime) resumeTimeFunction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resumeTime]);

  return (
    <div className="grid grid-cols-6 w-44 mx-auto">
      <DisplayComponent time={time} sessionTime={sessionTime} />
      {!disable && (
        <BtnComponent
          status={status}
          resume={resume}
          reset={reset}
          stop={stop}
          start={start}
          id={task.id}
          disable={disable}
        />
      )}
    </div>
  );
}

export default StopWatch;
