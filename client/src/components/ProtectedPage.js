import { message } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { GetLoggedInUser } from "../apicalls/users";
import { SetNotifications, SetUser } from "../redux/usersSlice";
import { SetLoading } from "../redux/loadersSlice";
import { GetAllNotifications } from "../apicalls/notifications";
import { Avatar, Badge, Dropdown, Menu } from "antd";
import Notifications from "./Notifications";

function ProtectedPage({ children }) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(
    localStorage.getItem("theme") === "dark"
  );
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user, notifications } = useSelector((state) => state.users);

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark-mode");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  const getUser = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetLoggedInUser();
      dispatch(SetLoading(false));
      if (response.success) {
        dispatch(SetUser(response.data));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
      localStorage.removeItem("token");
      navigate("/login");
    }
  };

  const getNotifications = async () => {
    try {
      dispatch(SetLoading(true));
      const response = await GetAllNotifications();
      dispatch(SetLoading(false));
      if (response.success) {
        dispatch(SetNotifications(response.data));
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      dispatch(SetLoading(false));
      message.error(error.message);
    }
  };

  useEffect(() => {
    if (localStorage.getItem("token")) {
      getUser();
    } else {
      navigate("/login");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (user) {
      getNotifications();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const profileMenu = (
    <Menu
      items={[
        {
          key: "profile",
          label: "Profile",
          onClick: () => navigate("/profile"),
        },
        {
          key: "discover",
          label: "Discover",
          onClick: () => navigate("/discover"),
        },
        {
          key: "dashboard",
          label: "Dashboard",
          onClick: () => navigate("/dashboard"),
        },
        {
          key: "calendar",
          label: "Calendar",
          onClick: () => navigate("/calendar"),
        },
        {
          type: "divider",
        },
        {
          key: "logout",
          label: "Logout",
          danger: true,
          onClick: () => {
            localStorage.removeItem("token");
            navigate("/login");
          },
        },
      ]}
    />
  );

  return (
    user && (
      <div>
        <div className="app-header flex justify-between items-center px-5 py-4">
          <h1
            className="app-logo text-2xl cursor-pointer"
            onClick={() => navigate("/")}
          >
            ProjectManager
          </h1>

          <div className="header-right flex items-center gap-4">
            <nav className="header-nav hidden md:flex items-center gap-4">
              <span
                className="header-nav-link cursor-pointer"
                onClick={() => navigate("/")}
              >
                Home
              </span>
              <span
                className="header-nav-link cursor-pointer"
                onClick={() => navigate("/dashboard")}
              >
                Dashboard
              </span>
              <span
                className="header-nav-link cursor-pointer"
                onClick={() => navigate("/calendar")}
              >
                Calendar
              </span>
              <span
                className="header-nav-link cursor-pointer"
                onClick={() => navigate("/discover")}
              >
                Discover
              </span>
            </nav>

            <div className="theme-toggle cursor-pointer" onClick={() => setIsDarkMode(!isDarkMode)}>
              {isDarkMode ? (
                <i className="ri-sun-line header-toggle-icon"></i>
              ) : (
                <i className="ri-moon-line header-toggle-icon"></i>
              )}
            </div>

            <Badge
              count={notifications.filter((notification) => !notification.read).length}
              className="cursor-pointer"
            >
              <Avatar
                shape="square"
                size="large"
                icon={<i className="ri-notification-line text-white rounded-full"></i>}
                onClick={() => setShowNotifications(true)}
              />
            </Badge>

            <Dropdown overlay={profileMenu} trigger={["click"]}>
              <span className="header-user cursor-pointer underline">
                {user?.firstName}
              </span>
            </Dropdown>
          </div>
        </div>
        <div className="px-5 py-3 app-content">{children}</div>

        {showNotifications && (
          <Notifications
            showNotifications={showNotifications}
            setShowNotifications={setShowNotifications}
            reloadNotifications={getNotifications}
          />
        )}
      </div>
    )
  );
}

export default ProtectedPage;