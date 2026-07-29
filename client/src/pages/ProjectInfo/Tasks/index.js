import { Button, message, Modal, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DeleteTask, GetAllTasks, UpdateTask } from "../../../apicalls/tasks";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";
import Divider from "../../../components/Divider";
import TaskForm from "./TaskForm";
import { AddNotification } from "../../../apicalls/notifications";
import Kanban from "../Kanban";
import Comments from "../../../components/Comments";
import "./Tasks.css";


function Tasks({ project, currentUserRole }) {
  const [filters, setFilters] = useState({
    status: "all",
    assignedTo: "all",
    assignedBy: "all",
  });
  const [showViewTask, setShowViewTask] = React.useState(false);
  const { user } = useSelector((state) => state.users);
  const [tasks, setTasks] = useState([]);
  const [showTaskForm, setShowTaskForm] = React.useState(false);
  const [task, setTask] = React.useState(null);
  const dispatch = useDispatch();
  const isEmployee = currentUserRole === "employee";
  const canManageTasks = currentUserRole === "owner" || currentUserRole === "admin";

  const getTasks = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetAllTasks({
        project: project._id,
        ...filters,
      });
      dispatch(SetLoading(false));
      if (response.success) {
        setTasks(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const deleteTaks = async (id) => {
    try {
      dispatch(SetLoading(true));
      const response = await DeleteTask(id);
      if (response.success) {
        getTasks();
        message.success(response.message);
      } else {
        throw new Error(response.message);
      }
      dispatch(SetLoading(false));
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const onStatusUpdate = async ({ task, status }) => {
    try {
      dispatch(SetLoading(true));
      const response = await UpdateTask({
        _id: task._id,
        status,
      });
      if (response.success) {
        getTasks();
        message.success(response.message);
        AddNotification({
          title: "Task Status Updated",
          description: `${task.name} status has been updated to ${status}`,
          user: task.assignedBy._id,
          onClick: `/project/${project._id}`,
        });
      } else {
        throw new Error(response.message);
      }
      dispatch(SetLoading(false));
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  React.useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const priorityColorMap = {
    Low: "green",
    Medium: "blue",
    High: "orange",
    Urgent: "red",
  };

  const columns = [
    {
      title: "Name",
      dataIndex: "name",
      render: (text, record) => (
        <span
          className="underline text-[14px] cursor-pointer"
          onClick={() => {
            setTask(record);
            setShowViewTask(true);
          }}
        >
          {record.name}
        </span>
      ),
    },
    {
      title: "Priority",
      dataIndex: "priority",
      render: (text) => (
        <Tag color={priorityColorMap[text] || "default"}>{text || "Medium"}</Tag>
      ),
    },
    {
      title: "Due Date",
      dataIndex: "dueDate",
      render: (text) => (text ? getDateFormat(text) : "-"),
    },
    {
      title: "Assigned To",
      dataIndex: "assignedTo",
      render: (text, record) =>
        record.assignedTo ? record.assignedTo.firstName + " " + record.assignedTo.lastName : "-",
    },
    {
      title: "Assigned By",
      dataIndex: "assignedBy",
      render: (text, record) =>
        record.assignedBy ? record.assignedBy.firstName + " " + record.assignedBy.lastName : "-",
    },
    {
      title: "Created On",
      dataIndex: "createdAt",
      render: (text, record) => getDateFormat(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text, record) => {
        return (
          <select
            value={record.status}
            onChange={(e) => {
              onStatusUpdate({
                task: record,
                status: e.target.value,
              });
            }}
            disabled={record.assignedTo?._id !== user._id && isEmployee}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        );
      },
    },
    {
      title: "Action",
      dataIndex: "action",
      render: (text, record) => {
        return (
          <div className="flex gap-2">
            <Button
              type="primary"
              onClick={() => {
                setTask(record);
                setShowTaskForm(true);
              }}
            >
              Edit
            </Button>

            <Button
              type="primary"
              danger
              onClick={() => {
                deleteTaks(record._id);
              }}
            >
              Delete
            </Button>
          </div>
        );
      },
    },
  ];

  // Only employees can't see action column; hide for employees
  if (isEmployee) {
    columns.pop();
  }

  useEffect(() => {
    getTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters]);

  const [viewMode, setViewMode] = useState("table");

  return (
    <div>
      <div className="flex justify-between items-center">
        <div className="flex gap-2">
          <Button
            type={viewMode === "table" ? "primary" : "default"}
            size="small"
            onClick={() => setViewMode("table")}
          >
            Table
          </Button>
          <Button
            type={viewMode === "kanban" ? "primary" : "default"}
            size="small"
            onClick={() => setViewMode("kanban")}
          >
            Kanban
          </Button>
        </div>
        {canManageTasks && (
          <Button type="default" onClick={() => setShowTaskForm(true)}>
            Add Task
          </Button>
        )}
      </div>

      <div className="flex gap-5 mt-5 flex-wrap">
        <div>
          <span>Status</span>
          <select
            value={filters.status}
            onChange={(e) => {
              setFilters({
                ...filters,
                status: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div>
          <span>Assigned By</span>
          <select
            value={filters.assignedBy}
            onChange={(e) => {
              setFilters({
                ...filters,
                assignedBy: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            {project.members
              .filter((m) => m.role === "admin" || m.role === "owner")
              .map((m) => (
                <option value={m.user._id} key={m.user._id}>
                  {m.user.firstName + " " + m.user.lastName}
                </option>
              ))}
          </select>
        </div>

        <div>
          <span>Assigned To</span>
          <select
            value={filters.assignedTo}
            onChange={(e) => {
              setFilters({
                ...filters,
                assignedTo: e.target.value,
              });
            }}
          >
            <option value="all">All</option>
            {project.members
              .filter((m) => m.role === "employee")
              .map((m) => (
                <option value={m.user._id} key={m.user._id}>
                  {m.user.firstName + " " + m.user.lastName}
                </option>
              ))}
          </select>
        </div>
      </div>

      {viewMode === "table" ? (
        <Table columns={columns} dataSource={tasks} className="mt-5" rowKey="_id" />
      ) : (
        <Kanban
          tasks={tasks}
          project={project}
          reloadData={getTasks}
          currentUserRole={currentUserRole}
        />
      )}

      {showTaskForm && (
        <TaskForm
          showTaskForm={showTaskForm}
          setShowTaskForm={setShowTaskForm}
          project={project}
          reloadData={getTasks}
          task={task}
        />
      )}

      {showViewTask && (
        <Modal
          title="TASK DETAILS"
          open={showViewTask}
          onCancel={() => setShowViewTask(false)}
          centered
          footer={null}
          width={700}
        >
          <Divider />
          <div className="flex flex-col">
            <span className="text-md text-primary font-semibold">
              {task.name}
            </span>
            <span className="text-[14px] text-gray-500">
              {task.description}
            </span>

            {task.priority && (
              <div className="mt-2">
                <span className="text-sm font-semibold">Priority: </span>
                <Tag color={priorityColorMap[task.priority]}>{task.priority}</Tag>
              </div>
            )}

            {task.dueDate && (
              <div className="mt-1">
                <span className="text-sm font-semibold">Due Date: </span>
                <span className="text-sm">{getDateFormat(task.dueDate)}</span>
              </div>
            )}

            <div className="flex gap-5 mt-2">
              {task.attachments.map((image, index) => {
                return (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    className="w-40 h-40 object-cover mt-2 p-2 border border-solid rounded border-gray-500"
                  />
                );
              })}
            </div>

            <Divider />
            <span className="text-sm font-semibold text-gray-700">Comments</span>
            <Comments taskId={task._id} />
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Tasks;