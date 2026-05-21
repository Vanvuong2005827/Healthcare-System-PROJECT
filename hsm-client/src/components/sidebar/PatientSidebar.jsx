import { useEffect, useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ForumIcon from "@mui/icons-material/Forum";
import ChatIcon from "@mui/icons-material/Chat";
import ArticleIcon from "@mui/icons-material/Article";
import CloseIcon from "@mui/icons-material/Close";

const navItemBase =
  "group flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2";

const subItemBase =
  "block rounded-xl px-4 py-2.5 text-sm font-medium transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-sky-400";

const iconBoxBase =
  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl border transition-colors duration-200";

const sectionLabel =
  "px-3 pb-2 pt-5 text-[11px] font-bold uppercase tracking-[0.22em] text-slate-400";

const PatientSidebar = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [doctorSubmenuOpen, setDoctorSubmenuOpen] = useState(false);
  const [appointmentSubmenuOpen, setAppointmentSubmenuOpen] = useState(false);
  const [communitySubmenuOpen, setCommunitySubmenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [desktopCollapsed, setDesktopCollapsed] = useState(false);

  const activeSection = useMemo(
    () => ({
      doctors: location.pathname.startsWith("/patient/doctor"),
      appointments: location.pathname.startsWith("/patient/appointment"),
      community: location.pathname.startsWith("/patient/community"),
    }),
    [location.pathname]
  );

  useEffect(() => {
    setDoctorSubmenuOpen(activeSection.doctors);
    setAppointmentSubmenuOpen(activeSection.appointments);
    setCommunitySubmenuOpen(activeSection.community);
    setMobileOpen(false);
  }, [activeSection]);

  useEffect(() => {
    const handleToggle = () => {
      if (window.matchMedia("(min-width: 768px)").matches) {
        setDesktopCollapsed((value) => !value);
        return;
      }

      setMobileOpen((value) => !value);
    };
    const handleClose = () => setMobileOpen(false);

    window.addEventListener("hms:toggle-patient-sidebar", handleToggle);
    window.addEventListener("hms:close-patient-sidebar", handleClose);

    return () => {
      window.removeEventListener("hms:toggle-patient-sidebar", handleToggle);
      window.removeEventListener("hms:close-patient-sidebar", handleClose);
    };
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("patientId");
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `${navItemBase} ${
      isActive
        ? "bg-slate-950 text-white shadow-sm"
        : "text-slate-600 hover:bg-sky-50 hover:text-slate-950"
    }`;

  const iconClass = (isActive) =>
    `${iconBoxBase} ${
      isActive
        ? "border-slate-800 bg-slate-800 text-white"
        : "border-slate-200 bg-white text-slate-500 group-hover:border-sky-200 group-hover:bg-sky-100 group-hover:text-sky-700"
    }`;

  const submenuButtonClass = (active) =>
    `${navItemBase} ${
      active
        ? "bg-sky-100 text-sky-950"
        : "text-slate-600 hover:bg-sky-50 hover:text-slate-950"
    }`;

  const submenuIconClass = (active) =>
    `${iconBoxBase} ${
      active
        ? "border-sky-200 bg-sky-600 text-white"
        : "border-slate-200 bg-white text-slate-500 group-hover:border-sky-200 group-hover:bg-sky-100 group-hover:text-sky-700"
    }`;

  const SidebarContent = ({ onNavigate }) => (
    <div className="flex h-full flex-col bg-white">
      <div className="border-b border-slate-200 px-6 py-7">
        <div className="mb-5 flex items-center justify-between md:hidden">
          <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
            Menu
          </span>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-2xl border border-slate-200 text-slate-600 transition-colors hover:bg-sky-50 focus:outline-none focus:ring-2 focus:ring-sky-400"
            aria-label="Close patient navigation"
          >
            <CloseIcon fontSize="small" />
          </button>
        </div>

        <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-400">
          Health Management
        </p>
        <div className="mt-5 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-950 text-lg font-bold text-white shadow-sm">
            H
          </div>
          <div className="min-w-0">
            <p className="text-lg font-bold leading-tight text-slate-950">
              HMS
            </p>
            <p className="truncate text-sm text-slate-500">
              Patient workspace
            </p>
          </div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto px-4 pb-4">
        <p className={sectionLabel}>Overview</p>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/patient/home"
              className={navLinkClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>
                    <DashboardIcon fontSize="small" />
                  </span>
                  <span className="min-w-0 flex-1">Dashboard</span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/patient/profile"
              className={navLinkClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>
                    <AccountCircleIcon fontSize="small" />
                  </span>
                  <span className="min-w-0 flex-1">My Profile</span>
                </>
              )}
            </NavLink>
          </li>
        </ul>

        <p className={sectionLabel}>Care Services</p>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              className={submenuButtonClass(activeSection.doctors)}
              onClick={() => setDoctorSubmenuOpen((value) => !value)}
              aria-expanded={doctorSubmenuOpen}
            >
              <span className={submenuIconClass(activeSection.doctors)}>
                <MedicalServicesIcon fontSize="small" />
              </span>
              <span className="min-w-0 flex-1 text-left">Doctors</span>
              {doctorSubmenuOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </button>
            {doctorSubmenuOpen && (
              <div className="mt-2 space-y-1 pl-14">
                <NavLink
                  to="/patient/doctor/all"
                  className={({ isActive }) =>
                    `${subItemBase} ${
                      isActive
                        ? "bg-sky-100 text-sky-800"
                        : "text-slate-500 hover:bg-sky-50 hover:text-sky-800"
                    }`
                  }
                  onClick={onNavigate}
                >
                  Doctor List
                </NavLink>
              </div>
            )}
          </li>

          <li>
            <button
              type="button"
              className={submenuButtonClass(activeSection.appointments)}
              onClick={() => setAppointmentSubmenuOpen((value) => !value)}
              aria-expanded={appointmentSubmenuOpen}
            >
              <span className={submenuIconClass(activeSection.appointments)}>
                <LocalPharmacyIcon fontSize="small" />
              </span>
              <span className="min-w-0 flex-1 text-left">Appointments</span>
              {appointmentSubmenuOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </button>
            {appointmentSubmenuOpen && (
              <div className="mt-2 space-y-1 pl-14">
                <NavLink
                  to="/patient/appointment/available"
                  className={({ isActive }) =>
                    `${subItemBase} ${
                      isActive
                        ? "bg-sky-100 text-sky-800"
                        : "text-slate-500 hover:bg-sky-50 hover:text-sky-800"
                    }`
                  }
                  onClick={onNavigate}
                >
                  Available Appointments
                </NavLink>
                <NavLink
                  to="/patient/appointment/all"
                  className={({ isActive }) =>
                    `${subItemBase} ${
                      isActive
                        ? "bg-sky-100 text-sky-800"
                        : "text-slate-500 hover:bg-sky-50 hover:text-sky-800"
                    }`
                  }
                  onClick={onNavigate}
                >
                  Booked Appointments
                </NavLink>
              </div>
            )}
          </li>
        </ul>

        <p className={sectionLabel}>Health Tools</p>
        <ul className="space-y-2">
          <li>
            <NavLink
              to="/patient/health-recommendation"
              className={navLinkClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>
                    <FavoriteIcon fontSize="small" />
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    Health Recommendations
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/patient/health-support-chat"
              className={navLinkClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>
                    <ChatIcon fontSize="small" />
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    AI Health Support
                  </span>
                </>
              )}
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/patient/articles"
              className={navLinkClass}
              onClick={onNavigate}
            >
              {({ isActive }) => (
                <>
                  <span className={iconClass(isActive)}>
                    <ArticleIcon fontSize="small" />
                  </span>
                  <span className="min-w-0 flex-1 leading-snug">
                    Doctor Articles
                  </span>
                </>
              )}
            </NavLink>
          </li>
        </ul>

        <p className={sectionLabel}>Community</p>
        <ul className="space-y-2">
          <li>
            <button
              type="button"
              className={submenuButtonClass(activeSection.community)}
              onClick={() => setCommunitySubmenuOpen((value) => !value)}
              aria-expanded={communitySubmenuOpen}
            >
              <span className={submenuIconClass(activeSection.community)}>
                <ForumIcon fontSize="small" />
              </span>
              <span className="min-w-0 flex-1 text-left">Community</span>
              {communitySubmenuOpen ? (
                <ExpandLessIcon fontSize="small" />
              ) : (
                <ExpandMoreIcon fontSize="small" />
              )}
            </button>
            {communitySubmenuOpen && (
              <div className="mt-2 space-y-1 pl-14">
                <NavLink
                  to="/patient/community"
                  className={({ isActive }) =>
                    `${subItemBase} ${
                      isActive
                        ? "bg-sky-100 text-sky-800"
                        : "text-slate-500 hover:bg-sky-50 hover:text-sky-800"
                    }`
                  }
                  onClick={onNavigate}
                >
                  HMS Community
                </NavLink>
              </div>
            )}
          </li>
        </ul>
      </nav>

      <div className="border-t border-slate-200 p-4">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex min-h-[52px] w-full items-center gap-3 rounded-2xl px-3 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:bg-sky-50 hover:text-slate-950 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:ring-offset-2"
        >
          <span className={iconBoxBase + " border-slate-200 bg-white text-slate-500 group-hover:border-sky-200 group-hover:bg-sky-100 group-hover:text-sky-700"}>
            <LogoutIcon fontSize="small" />
          </span>
          <span>Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <aside
        className={`min-h-screen w-72 shrink-0 border-r border-slate-200 bg-white ${
          desktopCollapsed ? "hidden" : "hidden md:flex"
        }`}
      >
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            className="absolute inset-0 bg-slate-950/45"
            aria-label="Close patient navigation overlay"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative h-full w-[min(88vw,20rem)] shadow-2xl">
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </aside>
        </div>
      )}
    </>
  );
};

export default PatientSidebar;
