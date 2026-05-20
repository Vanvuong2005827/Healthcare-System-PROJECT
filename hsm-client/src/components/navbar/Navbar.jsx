import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import LanguageOutlinedIcon from "@mui/icons-material/LanguageOutlined";
import NotificationsNoneOutlinedIcon from "@mui/icons-material/NotificationsNoneOutlined";
import ListOutlinedIcon from "@mui/icons-material/ListOutlined";
import axiosInstancePatientService from "../../utils/axiosInstancePatientService";
import axiosInstanceNotificationService from "../../utils/axiosInstanceNotificationService";

const resolvePageTitle = (pathname) => {
  const explicitMatches = [
    { match: "/health-support-chat", label: "AI Health Support" },
    { match: "/health-recommendation", label: "Health Recommendations" },
    { match: "/appointment", label: "Appointments" },
    { match: "/articles", label: "Articles" },
    { match: "/community", label: "Community" },
    { match: "/profile", label: "Profile" },
    { match: "/inventory", label: "Inventory" },
    { match: "/health-records", label: "Health Records" },
    { match: "/analytics", label: "Analytics" },
    { match: "/rooms", label: "Rooms" },
    { match: "/dashboard", label: "Dashboard" },
    { match: "/home", label: "Dashboard" },
  ];

  const matchedPage = explicitMatches.find(({ match }) => pathname.includes(match));

  if (matchedPage) {
    return matchedPage.label;
  }

  const segments = pathname
    .split("/")
    .filter(Boolean)
    .filter((segment) => !["patient", "doctor", "admin"].includes(segment));

  if (segments.length === 0) {
    return "Dashboard";
  }

  return segments[segments.length - 1]
    .replace(/-/g, " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
};

const resolveWorkspaceLabel = (pathname) => {
  if (pathname.startsWith("/doctor")) {
    return "Doctor workspace";
  }

  if (pathname.startsWith("/admin")) {
    return "Admin workspace";
  }

  return "Patient workspace";
};

const Navbar = () => {
  const location = useLocation();
  const [showSlider, setShowSlider] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [userId, setUserId] = useState(null);
  const [allNotifications, setAllNotifications] = useState([]);
  const [showAllNotifications, setShowAllNotifications] = useState(false);
  const fetchedRef = useRef(false);
  const isPatientWorkspace = location.pathname.startsWith("/patient");

  const pageTitle = resolvePageTitle(location.pathname);
  const workspaceLabel = resolveWorkspaceLabel(location.pathname);

  const fetchUserProfile = async (signal) => {
    try {
      const response = await axiosInstancePatientService.get("/profile", {
        signal,
      });
      setUserId(response.data.userId);
    } catch (error) {
      if (error.name === "CanceledError") return;
      console.error("Error fetching user profile:", error);
    }
  };

  const fetchAllNotifications = async () => {
    if (!userId) return;

    try {
      const response = await axiosInstanceNotificationService.get(`/${userId}`);
      setAllNotifications(response.data);
    } catch (error) {
      console.error("Error fetching all notifications:", error);
    }
  };

  const fetchNotifications = async () => {
    if (!userId) return;

    try {
      const response = await axiosInstanceNotificationService.get(
        `/unread/${userId}`
      );
      setNotifications(response.data);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  const markAllAsRead = async () => {
    if (!userId) return;

    try {
      await axiosInstanceNotificationService.post(`/mark-all-read/${userId}`);
      fetchNotifications();
      fetchAllNotifications();
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  useEffect(() => {
    if (!isPatientWorkspace) {
      fetchedRef.current = false;
      setUserId(null);
      setNotifications([]);
      setAllNotifications([]);
      return undefined;
    }

    if (fetchedRef.current) return undefined;
    fetchedRef.current = true;

    const controller = new AbortController();
    fetchUserProfile(controller.signal);

    return () => controller.abort();
  }, [isPatientWorkspace]);

  const handleClick = (type) => {
    if (type === "notifications") {
      setShowSlider((prev) => !prev);
      setShowAllNotifications(false);

      if (!showSlider) {
        fetchNotifications();
      }
    }
  };

  const handleViewAllNotifications = () => {
    fetchAllNotifications().then(() => {
      setShowAllNotifications(true);
      setShowSlider(false);
    });
  };

  const notificationPanelClasses =
    "absolute right-0 top-[calc(100%+12px)] z-20 w-[340px] max-h-[420px] overflow-y-auto rounded-3xl border border-slate-200 bg-white p-4 shadow-2xl";

  const renderNotificationCard = (items, emptyText) => {
    if (items.length === 0) {
      return (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          {emptyText}
        </div>
      );
    }

    return items.map((notification, index) => (
      <div
        key={`${notification.notificationType}-${index}`}
        className="rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 transition-colors duration-200 hover:border-slate-300 hover:bg-white"
      >
        <p className="text-sm font-semibold text-slate-900">
          {notification.notificationType}
        </p>
        <p className="mt-1 text-sm leading-6 text-slate-600">
          {notification.notificationText}
        </p>
      </div>
    ));
  };

  return (
    <header className="relative mb-6 flex min-h-[78px] items-center justify-between rounded-[28px] border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-400">
          Hospital Management System
        </p>
        <div className="mt-2 flex items-center gap-3">
          <Link
            to="/"
            className="text-2xl font-semibold tracking-tight text-slate-900 no-underline transition-colors duration-200 hover:text-slate-700"
          >
            HMS
          </Link>
          <span className="hidden h-4 w-px bg-slate-200 md:block" />
          <span className="truncate text-sm font-medium text-slate-500">
            {pageTitle}
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2 md:gap-3">
        <div className="hidden items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-500 lg:flex">
          <span className="h-2 w-2 rounded-full bg-emerald-500" />
          {workspaceLabel}
        </div>

        <button
          onClick={() => handleClick("language")}
          className="flex h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 text-sm font-medium text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none"
        >
          <LanguageOutlinedIcon fontSize="small" />
          <span className="hidden sm:inline">English</span>
        </button>

        <button
          onClick={() => handleClick("notifications")}
          className="relative flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none"
        >
          <NotificationsNoneOutlinedIcon fontSize="small" />
          {notifications.length > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-slate-900 px-1 text-[11px] font-semibold text-white">
              {notifications.length}
            </span>
          )}
        </button>

        <button
          onClick={() => handleClick("list")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 text-slate-600 transition-colors duration-200 hover:border-slate-300 hover:bg-white hover:text-slate-900 focus:outline-none"
        >
          <ListOutlinedIcon fontSize="small" />
        </button>
      </div>

      {showSlider && (
        <div className={notificationPanelClasses}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Notifications
              </h2>
              <p className="text-sm text-slate-500">
                Recent unread updates for your account
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                className="text-xs font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-900"
                onClick={markAllAsRead}
              >
                Mark all read
              </button>
              <button
                onClick={handleViewAllNotifications}
                className="rounded-full bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white transition-colors duration-200 hover:bg-slate-700"
              >
                View all
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {renderNotificationCard(notifications, "No unread notifications")}
          </div>
        </div>
      )}

      {showAllNotifications && (
        <div className={notificationPanelClasses}>
          <div className="mb-4 flex items-start justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                All Notifications
              </h2>
              <p className="text-sm text-slate-500">
                Notification history for this account
              </p>
            </div>
            <button
              onClick={() => setShowAllNotifications(false)}
              className="text-xs font-semibold text-slate-500 transition-colors duration-200 hover:text-slate-900"
            >
              Close
            </button>
          </div>

          <div className="space-y-3">
            {renderNotificationCard(allNotifications, "No notifications")}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
