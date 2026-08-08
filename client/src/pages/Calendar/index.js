import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { message, Modal, Tag, Button } from "antd";
import { Calendar, momentLocalizer } from "react-big-calendar";
import moment from "moment";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { GetAllTasks } from "../../apicalls/tasks";
import { GetProjectsByRolePaginated } from "../../apicalls/projects";
import { SetLoading } from "../../redux/loadersSlice";
import { getDateFormat } from "../../utils/helpers";
import Divider from "../../components/Divider";
import { useNavigate } from "react-router-dom";
import "./Calendar.css";

const localizer = momentLocalizer(moment);

const PRIORITY_COLORS = {
  Low: "green",
  Medium: "blue",
  High: "orange",
  Urgent: "red",
};

function CalendarPage() {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState("all");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(SetLoading(true));
      const projectsResponse = await GetProjectsByRolePaginated({ page: 1, limit: 100 });
      const allTasks = [];

      if (projectsResponse.success) {
        setProjects(projectsResponse.data);
        for (const project of projectsResponse.data) {
          const tasksResponse = await GetAllTasks({ project: project._id });
          if (tasksResponse.success) {
            tasksResponse.data.forEach((task) => {
              if (task.dueDate) {
                allTasks.push({
                  ...task,
                  projectName: project.name,
                  projectId: project._id,
                  start: new Date(task.dueDate),
                  end: new Date(task.dueDate),
                  title: task.name,
                  allDay: true,
                });
              }
            });
          }
        }
      }
      dispatch(SetLoading(false));
      setEvents(allTasks);
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filteredEvents =
    selectedProject === "all"
      ? events
      : events.filter((event) => event.projectId === selectedProject);

  const eventStyleGetter = (event) => {
    let backgroundColor = "#1890ff";
    if (event.priority === "High") backgroundColor = "#fa8c16";
    if (event.priority === "Urgent") backgroundColor = "#f5222d";
    if (event.priority === "Low") backgroundColor = "#52c41a";
    if (event.status === "Done") backgroundColor = "#8c8c8c";
    return {
      style: {
        backgroundColor,
        borderRadius: "4px",
        color: "#fff",
        border: "none",
        fontSize: "12px",
        padding: "2px 4px",
      },
    };
  };

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1 className="text-primary text-2xl font-semibold">
          Task Calendar
        </h1>
        <select
          value={selectedProject}
          onChange={(e) => setSelectedProject(e.target.value)}
          className="calendar-project-select"
        >
          <option value="all">All Projects</option>
          {projects.map((project) => (
            <option key={project._id} value={project._id}>
              {project.name}
            </option>
          ))}
        </select>
      </div>

      <Divider />

      <div className="calendar-wrapper">
        <Calendar
          localizer={localizer}
          events={filteredEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "calc(100vh - 200px)" }}
          onSelectEvent={(event) => setSelectedEvent(event)}
          eventPropGetter={eventStyleGetter}
          popup
          views={["month", "week", "day", "agenda"]}
          defaultView="month"
          messages={{
            today: "Today",
            previous: "Back",
            next: "Next",
            month: "Month",
            week: "Week",
            day: "Day",
            agenda: "Agenda",
          }}
        />
      </div>

      {selectedEvent && (
        <Modal
          title="TASK DETAILS"
          open={!!selectedEvent}
          onCancel={() => setSelectedEvent(null)}
          centered
          footer={null}
          width={500}
        >
          <Divider />
          <div className="flex flex-col">
            <span className="text-md text-primary font-semibold">
              {selectedEvent.name}
            </span>
            <span className="text-[14px] text-gray-500">
              {selectedEvent.description}
            </span>

            <div className="flex gap-5 mt-3 flex-wrap">
              <div>
                <span className="text-sm font-semibold">Project: </span>
                <span className="text-sm">{selectedEvent.projectName}</span>
              </div>
              <div>
                <span className="text-sm font-semibold">Due Date: </span>
                <span className="text-sm">{getDateFormat(selectedEvent.dueDate)}</span>
              </div>
            </div>

            <div className="flex gap-5 mt-2 flex-wrap">
              <div>
                <span className="text-sm font-semibold">Status: </span>
                <Tag color={selectedEvent.status === "Done" ? "green" : selectedEvent.status === "In Progress" ? "orange" : "blue"}>
                  {selectedEvent.status}
                </Tag>
              </div>
              <div>
                <span className="text-sm font-semibold">Priority: </span>
                <Tag color={PRIORITY_COLORS[selectedEvent.priority]}>
                  {selectedEvent.priority}
                </Tag>
              </div>
            </div>

            {selectedEvent.assignedTo && (
              <div className="mt-2">
                <span className="text-sm font-semibold">Assigned To: </span>
                <span className="text-sm">
                  {selectedEvent.assignedTo.firstName}{" "}
                  {selectedEvent.assignedTo.lastName}
                </span>
              </div>
            )}

            <div className="flex justify-end mt-4">
              <Button
                type="primary"
                onClick={() => {
                  navigate(`/project/${selectedEvent.projectId}`);
                  setSelectedEvent(null);
                }}
              >
                View Project
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}

export default CalendarPage;