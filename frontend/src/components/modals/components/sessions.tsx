import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import EditIconSvg from "@/assets/svg/EditIconSvg";
import {
  formatDate,
  getFormattedShortTime,
  getFormattedTime,
  getFormattedTotalTime,
} from "@/services/timeActions";

type Props = {
  taskDetails: any;
  deleteSession: Function;
};

const Sessions = ({ taskDetails, deleteSession }: Props) => {
  const endedSessions = taskDetails?.sessions?.filter(
    (session: any) => session.endTime
  );
  const currentSessions = taskDetails?.sessions?.filter(
    (session: any) => !session.endTime
  );

  return (
    <>
      <h3 className="w-full  text-left text-base font-semibold">Sessions</h3>
      <div className="flex max-h-64 w-full flex-col gap-3 overflow-y-scroll">
        {endedSessions?.length > 0 && (
          <div className="grid grid-cols-12 gap-4 font-semibold">
            <span className="col-span-1">No</span>
            <span className="col-span-3">Date</span>
            <span className="col-span-3">Time Stamp</span>
            <span className="col-span-3">Hours</span>
          </div>
        )}
        {endedSessions?.map((session: any, index: number) => {
          const startTime: any = formatDate(session.startTime);
          const endTime: any = formatDate(session.endTime);

          const totalTime = getFormattedTotalTime(endTime - startTime);
          return (
            <div
              className="grid grid-cols-12 gap-4 text-sm font-medium"
              key={session.id}
            >
              <span className="col-span-1 font-semibold">#{index + 1}</span>
              <span className="col-span-3">{` ${getFormattedTime(
                startTime
              )}`}</span>
              <span className="col-span-3">
                {`${getFormattedShortTime(startTime)} `} -
                {` ${getFormattedShortTime(endTime)}`}
              </span>
              <span className="col-span-3">
                {" "}
                {getFormattedTotalTime(endTime - startTime)}
              </span>
              <span className="col-span-2 mr-3 flex items-center justify-end gap-2">
                <div>
                  {" "}
                  <EditIconSvg />
                </div>
                <div onClick={() => deleteSession(session.id)}>
                  <DeleteIconSvg />
                </div>
              </span>
            </div>
          );
        })}
      </div>
      {currentSessions?.map((session: any, index: number) => {
        const startTime = formatDate(session.startTime);
        return (
          <div className="w-full" key={session.id}>
            <p className="w-full  text-left text-base font-semibold">
              Current Session
            </p>
            <div className="grid grid-cols-4 gap-4 font-semibold">
              <span>No</span>
              <span>Date</span>
              <span>Time Stamp</span>
              <div>Hours</div>
            </div>
            <div
              className="grid grid-cols-4 gap-4 text-sm font-medium"
              key={session.id}
            >
              <span className="font-semibold">#{1}</span>
              <span>{` ${getFormattedTime(startTime)}`}</span>
              <span>{`${getFormattedShortTime(startTime)} `} -</span>
              {/* <div> {getFormattedTotalTime(endTime - startTime)}</div> */}
            </div>
          </div>
        );
      })}
    </>
  );
};

export default Sessions;
