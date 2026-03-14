import { useState } from "react";
import PatientProfileInfo from "../../components/patients/PatientProfileInfo";
import PatientProfileEdit from "../../components/patients/PatientProfileEdit";
import PatientSidebar from "../../components/sidebar/PatientSidebar";
import Navbar from "../../components/navbar/Navbar";

const PatientProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    setIsEditing(false);
    // Optionally refresh the profile data here
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <div className="w-56 bg-white shadow-lg">
        <PatientSidebar />
      </div>

      {/* Main Content */}
      <div className="flex-1">
        {/* Navbar */}
        <Navbar />

        {/* Content Area */}
        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            {isEditing ? (
              <PatientProfileEdit onCancel={handleCancel} onSave={handleSave} />
            ) : (
              <PatientProfileInfo onEditClick={handleEditClick} />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientProfilePage;
