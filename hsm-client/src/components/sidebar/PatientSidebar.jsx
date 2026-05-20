import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import LocalPharmacyIcon from "@mui/icons-material/LocalPharmacy";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ChatIcon from "@mui/icons-material/Chat";
import ArticleIcon from "@mui/icons-material/Article";

const Sidebar = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [doctorSubmenuOpen, setDoctorSubmenuOpen] = useState(false);
  const [appointmentSubmenuOpen, setAppointmentSubmenuOpen] = useState(false);

  const doctorPaths = ["/patient/doctor/all"];
  const appointmentPaths = [
    "/patient/appointment/available",
    "/patient/appointment/all",
  ];

  const isPathActive = (path) =>
    pathname === path || pathname.startsWith(`${path}/`);

  const isAnyPathActive = (paths) => paths.some((path) => isPathActive(path));
  const hasActiveDoctorPath = isAnyPathActive(doctorPaths);
  const hasActiveAppointmentPath = isAnyPathActive(appointmentPaths);

  useEffect(() => {
    if (hasActiveDoctorPath) {
      setDoctorSubmenuOpen(true);
    }

    if (hasActiveAppointmentPath) {
      setAppointmentSubmenuOpen(true);
    }
  }, [hasActiveAppointmentPath, hasActiveDoctorPath]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };

  const topLinks = [
    {
      label: "Dashboard",
      to: "/patient/home",
      icon: DashboardIcon,
    },
    {
      label: "My Profile",
      to: "/patient/profile",
      icon: AccountCircleIcon,
    },
  ];

  const toolLinks = [
    {
      label: "Health Recommendation",
      to: "/patient/health-recommendation",
      icon: FavoriteIcon,
    },
    {
      label: "AI Health Support",
      to: "/patient/health-support-chat",
      icon: ChatIcon,
    },
    {
      label: "Doctor Articles",
      to: "/patient/articles",
      icon: ArticleIcon,
    },
  ];

  const menuItemClasses = (active) =>
    [
      "group flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition-all duration-200",
      active
        ? "bg-slate-900 text-white shadow-sm"
        : "text-slate-600 hover:bg-white hover:text-slate-900 hover:shadow-sm",
    ].join(" ");

  const iconWrapperClasses = (active) =>
    [
      "flex h-10 w-10 items-center justify-center rounded-xl border transition-colors duration-200",
      active
        ? "border-white/10 bg-white/10 text-white"
        : "border-slate-200 bg-white text-slate-500 group-hover:border-slate-300 group-hover:text-slate-900",
    ].join(" ");

  const subLinkClasses = (active) =>
    [
      "flex items-center rounded-xl px-3 py-2.5 text-sm font-medium transition-colors duration-200",
      active
        ? "bg-slate-200 text-slate-900"
        : "text-slate-500 hover:bg-white hover:text-slate-900",
    ].join(" ");

  const renderLink = ({ label, to, icon: Icon }) => {
    const active = isPathActive(to);

    return (
      <li key={to}>
        <Link to={to} className={menuItemClasses(active)}>
          <span className={iconWrapperClasses(active)}>
            <Icon fontSize="small" />
          </span>
          <span className="text-sm font-semibold tracking-tight">{label}</span>
        </Link>
      </li>
    );
  };

  return (
    <aside className="flex h-screen w-72 shrink-0 flex-col border-r border-slate-200 bg-slate-50">
      <div className="border-b border-slate-200 px-6 py-6">
        <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-slate-400">
          Health Management
        </p>
        <div className="mt-4 flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-900 text-sm font-semibold text-white shadow-sm">
            H
          </div>
          <div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-900">
              HMS
            </h1>
            <p className="text-sm text-slate-500">Patient workspace</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="space-y-6">
          <section>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Overview
            </p>
            <ul className="mt-3 space-y-1.5">{topLinks.map(renderLink)}</ul>
          </section>

          <section>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Care Services
            </p>
            <ul className="mt-3 space-y-1.5">
              <li>
                <button
                  type="button"
                  onClick={() => setDoctorSubmenuOpen((prev) => !prev)}
                  className={menuItemClasses(hasActiveDoctorPath)}
                >
                  <span className={iconWrapperClasses(hasActiveDoctorPath)}>
                    <MedicalServicesIcon fontSize="small" />
                  </span>
                  <span className="flex-1 text-sm font-semibold tracking-tight">
                    Doctors
                  </span>
                  {doctorSubmenuOpen ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </button>

                {doctorSubmenuOpen && (
                  <ul className="ml-8 mt-2 space-y-1 border-l border-slate-200 pl-4">
                    <li>
                      <Link
                        to="/patient/doctor/all"
                        className={subLinkClasses(isPathActive("/patient/doctor/all"))}
                      >
                        Doctor List
                      </Link>
                    </li>
                  </ul>
                )}
              </li>

              <li>
                <button
                  type="button"
                  onClick={() => setAppointmentSubmenuOpen((prev) => !prev)}
                  className={menuItemClasses(hasActiveAppointmentPath)}
                >
                  <span
                    className={iconWrapperClasses(hasActiveAppointmentPath)}
                  >
                    <LocalPharmacyIcon fontSize="small" />
                  </span>
                  <span className="flex-1 text-sm font-semibold tracking-tight">
                    Appointments
                  </span>
                  {appointmentSubmenuOpen ? (
                    <ExpandLessIcon fontSize="small" />
                  ) : (
                    <ExpandMoreIcon fontSize="small" />
                  )}
                </button>

                {appointmentSubmenuOpen && (
                  <ul className="ml-8 mt-2 space-y-1 border-l border-slate-200 pl-4">
                    <li>
                      <Link
                        to="/patient/appointment/available"
                        className={subLinkClasses(
                          isPathActive("/patient/appointment/available")
                        )}
                      >
                        Available Appointments
                      </Link>
                    </li>
                    <li>
                      <Link
                        to="/patient/appointment/all"
                        className={subLinkClasses(isPathActive("/patient/appointment/all"))}
                      >
                        Booked Appointments
                      </Link>
                    </li>
                  </ul>
                )}
              </li>
            </ul>
          </section>

          <section>
            <p className="px-3 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-400">
              Health Tools
            </p>
            <ul className="mt-3 space-y-1.5">{toolLinks.map(renderLink)}</ul>
          </section>
        </div>
      </div>

      <div className="border-t border-slate-200 px-4 py-4">
        <button
          type="button"
          onClick={handleLogout}
          className="group flex w-full items-center gap-3 rounded-2xl border border-transparent px-3 py-3 text-left text-slate-500 transition-all duration-200 hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition-colors duration-200 group-hover:border-rose-200 group-hover:text-rose-600">
            <LogoutIcon fontSize="small" />
          </span>
          <span className="text-sm font-semibold tracking-tight">Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
