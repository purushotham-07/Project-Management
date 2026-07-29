import { Button, message, Pagination } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetPublicProjects } from "../../apicalls/projects";
import { RequestToJoin } from "../../apicalls/joinRequests";
import { SetLoading } from "../../redux/loadersSlice";
import Divider from "../../components/Divider";
import "./Discover.css";

function Discover() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.users);

  const getData = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetPublicProjects({
        search,
        projectStatus: statusFilter || undefined,
        page,
        limit: 12,
      });
      dispatch(SetLoading(false));
      if (response.success) {
        setProjects(response.data);
        setTotal(response.total);
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  const handleRequestJoin = async (e, projectId) => {
    e.stopPropagation();
    try {
      dispatch(SetLoading(true));
      const response = await RequestToJoin({ projectId });
      dispatch(SetLoading(false));
      if (response.success) {
        message.success("Join request sent!");
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
  }, [page]);

  const handleSearch = () => {
    setPage(1);
    getData();
  };

  return (
    <div className="discover-container">
      <div className="discover-header">
        <h1 className="text-primary text-xl font-semibold">Discover Projects</h1>
      </div>

      <div className="discover-filters">
        <input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
        >
          <option value="">All Status</option>
          <option value="Planning">Planning</option>
          <option value="Active">Active</option>
          <option value="On Hold">On Hold</option>
          <option value="Completed">Completed</option>
        </select>
        <Button type="primary" onClick={handleSearch}>
          Search
        </Button>
      </div>

      <div className="discover-grid">
        {projects.length === 0 && (
          <div className="col-span-full text-center text-gray-400 py-10">
            No public projects found
          </div>
        )}
        {projects.map((project) => (
          <div
            key={project._id}
            className="discover-card"
            onClick={() => navigate(`/project/${project._id}`)}
          >
            <div className="discover-card-title">{project.name}</div>
            <div className="discover-card-desc">
              {project.description?.length > 100
                ? project.description.substring(0, 100) + "..."
                : project.description}
            </div>
            {project.tags?.length > 0 && (
              <div className="discover-card-tags">
                {project.tags.map((tag, i) => (
                  <span key={i} className="discover-card-tag">
                    {tag}
                  </span>
                ))}
              </div>
            )}
            <Divider />
            <div className="discover-card-footer">
              <span>
                {project.owner?.firstName} {project.owner?.lastName}
              </span>
              <span>{project.projectStatus || "Active"}</span>
            </div>
            <Button
              type="primary"
              size="small"
              block
              onClick={(e) => handleRequestJoin(e, project._id)}
            >
              Request to Join
            </Button>
          </div>
        ))}
      </div>

      {total > 12 && (
        <div className="discover-pagination">
          <Pagination
            current={page}
            total={total}
            pageSize={12}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default Discover;