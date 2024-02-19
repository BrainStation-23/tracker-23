import { Button, Spin } from "antd";
import { TaskDto } from "models/tasks";

type Props = {
  runningTask: TaskDto;
  warningData: TaskDto;
  handleWarningClick: Function;
};

const SessionStartWarning = ({
  runningTask,
  warningData,
  handleWarningClick,
}: Props) => {
  const spin = false;
  return (
    <>
      {spin ? (
        <div className=" mx-auto flex h-60 w-20 flex-col justify-center">
          <Spin tip="Working" size="large">
            <div className="content" />
          </Spin>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-12">
          <div>
            <span className="font-bold">{runningTask?.title}</span> is still
            Running
          </div>
          <div>
            Do you want to stop{" "}
            <span className="font-bold">{runningTask?.title}</span> and start{" "}
            <span className="font-bold">{warningData?.title}</span>?
          </div>
          <div className="flex w-40 justify-between">
            <Button
              onClick={() => {
                handleWarningClick(true);
              }}
            >
              Yes
            </Button>
            <Button
              danger
              onClick={() => {
                handleWarningClick(false);
              }}
            >
              no
            </Button>
          </div>
        </div>
      )}
    </>
  );
};

export default SessionStartWarning;
