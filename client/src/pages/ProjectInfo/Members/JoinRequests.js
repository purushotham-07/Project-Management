import { Button, message, Table, Tag } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { GetJoinRequests, RespondToRequest } from "../../../apicalls/joinRequests";
import { SetLoading } from "../../../redux/loadersSlice";
import { getDateFormat } from "../../../utils/helpers";

function JoinRequests({ project }) {
  const [requests, setRequests] = useState([]);
  const dispatch = useDispatch();

  const getData = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetJoinRequests(project._id);
      dispatch(SetLoading(false));
      if (response.success) {
        setRequests(response.data);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const handleRespond = async (requestId, status) => {
    try {
      dispatch(SetLoading(true));
      const response = await RespondToRequest({ requestId, status });
      dispatch(SetLoading(false));
      if (response.success) {
        message.success(response.message);
        getData();
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
  }, [project._id]);

  const columns = [
    {
      title: "Name",
      dataIndex: "user",
      render: (text, record) =>
        `${record.user.firstName} ${record.user.lastName}`,
    },
    {
      title: "Email",
      dataIndex: "email",
      render: (text, record) => record.user.email,
    },
    {
      title: "LinkedIn",
      dataIndex: "linkedin",
      render: (text, record) =>
        record.user.linkedin ? (
          <a href={record.user.linkedin} target="_blank" rel="noopener noreferrer">
            <i className="ri-linkedin-fill text-blue-600"></i> Profile
          </a>
        ) : (
          <span className="text-gray-400 text-xs">Not provided</span>
        ),
    },
    {
      title: "GitHub",
      dataIndex: "github",
      render: (text, record) =>
        record.user.github ? (
          <a href={record.user.github} target="_blank" rel="noopener noreferrer">
            <i className="ri-github-fill text-gray-700"></i> Profile
          </a>
        ) : (
          <span className="text-gray-400 text-xs">Not provided</span>
        ),
    },
    {
      title: "Message",
      dataIndex: "message",
      render: (text) => text || "-",
    },
    {
      title: "Requested At",
      dataIndex: "createdAt",
      render: (text) => getDateFormat(text),
    },
    {
      title: "Status",
      dataIndex: "status",
      render: (text) => {
        const colorMap = {
          pending: "orange",
          approved: "green",
          rejected: "red",
        };
        return <Tag color={colorMap[text]}>{text}</Tag>;
      },
    },
    {
      title: "Action",
      key: "action",
      render: (text, record) =>
        record.status === "pending" ? (
          <div className="flex gap-2">
            <Button
              type="primary"
              size="small"
              onClick={() => handleRespond(record._id, "approved")}
            >
              Approve
            </Button>
            <Button
              danger
              size="small"
              onClick={() => handleRespond(record._id, "rejected")}
            >
              Reject
            </Button>
          </div>
        ) : null,
    },
  ];

  return (
    <div className="join-requests-container">
      <Table
        columns={columns}
        dataSource={requests}
        rowKey="_id"
        className="join-requests-table"
        scroll={{ x: true }}
      />
    </div>
  );
}

export default JoinRequests;
