import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  HeartIcon,
  UserIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  CalendarIcon,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import axiosInstanceCDSSService from "../../utils/axiosInstanceCDSSService";
import axiosInstanceDoctorService from "../../utils/axiosInstanceDoctorService";
import axiosInstanceInventoryService from "../../utils/axiosInstanceInventoryService";
import axiosInstancePatientService from "../../utils/axiosInstancePatientService";

const AppointmentHealthRecommendation = ({
  appointmentId,
  doctorId,
  patientId,
}) => {
  const [recommendation, setRecommendation] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecommendation = async () => {
      try {
        setLoading(true);

        const [recommendationsResult, healthRecordsResult] =
          await Promise.allSettled([
            axiosInstanceCDSSService.get("/from-doctor/get/byPatient"),
            patientId
              ? axiosInstancePatientService.get(`/health-records/patient/${patientId}`)
              : Promise.resolve({ data: [] }),
          ]);

        if (recommendationsResult.status !== "fulfilled") {
          throw recommendationsResult.reason;
        }

        const allRecommendations = recommendationsResult.value.data || [];
        const matchingByAppointment = allRecommendations.find(
          (item) => Number(item.appointmentId) === Number(appointmentId)
        );
        const matchingByDoctor = [...allRecommendations]
          .filter((item) => item.doctorId === doctorId)
          .sort(
            (left, right) =>
              new Date(right.createdDate || 0).getTime() -
              new Date(left.createdDate || 0).getTime()
          )[0];

        const selectedRecommendation =
          matchingByAppointment || matchingByDoctor || null;

        if (!selectedRecommendation) {
          setRecommendation(null);
          setHealthMetrics([]);
          return;
        }

        const [doctorResponse, medicines] = await Promise.all([
          selectedRecommendation.doctorId
            ? axiosInstanceDoctorService.get(`/id/${selectedRecommendation.doctorId}`)
            : Promise.resolve({ data: null }),
          Promise.all(
            (selectedRecommendation.items || []).map(async (item) => {
              try {
                const response = await axiosInstanceInventoryService.get(
                  `/medicine/get/${item.medicalId}`
                );

                return {
                  id: item.medicalId,
                  name: response.data?.medicineName || `Medicine ID: ${item.medicalId}`,
                  frequency: item.frequency,
                };
              } catch (error) {
                console.error(`Error fetching medicine ${item.medicalId}:`, error);
                return {
                  id: item.medicalId,
                  name: `Medicine ID: ${item.medicalId}`,
                  frequency: item.frequency,
                };
              }
            })
          ),
        ]);

        const doctor = doctorResponse.data;
        const healthRecords =
          healthRecordsResult.status === "fulfilled"
            ? healthRecordsResult.value.data || []
            : [];
        const latestHealthRecord = [...healthRecords]
          .sort(
            (left, right) =>
              new Date(right.checkupDate || 0).getTime() -
              new Date(left.checkupDate || 0).getTime()
          )
          .at(0);

        setRecommendation({
          id: selectedRecommendation.id,
          doctorName: doctor
            ? `Dr. ${doctor.firstName} ${doctor.lastName}`
            : "Doctor",
          specialty:
            doctor?.specialization ||
            doctor?.department ||
            doctor?.designation ||
            "General Practitioner",
          date: selectedRecommendation.createdDate,
          content: selectedRecommendation.recommendationMessage,
          medications: medicines,
          followUp: selectedRecommendation.rescheduleAppointment,
        });
        setHealthMetrics(buildHealthMetrics(latestHealthRecord));
      } catch (error) {
        console.error("Error fetching appointment recommendation:", error);
        toast.error("Failed to load health tips");
        setRecommendation(null);
        setHealthMetrics([]);
      } finally {
        setLoading(false);
      }
    };

    fetchRecommendation();
  }, [appointmentId, doctorId, patientId]);

  const getStatusColor = (status) => {
    switch (status) {
      case "high":
        return "text-red-600 bg-red-50";
      case "low":
        return "text-blue-600 bg-blue-50";
      case "normal":
        return "text-green-600 bg-green-50";
      default:
        return "text-gray-600 bg-gray-50";
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
      <div className="bg-white rounded-xl shadow-lg p-6">
        <div className="animate-pulse">
          <div className="mb-4 h-6 w-1/3 rounded bg-gray-300"></div>
          <div className="space-y-3">
            {[1, 2, 3].map((item) => (
              <div key={item} className="h-4 rounded bg-gray-300"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-6 text-center">
        <HeartIcon className="mx-auto mb-3 h-12 w-12 text-gray-400" />
        <p className="text-gray-500">
          No health tips are available for this appointment yet.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-xl bg-white shadow-lg">
        <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
          <div className="flex items-center space-x-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-white">
              <UserIcon className="h-8 w-8 text-blue-500" />
            </div>
            <div>
              <h2 className="text-xl font-bold">{recommendation.doctorName}</h2>
              <p className="text-blue-100">{recommendation.specialty}</p>
              <div className="mt-2 flex items-center text-blue-100">
                <CalendarIcon className="mr-1 h-4 w-4" />
                <span className="text-sm">
                  {formatDate(recommendation.date)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <h3 className="mb-2 text-lg font-semibold text-gray-900">
              Health Tips
            </h3>
            <div className="rounded-lg border border-blue-200 bg-blue-50 p-4">
              <p className="whitespace-pre-line leading-relaxed text-gray-800">
                {recommendation.content}
              </p>
            </div>
          </div>

          {healthMetrics.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Latest Health Metrics
              </h3>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                {healthMetrics.map((metric) => (
                  <div
                    key={metric.id}
                    className={`rounded-lg border p-4 ${getStatusColor(
                      metric.status
                    )}`}
                  >
                    <div className="mb-2 flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.name}</span>
                      {getStatusIcon(metric.status)}
                    </div>
                    <div className="mb-1 text-2xl font-bold">
                      {metric.value}{" "}
                      <span className="text-sm font-normal">{metric.unit}</span>
                    </div>
                    <div className="text-xs opacity-75">
                      <div>Normal: {metric.normalRange}</div>
                      <div>Checked: {metric.measuredAt}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendation.medications.length > 0 && (
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-semibold text-gray-900">
                Prescribed Medicines
              </h3>
              <div className="space-y-3">
                {recommendation.medications.map((medicine) => (
                  <div
                    key={medicine.id}
                    className="rounded-lg border border-green-200 bg-green-50 p-4"
                  >
                    <div className="flex items-start">
                      <HeartSolid className="mr-3 mt-0.5 h-5 w-5 flex-shrink-0 text-green-500" />
                      <div>
                        <h4 className="font-semibold text-green-800">
                          {medicine.name}
                        </h4>
                        <p className="mt-1 text-green-700">
                          {medicine.frequency}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {recommendation.followUp && (
            <div className="rounded-lg border border-indigo-200 bg-indigo-50 p-4">
              <h3 className="mb-2 text-lg font-semibold text-indigo-800">
                Follow-up Date
              </h3>
              <p className="font-medium text-indigo-700">
                {formatDate(recommendation.followUp)}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

AppointmentHealthRecommendation.propTypes = {
  appointmentId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  doctorId: PropTypes.string,
  patientId: PropTypes.string,
};

export default AppointmentHealthRecommendation;

function buildHealthMetrics(latestHealthRecord) {
  if (!latestHealthRecord) {
    return [];
  }

  const metrics = [];
  const measuredAt = formatDate(latestHealthRecord.checkupDate);

  if (latestHealthRecord.bloodPressure) {
    metrics.push({
      id: "blood-pressure",
      name: "Blood Pressure",
      value: latestHealthRecord.bloodPressure,
      unit: "mmHg",
      status: getBloodPressureStatus(latestHealthRecord.bloodPressure),
      normalRange: "< 130/80",
      measuredAt,
    });
  }

  if (latestHealthRecord.pulseRate) {
    metrics.push({
      id: "pulse-rate",
      name: "Pulse",
      value: latestHealthRecord.pulseRate,
      unit: "bpm",
      status: getRangeStatus(Number(latestHealthRecord.pulseRate), 60, 100),
      normalRange: "60-100",
      measuredAt,
    });
  }

  if (latestHealthRecord.weightInKg) {
    metrics.push({
      id: "weight",
      name: "Weight",
      value: latestHealthRecord.weightInKg,
      unit: "kg",
      status: "normal",
      normalRange: "By patient profile",
      measuredAt,
    });
  }

  if (latestHealthRecord.heightInCm && latestHealthRecord.weightInKg) {
    const bmi =
      latestHealthRecord.weightInKg /
      (latestHealthRecord.heightInCm / 100) ** 2;

    metrics.push({
      id: "bmi",
      name: "BMI",
      value: bmi.toFixed(1),
      unit: "",
      status: getRangeStatus(bmi, 18.5, 24.9),
      normalRange: "18.5-24.9",
      measuredAt,
    });
  }

  return metrics;
}

function getBloodPressureStatus(bloodPressure) {
  const [systolic, diastolic] = String(bloodPressure)
    .split("/")
    .map((value) => Number.parseInt(value, 10));

  if (Number.isNaN(systolic) || Number.isNaN(diastolic)) {
    return "normal";
  }

  return systolic >= 140 || diastolic >= 90 ? "high" : "normal";
}

function getRangeStatus(value, min, max) {
  if (Number.isNaN(value)) {
    return "normal";
  }

  if (value < min) {
    return "low";
  }

  if (value > max) {
    return "high";
  }

  return "normal";
}

function formatDate(value) {
  if (!value) {
    return "Not available";
  }

  return new Date(value).toLocaleDateString("en-GB");
}
