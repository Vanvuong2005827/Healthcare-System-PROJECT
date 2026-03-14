import { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import axiosInstanceCDSSService from "../../utils/axiosInstanceCDSSService";
import axiosInstanceInventoryService from "../../utils/axiosInstanceInventoryService";
import axiosInstanceDoctorService from "../../utils/axiosInstanceDoctorService";
import {
  HeartIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ClockIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";

const HealthRecommendation = ({ patientId, appointmentId }) => {
  const [activeTab, setActiveTab] = useState("recommendations");
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [healthRecords, setHealthRecords] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real data from APIs
  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setLoading(true);

        // Fetch health recommendations for patient
        const recommendationsResponse = await axiosInstanceCDSSService.get(
          `/from-doctor/get/byPatient`
        );
        const recommendationsData = recommendationsResponse.data || [];

        // Fetch medicine details and doctor info for each recommendation
        const enrichedRecommendations = await Promise.all(
          recommendationsData.map(async (rec) => {
            const medicines = [];
            let doctorInfo = {
              name: "Unknown",
              specialty: "General Practitioner",
            };

            // Fetch doctor information
            if (rec.doctorId) {
              try {
                const doctorResponse = await axiosInstanceDoctorService.get(
                  `/id/${rec.doctorId}`
                );
                const doctor = doctorResponse.data;
                doctorInfo = {
                  name: `${doctor.firstName} ${doctor.lastName}`,
                  specialty: doctor.specialty || "General Practitioner",
                };
              } catch (error) {
                console.error(`Error fetching doctor ${rec.doctorId}:`, error);
              }
            }

            if (rec.items && rec.items.length > 0) {
              for (const item of rec.items) {
                try {
                  const medicineResponse =
                    await axiosInstanceInventoryService.get(
                      `/medicine/get/${item.medicalId}`
                    );
                  const medicine = medicineResponse.data;
                  medicines.push(
                    `${medicine.medicineName} - ${item.frequency}`
                  );
                } catch (error) {
                  console.error(
                    `Error fetching medicine ${item.medicalId}:`,
                    error
                  );
                  medicines.push(
                    `Medicine ID: ${item.medicalId} - ${item.frequency}`
                  );
                }
              }
            }

            return {
              id: rec.id,
              doctorName: "Dr. " + doctorInfo.name,
              specialty: doctorInfo.specialty,
              date: rec.createdDate
                ? new Date(rec.createdDate).toLocaleDateString()
                : "Unknown",
              priority: rec.priority || "medium",
              title: "Health Recommendation",
              content: rec.recommendationMessage,
              medications: medicines,
              followUp: rec.rescheduleAppointment
                ? new Date(rec.rescheduleAppointment).toLocaleDateString()
                : null,
            };
          })
        );

        setRecommendations(enrichedRecommendations);

        // Mock health records for now - you can replace this with actual health records API
        setHealthRecords([
          {
            id: 1,
            date: new Date().toLocaleDateString(),
            type: "Last Check-up",
            value: "Normal",
            status: "normal",
            doctor: "Healthcare Team",
          },
        ]);
      } catch (error) {
        console.error("Error fetching recommendations:", error);
        toast.error("Failed to fetch health recommendations");
        setRecommendations([]);
        setHealthRecords([]);
      } finally {
        setLoading(false);
      }
    };

    if (patientId) {
      fetchRecommendations();
    } else {
      // If no patientId, show empty state
      setLoading(false);
      setRecommendations([]);
      setHealthRecords([]);
    }
  }, [patientId, appointmentId]);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200";
      case "medium":
        return "text-yellow-600 bg-yellow-50 border-yellow-200";
      case "low":
        return "text-green-600 bg-green-50 border-green-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "high":
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />;
      case "normal":
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />;
      case "low":
        return <InformationCircleIcon className="w-5 h-5 text-blue-500" />;
      default:
        return <InformationCircleIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-32 bg-gray-300 rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-4">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full">
                <HeartSolid className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Health Recommendations
                </h1>
                <p className="text-gray-600">
                  Lời khuyên sức khỏe từ các bác sĩ
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => setActiveTab("recommendations")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "recommendations"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <HeartIcon className="w-5 h-5 inline mr-2" />
                Lời khuyên
              </button>
              <button
                onClick={() => setActiveTab("records")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  activeTab === "records"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <DocumentTextIcon className="w-5 h-5 inline mr-2" />
                Health Records
              </button>
            </div>
          </div>
        </div>

        {/* Content */}
        {activeTab === "recommendations" && (
          <div className="space-y-6">
            {recommendations.length > 0 ? (
              recommendations.map((rec) => (
                <div
                  key={rec.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden"
                >
                  <div
                    className={`p-4 border-l-4 ${
                      rec.priority === "high"
                        ? "border-red-500 bg-red-50"
                        : rec.priority === "medium"
                        ? "border-yellow-500 bg-yellow-50"
                        : "border-green-500 bg-green-50"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-white rounded-full shadow-sm">
                          <UserIcon className="w-6 h-6 text-gray-600" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {rec.doctorName}
                          </h3>
                          <p className="text-sm text-gray-600">
                            {rec.specialty}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(
                            rec.priority
                          )}`}
                        >
                          {rec.priority.toUpperCase()}
                        </span>
                        <span className="text-sm text-gray-500 flex items-center">
                          <ClockIcon className="w-4 h-4 mr-1" />
                          {rec.date}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <h4 className="text-xl font-semibold text-gray-900 mb-3">
                      {rec.title}
                    </h4>
                    <p className="text-gray-700 mb-4 leading-relaxed">
                      {rec.content}
                    </p>

                    {rec.medications && rec.medications.length > 0 && (
                      <div className="mb-4">
                        <h5 className="font-semibold text-gray-900 mb-2">
                          Thuốc được kê đơn:
                        </h5>
                        <ul className="space-y-1">
                          {rec.medications.map((med, index) => (
                            <li
                              key={index}
                              className="text-gray-700 flex items-center"
                            >
                              <div className="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
                              {med}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {rec.followUp && (
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm text-blue-800">
                          <strong>Lịch tái khám:</strong> {rec.followUp}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-white rounded-xl shadow-lg p-12 text-center">
                <div className="p-4 bg-gray-100 rounded-full w-16 h-16 mx-auto mb-4">
                  <HeartIcon className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No Health Recommendations
                </h3>
                <p className="text-gray-600">
                  No health recommendations available for this patient yet.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === "records" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Health Records
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {healthRecords.map((record) => (
                <div
                  key={record.id}
                  className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg p-4 border border-gray-200"
                >
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">
                      {record.type}
                    </h4>
                    {getStatusIcon(record.status)}
                  </div>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold text-gray-900">
                      {record.value}
                    </p>
                    <p className="text-sm text-gray-600">
                      Bác sĩ: {record.doctor}
                    </p>
                    <p className="text-xs text-gray-500">{record.date}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Health Trends Chart Placeholder */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
              <h4 className="text-lg font-semibold text-gray-900 mb-4">
                Health Trends
              </h4>
              <div className="h-64 bg-white rounded-lg border-2 border-dashed border-gray-300 flex items-center justify-center">
                <p className="text-gray-500">Chart sẽ được hiển thị ở đây</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

HealthRecommendation.propTypes = {
  patientId: PropTypes.string,
  appointmentId: PropTypes.string,
};

export default HealthRecommendation;
