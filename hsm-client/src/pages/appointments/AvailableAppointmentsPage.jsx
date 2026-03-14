import PatientSidebar from "../../components/sidebar/PatientSidebar";
import Navbar from "../../components/navbar/Navbar";
import AvailableAppointments from "../../components/appointments/AvailableAppointments";

const AvailableAppointmentsPage = () => {
  return (
    <div className="flex min-h-screen">
      <div className="w-56">
        <PatientSidebar />
      </div>

      <div className="flex-1">
        <Navbar />
        <div className="p-4">
          <AvailableAppointments />
        </div>
      </div>
    </div>
  );
};

export default AvailableAppointmentsPage;
