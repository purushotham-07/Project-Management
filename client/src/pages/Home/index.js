import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { GetProjectsByRolePaginated } from "../../apicalls/projects";
import { SetLoading } from "../../redux/loadersSlice";
import { message, Pagination } from "antd";
import { getDateFormat } from "../../utils/helpers";
import Divider from "../../components/Divider";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const [projects, setProjects] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { user } = useSelector((state) => state.users);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const getData = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetProjectsByRolePaginated({ page, limit: 10 });
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

  useEffect(() => {
    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  return (
    <div className="home-container">
      <h1 className="home-welcome text-primary text-xl">
        Heyy {user?.firstName} {user?.lastName}, Welcome to ProjectManager!
      </h1>

      <div className="home-project-grid">
        {projects.length > 0 ? (
          projects.map((project) => (
            <div
              key={project._id}
              className="home-project-card"
              onClick={() => navigate(`/project/${project._id}`)}
            >
              <h1 className="home-project-name">{project.name}</h1>
              <Divider className="home-project-divider" />
              <div className="home-project-info">
                <span>Created At: {getDateFormat(project.createdAt)}</span>
                <span>Owner: {project.owner?.firstName}</span>
                <span>Status: {project.projectStatus || project.status}</span>
              </div>
              {project.tags?.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                  {project.tags.map((tag, i) => (
                    <span key={i} className="text-xs bg-gray-100 px-1 rounded">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="home-no-projects">You have no projects yet</div>
        )}
      </div>

      {total > 10 && (
        <div className="flex justify-center mt-6">
          <Pagination
            current={page}
            total={total}
            pageSize={10}
            onChange={(p) => setPage(p)}
            showSizeChanger={false}
          />
        </div>
      )}
    </div>
  );
}

export default Home;