import { DatePicker, Form, TimePicker, Tooltip } from "antd";
import dayjs from "dayjs";
import { useEffect, useState } from "react";

import DeleteIconSvg from "@/assets/svg/DeleteIconSvg";
import EditIconSvg from "@/assets/svg/EditIconSvg";
import {
  formatDate,
  getFormattedShortTime,
  getFormattedTime,
  getFormattedTotalTime,
} from "@/services/timeActions";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";

type Props = {
  taskDetails: any;
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
  const endedSessions = taskDetails?.sessions?.filter(
    (session: any) => session.endTime
  );
  const currentSessions = taskDetails?.sessions?.filter(
    (session: any) => !session.endTime
  );
  const [sessionInEdit, setSessionInEdit] = useState(null);
  const onFinish = async (values: any) => {
    SetSpinning(true);
    console.log(values);
    (await updateSession(sessionInEdit, values)) && setSessionInEdit(null);
    SetSpinning(false);
  };

  const onReset = () => {
    form.resetFields();
  };
  const [initialValues, setInitialValues] = useState<any>();
  const handleInitialValues = (session: any) => {
    setSessionInEdit(session.id);
    form.setFieldsValue({ date: dayjs(session.startTime) });
    form.setFieldsValue({
      time: [dayjs(session.startTime), dayjs(session.endTime)],
    });
    // setInitialValues({
    //   date: dayjs(new Date(session.startTime)),
    //   time: [new Date(session.startTime), new Date(session.startTime)],
    // });
  };
  useEffect(() => {}, [initialValues]);
  return (
    <>
      <h3 className="w-full  text-left text-base font-semibold">Sessions</h3>
      <div className="flex max-h-64 w-full flex-col gap-3 overflow-y-scroll">
        {endedSessions?.length > 0 && (
          <div className="grid grid-cols-12 gap-4 font-semibold">
            <div className="col-span-1">No</div>
            <div className="col-span-3">Date</div>
            <div className="col-span-4">Time Stamp</div>
            <div className="col-span-2">Hours</div>
          </div>
        )}
        {endedSessions?.map((session: any, index: number) => {
          const startTime: any = formatDate(session.startTime);
          const endTime: any = formatDate(session.endTime);

          const totalTime = getFormattedTotalTime(endTime - startTime);

          return (
            <Form
              form={form}
              // name="control-hooks"
              onFinish={onFinish}
              // initialValues={{
              //   date: dayjs(new Date(session.startTime)),
              //   time: [
              //     dayjs(new Date(session.startTime)),
              //     dayjs(new Date(session.endTime)),
              //   ],
              // }}
              // style={{ width: "500px" }}
            >
              {" "}
              <div
                className="grid grid-cols-12 gap-4 text-sm font-medium"
                key={session.id}
              >
                <div className="col-span-1 font-semibold">#{index + 1}</div>
                <div className="col-span-3">
                  {session.id !== sessionInEdit ? (
                    ` ${getFormattedTime(startTime)}`
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
                <div className="col-span-4">
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
                          format={"HH:mm"}
                          className="w-full"
                        />
                      </Form.Item>
                    </div>
                  )}
                </div>
                <div className="col-span-2">
                  {" "}
                  {getFormattedTotalTime(endTime - startTime)}
                </div>
                <div className="col-span-2 mr-3 flex items-center justify-end gap-2">
                  {session.id !== sessionInEdit ? (
                    <>
                      <Tooltip title="Edit Session">
                        <div onClick={() => handleInitialValues(session)}>
                          <EditIconSvg />
                        </div>
                      </Tooltip>

                      <Tooltip title="Delete Session">
                        <div onClick={() => deleteSession(session.id)}>
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
                  )}
                </div>
              </div>
            </Form>
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
