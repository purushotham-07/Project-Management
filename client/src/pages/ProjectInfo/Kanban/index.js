import { message, Modal, Tag } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { UpdateTask } from "../../../apicalls/tasks";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";
import Divider from "../../../components/Divider";
import "./Kanban.css";

const priorityColorMap = {
  Low: "green",
  Medium: "blue",
  High: "orange",
  Urgent: "red",
};

const STATUSES = ["To Do", "In Progress", "Done"];

function Kanban({ tasks, project, reloadData, currentUserRole }) {
  const [draggedTask, setDraggedTask] = useState(null);
  const [viewTask, setViewTask] = useState(null);
  const [showViewTask, setShowViewTask] = useState(false);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();

  const isEmployee = currentUserRole === "employee";

  const canDragTask = (task) => {
    // Owner and Admin can drag any task
    if (!isEmployee) return true;
    // Employee can only drag tasks assigned to them
    return task.assignedTo?._id === user._id;
  };

  const handleDragStart = (e, task) => {
    if (!canDragTask(task)) {
      e.preventDefault();
      return;
    }
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();
    if (!draggedTask) return;

    if (draggedTask.status === newStatus) {
      setDraggedTask(null);
      return;
    }

    try {
      dispatch(SetLoading(true));
      const response = await UpdateTask({
        _id: draggedTask._id,
        status: newStatus,
      });
      dispatch(SetLoading(false));
      if (response.success) {
        message.success(`Task moved to ${newStatus}`);
        reloadData();
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
    setDraggedTask(null);
  };

  const handleDragEnd = () => {
    setDraggedTask(null);
  };

  const getTasksByStatus = (status) => {
    return tasks.filter((task) => task.status === status);
  };

  return (
    <div className="kanban-container">
      {STATUSES.map((status) => {
        const statusTasks = getTasksByStatus(status);
        return (
          <div
            key={status}
            className="kanban-column"
            onDragOver={handleDragOver}
            onDrop={(e) => handleDrop(e, status)}
          >
            <div className="kanban-column-header">
              <span>{status}</span>
              <span className="kanban-column-count">{statusTasks.length}</span>
            </div>

            {statusTasks.length === 0 && (
              <div className="kanban-empty">No tasks</div>
            )}

            {statusTasks.map((task) => (
              <div
                key={task._id}
                className={`kanban-card ${
                  draggedTask?._id === task._id ? "dragging" : ""
                }`}
                draggable={canDragTask(task)}
                onDragStart={(e) => handleDragStart(e, task)}
                onDragEnd={handleDragEnd}
              >
                <div
                  className="kanban-card-title"
                  onClick={() => {
                    setViewTask(task);
                    setShowViewTask(true);
                  }}
                >
                  {task.name}
                </div>

                {task.description && (
                  <div className="text-xs text-gray-500 line-clamp-2">
                    {task.description}
                  </div>
                )}

                <div className="kanban-card-meta">
                  {task.priority && (
                    <Tag
                      color={priorityColorMap[task.priority] || "default"}
                      style={{
                        fontSize: 11,
                        lineHeight: "16px",
                        padding: "0 4px",
                      }}
                    >
                      {task.priority}
                    </Tag>
                  )}
                  {task.dueDate && (
                    <span>Due: {getDateFormat(task.dueDate)}</span>
                  )}
                  {task.assignedTo && (
                    <span>
                      {task.assignedTo.firstName} {task.assignedTo.lastName?.charAt(0)}.
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        );
      })}

      {showViewTask && viewTask && (
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
              {viewTask.name}
            </span>
            <span className="text-[14px] text-gray-500">
              {viewTask.description}
            </span>

            {viewTask.priority && (
              <div className="mt-2">
                <span className="text-sm font-semibold">Priority: </span>
                <Tag color={priorityColorMap[viewTask.priority]}>
                  {viewTask.priority}
                </Tag>
              </div>
            )}

            {viewTask.dueDate && (
              <div className="mt-1">
                <span className="text-sm font-semibold">Due Date: </span>
                <span className="text-sm">{getDateFormat(viewTask.dueDate)}</span>
              </div>
            )}

            {viewTask.attachments?.length > 0 && (
              <div className="flex gap-5 mt-2">
                {viewTask.attachments.map((image, index) => (
                  <img
                    key={index}
                    src={image}
                    alt=""
                    className="w-40 h-40 object-cover mt-2 p-2 border border-solid rounded border-gray-500"
                  />
                ))}
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
}

export default Kanban;