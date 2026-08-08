import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { message, Progress, Tag } from "antd";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { GetDashboardAnalytics } from "../../apicalls/analytics";
import { SetLoading } from "../../redux/loadersSlice";
import { getDateFormat } from "../../utils/helpers";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

const STATUS_COLORS = {
  "To Do": "#1890ff",
  "In Progress": "#fa8c16",
  Done: "#52c41a",
};

const PROJECT_COLORS = {
  Planning: "#722ed1",
  Active: "#1890ff",
  "On Hold": "#fa8c16",
  Completed: "#52c41a",
};

const PRIORITY_COLORS = {
  Low: "#52c41a",
  Medium: "#1890ff",
  High: "#fa8c16",
  Urgent: "#f5222d",
};

function Dashboard() {
  const [analytics, setAnalytics] = useState(null);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetDashboardAnalytics();
      dispatch(SetLoading(false));
      if (response.success) {
        setAnalytics(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!analytics) return null;

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title text-primary text-2xl font-semibold">
        Dashboard Analytics
      </h1>

      {/* Stats Overview */}
      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card stat-total">
          <div className="stat-icon">
            <i className="ri-folder-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.projectStats.total}</div>
            <div className="stat-label">Total Projects</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-active">
          <div className="stat-icon">
            <i className="ri-play-circle-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.projectStats.active}</div>
            <div className="stat-label">Active Projects</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-tasks">
          <div className="stat-icon">
            <i className="ri-task-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.taskStats.total}</div>
            <div className="stat-label">Total Tasks</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-done">
          <div className="stat-icon">
            <i className="ri-checkbox-circle-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.taskStats.done}</div>
            <div className="stat-label">Completed Tasks</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-progress">
          <div className="stat-icon">
            <i className="ri-timer-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.taskStats.inProgress}</div>
            <div className="stat-label">In Progress</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-overdue">
          <div className="stat-icon">
            <i className="ri-alarm-warning-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.overdueTasks}</div>
            <div className="stat-label">Overdue Tasks</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-week">
          <div className="stat-icon">
            <i className="ri-calendar-check-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.dueThisWeek}</div>
            <div className="stat-label">Due This Week</div>
          </div>
        </div>

        <div className="dashboard-stat-card stat-rate">
          <div className="stat-icon">
            <i className="ri-percent-line"></i>
          </div>
          <div>
            <div className="stat-value">{analytics.taskStats.completionRate}%</div>
            <div className="stat-label">Completion Rate</div>
          </div>
        </div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-charts-row">
        {/* Task Status Chart */}
        <div className="dashboard-chart-card">
          <h3 className="chart-title">Task Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analytics.taskStatusDistribution}
                cx="50%"
                cy="50%"
                outerRadius={100}
                dataKey="value"
                label>
                {analytics.taskStatusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={STATUS_COLORS[entry.name]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Project Status Chart */}
        <div className="dashboard-chart-card">
          <h3 className="chart-title">Project Status Distribution</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analytics.projectStatusDistribution}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="value" name="Projects">
                {analytics.projectStatusDistribution.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={PROJECT_COLORS[entry.name]}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Priority Distribution & Member Workload */}
      <div className="dashboard-charts-row">
        <div className="dashboard-chart-card">
          <h3 className="chart-title">Priority Distribution</h3>
          <div className="priority-list">
            {Object.entries(analytics.priorityDistribution).map(
              ([priority, count], index) => (
                <div key={index} className="priority-item">
                  <Tag color={PRIORITY_COLORS[priority]}>{priority}</Tag>
                  <Progress
                    percent={
                      analytics.taskStats.total > 0
                        ? Math.round(
                            (count / analytics.taskStats.total) * 100
                          )
                        : 0
                    }
                    strokeColor={PRIORITY_COLORS[priority]}
                    size="small"
                  />
                  <span className="priority-count">{count}</span>
                </div>
              )
            )}
          </div>
        </div>

        <div className="dashboard-chart-card">
          <h3 className="chart-title">Member Workload</h3>
          {Object.keys(analytics.memberWorkload).length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={Object.entries(analytics.memberWorkload).map(
                  ([name, data]) => ({
                    name: name.split(" ")[0],
                    "To Do": data.todo,
                    "In Progress": data.inProgress,
                    Done: data.done,
                  })
                )}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Legend />
                <Bar dataKey="To Do" stackId="a" fill="#1890ff" />
                <Bar dataKey="In Progress" stackId="a" fill="#fa8c16" />
                <Bar dataKey="Done" stackId="a" fill="#52c41a" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="empty-state">No task assignments yet</div>
          )}
        </div>
      </div>

      {/* Recent Tasks */}
      <div className="dashboard-chart-card">
        <h3 className="chart-title">Recent Tasks</h3>
        {analytics.recentTasks.length > 0 ? (
          <div className="recent-tasks-table">
            <table className="w-full">
              <thead>
                <tr>
                  <th>Task</th>
                  <th>Status</th>
                  <th>Priority</th>
                  <th>Assigned To</th>
                  <th>Due Date</th>
                </tr>
              </thead>
              <tbody>
                {analytics.recentTasks.map((task) => (
                  <tr key={task._id} className="cursor-pointer hover:bg-gray-50" onClick={() => navigate(`/project/${task.project._id}`)}>
                    <td>{task.name}</td>
                    <td>
                      <Tag color={STATUS_COLORS[task.status]}>{task.status}</Tag>
                    </td>
                    <td>
                      <Tag color={PRIORITY_COLORS[task.priority]}>{task.priority}</Tag>
                    </td>
                    <td>
                      {task.assignedTo
                        ? `${task.assignedTo.firstName} ${task.assignedTo.lastName}`
                        : "-"}
                    </td>
                    <td>{task.dueDate ? getDateFormat(task.dueDate) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="empty-state">No tasks yet</div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;