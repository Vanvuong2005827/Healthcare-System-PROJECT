import { useEffect, useState } from "react";
import { FaHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import axiosInstanceAppointmentService from "../../utils/axiosInstanceAppointmentService";
import axiosInstanceCDSSService from "../../utils/axiosInstanceCDSSService";
import axiosInstanceDoctorService from "../../utils/axiosInstanceDoctorService";
import axiosInstancePatientService from "../../utils/axiosInstancePatientService";
import HealthTipEditorModal from "./HealthTipEditorModal";

const DoctorBookedAppointments = () => {
  const [bookedAppointments, setBookedAppointments] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [selectedDate, setSelectedDate] = useState(
    new Date().toISOString().split("T")[0]
  );
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [showHealthTipModal, setShowHealthTipModal] = useState(false);

  useEffect(() => {
    fetchBookedAppointments();
  }, []);

  const fetchBookedAppointments = async () => {
    try {
      const doctorProfileResponse = await axiosInstanceDoctorService.get(
        "/profile"
      );
      const doctorId = doctorProfileResponse?.data?.doctorId;

      if (!doctorId) {
        toast.error("Failed to resolve doctor profile");
        return;
      }

      if (!selectedDate) {
        toast.error("Please select a date.");
        return;
      }

      const [appointmentsResponse, recommendationsResponse] = await Promise.all([
        axiosInstanceAppointmentService.get(
          `/get/booked/doctor/${doctorId}/${selectedDate}`
        ),
        axiosInstanceCDSSService.get("/from-doctor/get/byDoctor"),
      ]);

      const appointmentsWithPatientDetails = await Promise.all(
        (appointmentsResponse.data || []).map(async (appointment) => {
          const patientResponse = await axiosInstancePatientService.get(
            `/id/${appointment.patientId}`
          );

          return {
            ...appointment,
            patientDetails: patientResponse.data,
          };
        })
      );

      setBookedAppointments(appointmentsWithPatientDetails);
      setRecommendations(recommendationsResponse.data || []);
    } catch (error) {
      console.error("Error fetching booked appointments:", error);
      toast.error("Failed to fetch data!");
      setBookedAppointments([]);
    }
  };

  const handleJoinTelemedicine = (patientId) => {
    window.open(`/room/${patientId}`, "_blank");
  };

  const handleOpenHealthTips = (appointment) => {
    setSelectedAppointment(appointment);
    setShowHealthTipModal(true);
  };

  const handleCloseHealthTips = () => {
    setSelectedAppointment(null);
    setShowHealthTipModal(false);
  };

  const handleHealthTipSaved = async () => {
    await fetchBookedAppointments();
  };

  const getRecommendationForAppointment = (appointmentId) => {
    return recommendations.find(
      (recommendation) => Number(recommendation.appointmentId) === Number(appointmentId)
    );
  };

  return (
    <>
      <div className="container mx-auto p-4">
        <h1 className="mb-4 text-xl font-semibold">
          Doctor&apos;s Booked Appointments
        </h1>
        <div className="mb-4 flex items-center">
          <input
            type="date"
            value={selectedDate}
            onChange={(event) => setSelectedDate(event.target.value)}
            className="mr-2 rounded border px-3 py-2 leading-tight text-gray-700 shadow focus:outline-none focus:shadow-outline"
          />
          <button
            onClick={fetchBookedAppointments}
            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            Fetch Appointments
          </button>
        </div>

        <table className="min-w-full table-auto bg-white shadow-lg">
          <thead className="bg-gray-800 text-white">
            <tr>
              <th className="px-4 py-2 text-center">Appointment ID</th>
              <th className="px-4 py-2 text-center">Patient Name</th>
              <th className="px-4 py-2 text-center">Gender</th>
              <th className="px-4 py-2 text-center">DOB</th>
              <th className="px-4 py-2 text-center">Appointment Type</th>
              <th className="px-4 py-2 text-center">Status</th>
              <th className="px-4 py-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {bookedAppointments.length > 0 ? (
              bookedAppointments.map((appointment) => {
                const existingRecommendation = getRecommendationForAppointment(
                  appointment.appointmentId
                );

                return (
                  <tr
                    key={appointment.appointmentId}
                    className="border-b align-middle"
                  >
                    <td className="border px-4 py-2 text-center">
                      {appointment.appointmentId}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {appointment.patientDetails.firstName}{" "}
                      {appointment.patientDetails.lastName}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {appointment.patientDetails.gender}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {appointment.patientDetails.dateOfBirth}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {appointment.appointmentType}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      {appointment.appointmentStatus}
                    </td>
                    <td className="border px-4 py-2 text-center">
                      <div className="flex flex-wrap items-center justify-center gap-2">
                        {appointment.appointmentType === "Telemedicine" && (
                          <button
                            onClick={() =>
                              handleJoinTelemedicine(appointment.patientId)
                            }
                            className="rounded bg-blue-500 px-4 py-2 font-bold text-white hover:bg-blue-700"
                          >
                            Join Telemedicine
                          </button>
                        )}
                        <button
                          onClick={() => handleOpenHealthTips(appointment)}
                          className="flex items-center gap-2 rounded bg-green-500 px-4 py-2 font-bold text-white hover:bg-green-700"
                        >
                          <FaHeart className="h-4 w-4" />
                          <span>
                            {existingRecommendation
                              ? "Edit Health Tips"
                              : "Add Health Tips"}
                          </span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="7" className="py-3 text-center">
                  No data found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <HealthTipEditorModal
        isOpen={showHealthTipModal}
        appointment={selectedAppointment}
        existingRecommendation={
          selectedAppointment
            ? getRecommendationForAppointment(selectedAppointment.appointmentId)
            : null
        }
        onClose={handleCloseHealthTips}
        onSaved={handleHealthTipSaved}
      />
    </>
  );
};

export default DoctorBookedAppointments;
