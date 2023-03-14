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
    time.m = checkTime(time.m);
    time.s = checkTime(time.s);
    setTime({ ...time });
    setTimeout(startTime, 1000);
  }

  function checkTime(i: any) {
    if (i < 10) {
      i = "0" + i;
    } // add zero in front of numbers < 10
    return i;
  }
  useEffect(() => {
    startTime();
  }, []);
  useEffect(() => {}, [time]);
  return (
    <div className="fixed right-0 bottom-0 pr-2 font-bold">
      Current Time:{" "}
      {`${time.h % 12}:${time.m}:${time.s} ${time.h > 12 ? "pm" : "am"}`}
    </div>
  );
};

export default GlobalClock;
