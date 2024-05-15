import dayjs from "dayjs";
import { TaskDto } from "models/tasks";
import { DatePicker, Form, TimePicker, Tooltip } from "antd";

import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import EditIconSvg from "@/assets/svg/EditIconSvg";
import {
  formatDate,
  getFormattedTime,
  getFormattedShortTime,
  getFormattedTotalTime,
} from "@/services/timeActions";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import { useState } from "react";
import { useMediaQuery } from "react-responsive";

type Props = {
  taskDetails: TaskDto;
  deleteSession: Function;
  updateSession: Function;
  SetSpinning: Function;
};

const Sessions = ({
  taskDetails,
  deleteSession,
  updateSession,
  SetSpinning,
}: Props) => {
  const [form] = Form.useForm();
  const isMobile = useMediaQuery({ maxWidth: 767 });

  taskDetails.sessions.sort(
    (a, b) =>
      formatDate(b.startTime).getTime() - formatDate(a.startTime).getTime()
  );
  const endedSessions = taskDetails?.sessions?.filter(
    (session: any) => session.endTime
  );
  const currentSessions = taskDetails?.sessions?.filter(
    (session: any) => !session.endTime
  );
  const [sessionInEdit, setSessionInEdit] = useState(null);
  const onFinish = async (values: any) => {
    SetSpinning(true);
    (await updateSession(sessionInEdit, values)) && setSessionInEdit(null);
    SetSpinning(false);
  };

  const handleInitialValues = (session: any) => {
    setSessionInEdit(session.id);
    form.setFieldsValue({ date: dayjs(session.startTime) });
    form.setFieldsValue({
      time: [dayjs(session.startTime), dayjs(session.endTime)],
    });
  };

  return (
    <>
      <h3 className="w-full  text-left text-base font-semibold">Sessions</h3>
      <div className="flex max-h-64 w-full flex-col gap-2">
        {endedSessions?.length > 0 && (
          <div className="grid grid-cols-12 gap-2 font-semibold text-secondary md:gap-4">
            <div className="col-span-1">No</div>
            <div className="col-span-3 text-center">Date</div>
            <div className="col-span-4 text-center">Time Stamp</div>
            <div className="col-span-2 text-center">Hours</div>
          </div>
        )}
        {endedSessions?.map((session: any, index: number) => {
          const startTime: any = formatDate(session.startTime);
          const endTime: any = formatDate(session.endTime);

          return (
            <Form key={session.id} form={form} onFinish={onFinish}>
              <div
                className="grid grid-cols-12 gap-0.5 text-sm font-medium md:gap-4"
                key={session.id}
              >
                <div className="col-span-1 my-auto font-semibold">
                  #{index + 1}
                </div>
                <div className="col-span-3 my-auto text-center">
                  {session.id !== sessionInEdit ? (
                    `  ${
                      isMobile
                        ? new Date(startTime).toLocaleDateString()
                        : getFormattedTime(startTime)
                    }`
                  ) : (
                    <>
                      <Form.Item
                        name="date"
                        className="mb-0"
                        rules={[{ required: true }]}
                      >
                        <DatePicker className="w-full" />
                      </Form.Item>
                    </>
                  )}
                </div>
                <div className="col-span-4 my-auto text-center">
                  {session.id !== sessionInEdit ? (
                    <>
                      {`${getFormattedShortTime(startTime)} `} -
                      {` ${getFormattedShortTime(endTime)}`}
                    </>
                  ) : (
                    <div>
                      <Form.Item
                        name="time"
                        className="mb-0"
                        rules={[{ required: true }]}
                      >
                        <TimePicker.RangePicker
                          format={"hh:mm a"}
                          className="w-full"
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
                <div className="col-span-2 my-auto text-center">
                  {getFormattedTotalTime(endTime - startTime)}
                </div>
                <div className="col-span-2 flex items-center justify-end gap-2">
                  {taskDetails.userWorkspaceId === session.userWorkspaceId ? (
                    session.id !== sessionInEdit ? (
                      <>
                        <Tooltip title="Edit Session">
                          <div
                            onClick={() => handleInitialValues(session)}
                            className="cursor-pointer"
                          >
                            <EditIconSvg />
                          </div>
                        </Tooltip>

                        <Tooltip title="Delete Session">
                          <div
                            onClick={() => deleteSession(session.id)}
                            className="cursor-pointer"
                          >
                            <DeleteIconSvg />
                          </div>
                        </Tooltip>
                      </>
                    ) : (
                      <div className="col-span-2 flex items-center justify-end gap-3">
                        <Tooltip title="Save">
                          <button type="submit" className="m-0 h-min p-0">
                            <CheckCircleOutlined
                              style={{
                                fontSize: "20px",
                                color: "#00A3DE",
                              }}
                            />
                          </button>
                        </Tooltip>
                        <Tooltip title="Cancel">
                          <button
                            type="submit"
                            className="m-0 h-min p-0"
                            onClick={() => setSessionInEdit(null)}
                          >
                            <CloseCircleOutlined
                              style={{
                                fontSize: "20px",
                                color: "#F26956",
                              }}
                            />
                          </button>
                        </Tooltip>
                      </div>
                    )
                  ) : (
                    "Not Yours"
                  )}
                </div>
              </div>
            </Form>
          );
        })}
      </div>
      {currentSessions?.map((session: any) => {
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
