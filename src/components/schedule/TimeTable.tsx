import { useState } from "react";
import { Calendar, momentLocalizer } from "react-big-calendar";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Box } from "@mui/material";
import moment from "moment";
import { ISchedule } from "../../types/schedule";
import ScheduleModal from "./ScheduleModal";

const localizer = momentLocalizer(moment);

const BoxStyle = {
  height: "800px",
  p: 2,
  // 이벤트 시간 표시 숨기기
  "& .rbc-event-label": {
    display: "none",
  },
  // 요일 아래 all-day 영역 숨기기
  "& .rbc-allday-cell": {
    display: "none",
  },

  "& .rbc-time-view .rbc-header": {
    borderBottom: "none",
  },

  "& .rbc-header": {
    padding: "0.4rem",
  },
  "& .rbc-header span": {
    //요일 폰트사이즈
    fontSize: "0.8rem",
  },
  "& .rbc-label": {
    //시간 폰트사이즈
    fontSize: "0.8rem",
  },
  "& .rbc-events-container": {
    margin: "0",
  },
  "& .rbc-event-content div": {
    overflow: "hidden",
    pt: "0.3rem",
  },
  "& .rbc-current-time-indicator": {
    opacity: "0",
  },
  "& .rbc-day-slot": {
    overflow: "hidden",
  },
  "& .rbc-time-gutter": {
    overflow: "hidden",
  },
  "& .rbc-time-header-gutter": {
    pr: "2.3rem",
  },
};

interface TimeTableProps {
  events: ISchedule[];
  storeId?: string;
  openTime?: string;
  closeTime?: string;
}

const TimeTable = ({
  events,
  openTime = "00:00:00",
  closeTime = "23:59:59",
  storeId,
}: TimeTableProps) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedSchedule, setSelectedSchedule] = useState<
    ISchedule | undefined
  >();

  const handleOpen = () => setModalOpen(true);
  const handleClose = () => setModalOpen(false);

  const open = openTime.split(":");
  const close = closeTime.split(":");

  const eventStyleGetter = (event: ISchedule) => {
    return {
      style: {
        backgroundColor: event.color,
        borderRadius: "5px",
        opacity: 0.8,
        color: "black",
        border: "none",
        display: "block",
      },
    };
  };
  const CustomEvent = ({ event }: { event: ISchedule }) => (
    <div>
      <strong>{event.title}</strong>
    </div>
  );

  const handelSelectEvent = (event: ISchedule) => {
    setSelectedSchedule(event);
    handleOpen();
  };

  const role = localStorage.getItem("role");

  return (
    <div>
      <Box sx={BoxStyle}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={["week"]}
          min={new Date(0, 0, 0, +open[0], +open[1], +open[2])} // 오전 9시부터
          max={new Date(0, 0, 0, +close[0], +close[1], +close[2])} // 오후 6시까지
          step={60}
          timeslots={1}
          eventPropGetter={eventStyleGetter}
          components={{
            event: CustomEvent,
          }}
          formats={{
            timeGutterFormat: "HH:mm",
            dayFormat: "ddd",
          }}
          showMultiDayTimes={false}
          toolbar={false}
          onSelectEvent={handelSelectEvent}
        />
      </Box>
      {storeId && role !== "staff" && (
        <ScheduleModal
          open={modalOpen}
          onClose={handleClose}
          mode="edit"
          storeId={storeId}
          scheduleId={selectedSchedule?.id}
          selectedMember={selectedSchedule?.title}
        />
      )}
    </div>
  );
};

export default TimeTable;
