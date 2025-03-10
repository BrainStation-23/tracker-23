import { useEffect, useState } from "react";

const GlobalClock = () => {
  const [time, setTime] = useState({
    h: 0,
    m: 0,
    s: 0,
  });
  function startTime() {
    const today = new Date();
    time.h = today.getHours();
    time.m = today.getMinutes();
    time.s = today.getSeconds();
    time.h = checkTime(time.h);
    time.m = checkTime(time.m);
    time.s = checkTime(time.s);
    setTime({ ...time });
    setTimeout(startTime, 1000);
  }

  function checkTime(i: any) {
    if (i < 10) {
      i = "0" + i;
    }
    return i;
  }
  useEffect(() => {
    startTime();
  }, []);
  useEffect(() => {}, [time]);
  return (
    <div className="fixed left-0 bottom-3 pl-5 font-bold">
      Current Time:{" "}
      {`${checkTime(time.h % 12 === 0 ? 12 : time.h % 12)}:${time.m}:${
        time.s
      } ${time.h >= 12 && time.h < 24 ? "pm" : "am"}`}
    </div>
  );
};

export default GlobalClock;
