import { useState } from "react";
import { Link } from "react-router-dom";
import DashboardIcon from "@mui/icons-material/Dashboard";
import PersonAddAltIcon from "@mui/icons-material/PersonAddAlt";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import LogoutIcon from "@mui/icons-material/Logout";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import HealthAndSafetyIcon from "@mui/icons-material/HealthAndSafety";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import ArticleIcon from "@mui/icons-material/Article";
import { useNavigate } from "react-router-dom";

const Sidebar = () => {
  const navigate = useNavigate();
  const [patientSubmenuOpen, setPatientSubmenuOpen] = useState(false);
  const [doctorSubmenuOpen, setDoctorSubmenuOpen] = useState(false);
  const [healthSubmenuOpen, setHealthSubmenuOpen] = useState(false);
  const [articlesSubmenuOpen, setArticlesSubmenuOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    navigate("/login");
  };
  return (
    <div className="flex flex-col w-56 h-screen border-r border-gray-200 bg-white">
      <div className="flex items-center justify-center h-12">
        <span className="text-xl font-bold text-purple-600">HMS</span>
      </div>
      <hr />
      <div className="flex-grow overflow-auto">
        <ul className="p-2">
          {/* Main Options */}
          <li className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer mb-2">
            <DashboardIcon className="text-white" />
            <Link
              to="/doctor/dashboard"
              className="ml-4 text-base font-semibold text-white"
            >
              Dashboard
            </Link>
          </li>

          {/* Profile Section */}
          <li className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer mb-2">
            <AccountCircleIcon className="text-white" />
            <Link
              to="/doctor/profile"
              className="ml-4 text-base font-semibold text-white"
            >
              My Profile
            </Link>
          </li>
          {/* Patient Section */}
          <li className="mb-2">
            <div
              className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer"
              onClick={() => setPatientSubmenuOpen(!patientSubmenuOpen)}
            >
              <PersonAddAltIcon className="text-white" />
              <span className="flex-grow ml-4 text-base font-semibold text-white">
                Patients
              </span>
              {patientSubmenuOpen ? (
                <ExpandLessIcon className="text-white" />
              ) : (
                <ExpandMoreIcon className="text-white" />
              )}
            </div>
            {patientSubmenuOpen && (
              <ul className="mt-0">
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link to="/doctor/patient/all" className="text-black">
                    Patient List
                  </Link>
                </li>
                {/* Additional submenu items can be added here */}
              </ul>
            )}
          </li>
          {/* ... Dashboard, Patients ... */}
          {/* Doctor Section */}
          <li className="mb-2">
            <div
              className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer"
              onClick={() => setDoctorSubmenuOpen(!doctorSubmenuOpen)}
            >
              <MedicalServicesIcon className="text-white" />
              <span className="flex-grow ml-4 text-base font-semibold text-white">
                Appointment
              </span>
              {doctorSubmenuOpen ? (
                <ExpandLessIcon className="text-white" />
              ) : (
                <ExpandMoreIcon className="text-white" />
              )}
            </div>
            {doctorSubmenuOpen && (
              <ul className="mt-0">
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link to="/doctor/appointment/create" className="text-black">
                    Create Appointments
                  </Link>
                </li>
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link to="/doctor/appointment/getall" className="text-black">
                    Available Appointments
                  </Link>
                </li>
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link
                    to="/doctor/appointment/booked/getall"
                    className="text-black"
                  >
                    Booked Appointments
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Health Recommendations Section */}
          <li className="mb-2">
            <div
              className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer"
              onClick={() => setHealthSubmenuOpen(!healthSubmenuOpen)}
            >
              <HealthAndSafetyIcon className="text-white" />
              <span className="flex-grow ml-4 text-base font-semibold text-white">
                Health Recommendations
              </span>
              {healthSubmenuOpen ? (
                <ExpandLessIcon className="text-white" />
              ) : (
                <ExpandMoreIcon className="text-white" />
              )}
            </div>
            {healthSubmenuOpen && (
              <ul className="mt-0">
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link
                    to="/doctor/health-recommendations"
                    className="text-black"
                  >
                    View All Recommendations
                  </Link>
                </li>
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link
                    to="/doctor/health-recommendation/create"
                    className="text-black"
                  >
                    Create Recommendation
                  </Link>
                </li>
              </ul>
            )}
          </li>

          {/* Articles Section */}
          <li className="mb-2">
            <div
              className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer"
              onClick={() => setArticlesSubmenuOpen(!articlesSubmenuOpen)}
            >
              <ArticleIcon className="text-white" />
              <span className="flex-grow ml-4 text-base font-semibold text-white">
                Articles
              </span>
              {articlesSubmenuOpen ? (
                <ExpandLessIcon className="text-white" />
              ) : (
                <ExpandMoreIcon className="text-white" />
              )}
            </div>
            {articlesSubmenuOpen && (
              <ul className="mt-0">
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link to="/doctor/articles" className="text-black">
                    My Articles
                  </Link>
                </li>
                <li className="py-1 text-base font-semibold hover:bg-gray-100 border border-gray-200 pl-10">
                  <Link to="/doctor/articles/create" className="text-black">
                    Create Article
                  </Link>
                </li>
              </ul>
            )}
          </li>

          <li
            className="flex items-center p-2 hover:bg-blue-600 bg-blue-500 cursor-pointer mb-2"
            onClick={handleLogout} // Add onClick handler for logout
          >
            <LogoutIcon className="text-white" />
            <span className="ml-4 text-base font-semibold text-white">
              Logout
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default Sidebar;
