import { useEffect, useMemo, useState } from "react";
import PropTypes from "prop-types";
import { toast } from "react-toastify";
import {
  FaCalendarAlt,
  FaHeart,
  FaPills,
  FaPlus,
  FaSave,
  FaTimes,
  FaTrash,
  FaUserInjured,
} from "react-icons/fa";
import axiosInstanceCDSSService from "../../utils/axiosInstanceCDSSService";
import axiosInstanceInventoryService from "../../utils/axiosInstanceInventoryService";

const FREQUENCY_OPTIONS = [
  "1 time per day",
  "2 times per day",
  "3 times per day",
  "Once daily",
  "Twice daily",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime",
];

const buildInitialForm = (existingRecommendation) => ({
  recommendationMessage: existingRecommendation?.recommendationMessage || "",
  rescheduleAppointment: existingRecommendation?.rescheduleAppointment || "",
  items: (existingRecommendation?.items || []).map((item) => ({
    medicalId: item.medicalId,
    medicineName: item.medicineName || `Medicine ID: ${item.medicalId}`,
    frequency: item.frequency || FREQUENCY_OPTIONS[0],
  })),
});

const HealthTipEditorModal = ({
  appointment,
  existingRecommendation,
  isOpen,
  onClose,
  onSaved,
}) => {
  const [formData, setFormData] = useState(buildInitialForm(existingRecommendation));
  const [saving, setSaving] = useState(false);
  const [medicines, setMedicines] = useState([]);
  const [loadingMedicines, setLoadingMedicines] = useState(false);
  const [showMedicineModal, setShowMedicineModal] = useState(false);
  const [searchMedicine, setSearchMedicine] = useState("");

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setFormData(buildInitialForm(existingRecommendation));
  }, [existingRecommendation, isOpen]);

  useEffect(() => {
    if (!isOpen || medicines.length > 0) {
      return;
    }

    const fetchMedicines = async () => {
      try {
        setLoadingMedicines(true);
        const response = await axiosInstanceInventoryService.get(
          "/medicine/get-all"
        );
        setMedicines(response.data || []);
      } catch (error) {
        console.error("Error fetching medicines:", error);
        toast.error("Failed to fetch medicines");
      } finally {
        setLoadingMedicines(false);
      }
    };

    fetchMedicines();
  }, [isOpen, medicines.length]);

  const filteredMedicines = useMemo(() => {
    const search = searchMedicine.trim().toLowerCase();

    return medicines.filter((medicine) => {
      const medicineName = medicine.medicineName?.toLowerCase() || "";
      return medicineName.includes(search);
    });
  }, [medicines, searchMedicine]);

  if (!isOpen || !appointment) {
    return null;
  }

  const appointmentId = appointment.appointmentId;
  const patientId = appointment.patientId;
  const patientName = appointment.patientDetails
    ? `${appointment.patientDetails.firstName} ${appointment.patientDetails.lastName}`
    : patientId;

  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleAddMedicine = (medicine) => {
    const medicalId = medicine.medicineId || medicine.id;
    const exists = formData.items.some(
      (item) => Number(item.medicalId) === Number(medicalId)
    );

    if (exists) {
      toast.warning("This medicine is already added");
      return;
    }

    setFormData((previous) => ({
      ...previous,
      items: [
        ...previous.items,
        {
          medicalId,
          medicineName: medicine.medicineName,
          frequency: FREQUENCY_OPTIONS[0],
        },
      ],
    }));
    setShowMedicineModal(false);
    setSearchMedicine("");
  };

  const handleRemoveMedicine = (medicalId) => {
    setFormData((previous) => ({
      ...previous,
      items: previous.items.filter(
        (item) => Number(item.medicalId) !== Number(medicalId)
      ),
    }));
  };

  const handleFrequencyChange = (medicalId, frequency) => {
    setFormData((previous) => ({
      ...previous,
      items: previous.items.map((item) =>
        Number(item.medicalId) === Number(medicalId)
          ? { ...item, frequency }
          : item
      ),
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.recommendationMessage.trim()) {
      toast.error("Please enter health tips for the patient");
      return;
    }

    const payload = {
      patientId,
      appointmentId,
      recommendationMessage: formData.recommendationMessage.trim(),
      rescheduleAppointment: formData.rescheduleAppointment || null,
      items: formData.items.map((item) => ({
        medicalId: Number(item.medicalId),
        frequency: item.frequency,
      })),
    };

    try {
      setSaving(true);

      if (existingRecommendation?.id) {
        await axiosInstanceCDSSService.put(
          `/from-doctor/edit/${existingRecommendation.id}`,
          payload
        );
        toast.success("Health tips updated successfully");
      } else {
        await axiosInstanceCDSSService.post("/from-doctor/create", payload);
        toast.success("Health tips created successfully");
      }

      if (onSaved) {
        await onSaved();
      }
      onClose?.();
    } catch (error) {
      console.error("Error saving health tips:", error);
      toast.error(
        error?.response?.data?.message || "Failed to save health tips"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white shadow-2xl">
        <div className="sticky top-0 flex items-center justify-between border-b border-gray-200 bg-white px-6 py-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {existingRecommendation ? "Edit Health Tips" : "Add Health Tips"}
            </h2>
            <p className="mt-1 text-sm text-gray-600">
              Appointment #{appointmentId} for {patientName}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-500 transition-colors hover:text-gray-700"
          >
            <FaTimes className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 p-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaUserInjured className="h-4 w-4 text-blue-500" />
                Patient
              </div>
              <p className="font-semibold text-gray-900">{patientName}</p>
              <p className="text-sm text-gray-600">ID: {patientId}</p>
            </div>

            <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
              <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaCalendarAlt className="h-4 w-4 text-orange-500" />
                Follow-up Date
              </label>
              <input
                type="date"
                name="rescheduleAppointment"
                value={formData.rescheduleAppointment}
                onChange={handleInputChange}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-2 flex items-center gap-2 text-sm font-medium text-gray-700">
              <FaHeart className="h-4 w-4 text-green-500" />
              Health Tips
            </label>
            <textarea
              name="recommendationMessage"
              value={formData.recommendationMessage}
              onChange={handleInputChange}
              rows={6}
              className="w-full rounded-lg border border-gray-300 px-4 py-3 focus:border-blue-500 focus:outline-none"
              placeholder="Enter diagnosis summary, health advice, or follow-up instructions for the patient..."
            />
          </div>

          <div>
            <div className="mb-3 flex items-center justify-between">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-700">
                <FaPills className="h-4 w-4 text-purple-500" />
                Prescribed Medicines
              </label>
              <button
                type="button"
                onClick={() => setShowMedicineModal(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-green-500 px-3 py-2 text-sm font-medium text-white transition-colors hover:bg-green-600"
              >
                <FaPlus className="h-3.5 w-3.5" />
                Add Medicine
              </button>
            </div>

            {formData.items.length > 0 ? (
              <div className="space-y-3">
                {formData.items.map((item) => (
                  <div
                    key={item.medicalId}
                    className="flex flex-col gap-3 rounded-lg border border-gray-200 bg-gray-50 p-4 md:flex-row md:items-center"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {item.medicineName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Medicine ID: {item.medicalId}
                      </p>
                    </div>

                    <select
                      value={item.frequency}
                      onChange={(event) =>
                        handleFrequencyChange(item.medicalId, event.target.value)
                      }
                      className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                    >
                      {FREQUENCY_OPTIONS.map((option) => (
                        <option key={option} value={option}>
                          {option}
                        </option>
                      ))}
                    </select>

                    <button
                      type="button"
                      onClick={() => handleRemoveMedicine(item.medicalId)}
                      className="inline-flex items-center justify-center rounded-lg p-2 text-red-600 transition-colors hover:bg-red-50"
                    >
                      <FaTrash className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border-2 border-dashed border-gray-300 px-4 py-8 text-center text-sm text-gray-500">
                No medicines added yet.
              </div>
            )}
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-gray-300 px-4 py-2 text-gray-700 transition-colors hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 font-medium text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <FaSave className="h-4 w-4" />
              {saving ? "Saving..." : existingRecommendation ? "Update" : "Save"}
            </button>
          </div>
        </form>
      </div>

      {showMedicineModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
          <div className="max-h-[80vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white shadow-2xl">
            <div className="flex items-center justify-between bg-green-500 px-5 py-4 text-white">
              <h3 className="text-lg font-semibold">Select Medicine</h3>
              <button
                type="button"
                onClick={() => setShowMedicineModal(false)}
                className="transition-colors hover:text-green-100"
              >
                <FaTimes className="h-5 w-5" />
              </button>
            </div>

            <div className="p-5">
              <input
                type="text"
                value={searchMedicine}
                onChange={(event) => setSearchMedicine(event.target.value)}
                placeholder="Search medicines..."
                className="mb-4 w-full rounded-lg border border-gray-300 px-4 py-2 focus:border-blue-500 focus:outline-none"
              />

              {loadingMedicines ? (
                <div className="py-8 text-center text-sm text-gray-500">
                  Loading medicines...
                </div>
              ) : filteredMedicines.length > 0 ? (
                <div className="space-y-2">
                  {filteredMedicines.map((medicine) => (
                    <button
                      key={medicine.medicineId || medicine.id}
                      type="button"
                      onClick={() => handleAddMedicine(medicine)}
                      className="w-full rounded-lg border border-gray-200 p-3 text-left transition-colors hover:bg-gray-50"
                    >
                      <p className="font-medium text-gray-900">
                        {medicine.medicineName}
                      </p>
                      <p className="text-sm text-gray-500">
                        Type: {medicine.medicineType} | Stock: {medicine.quantity}
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-sm text-gray-500">
                  No medicines found.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

HealthTipEditorModal.propTypes = {
  appointment: PropTypes.shape({
    appointmentId: PropTypes.number,
    patientId: PropTypes.string,
    patientDetails: PropTypes.shape({
      firstName: PropTypes.string,
      lastName: PropTypes.string,
    }),
  }),
  existingRecommendation: PropTypes.shape({
    id: PropTypes.number,
    recommendationMessage: PropTypes.string,
    rescheduleAppointment: PropTypes.string,
    items: PropTypes.arrayOf(
      PropTypes.shape({
        medicalId: PropTypes.number,
        medicineName: PropTypes.string,
        frequency: PropTypes.string,
      })
    ),
  }),
  isOpen: PropTypes.bool,
  onClose: PropTypes.func,
  onSaved: PropTypes.func,
};

export default HealthTipEditorModal;
