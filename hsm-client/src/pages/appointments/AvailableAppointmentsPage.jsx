import PatientSidebar from "../../components/sidebar/PatientSidebar";
import Navbar from "../../components/navbar/Navbar";
import AvailableAppointments from "../../components/appointments/AvailableAppointments";

const AvailableAppointmentsPage = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <PatientSidebar />

      <main className="flex-1 px-4 py-4 md:px-6">
        <Navbar />
        <div className="mx-auto max-w-7xl">
          <AvailableAppointments />
        </div>
      </main>
    </div>
  );
};

export default AvailableAppointmentsPage;
