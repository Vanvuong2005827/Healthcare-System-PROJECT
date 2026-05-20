// import DoctorSidebar from "../../components/sidebar/DoctorSidebar";
import Navbar from "../../components/navbar/Navbar";
import AppointmentPatientBooked from "../../components/doctor-appointment/appointmentPatientBooked";
import Sidebar from "../../components/sidebar/PatientSidebar";
const AppointmentPatientBookedPage = () => {
  return (
    <div className="flex min-h-screen bg-slate-100">
      <Sidebar />

      <main className="flex-1 px-4 py-4 md:px-6">
        <Navbar />
        <div className="mx-auto max-w-7xl">
          <AppointmentPatientBooked />
        </div>
      </main>
    </div>
  );
};

export default AppointmentPatientBookedPage;
