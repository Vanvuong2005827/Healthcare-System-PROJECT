import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import axiosInstanceUserService from "../../utils/axiosInstanceUserService";
import axiosInstancePatientService from "../../utils/axiosInstancePatientService";
import ForgotPassword from "./ForgotPassword";

const LoginForm = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Loggin in");

    const userCredential = {
      email,
      password,
    };

    axiosInstanceUserService
      .post("/login", userCredential)
      .then(async (resp) => {
        const data = resp.data;
        console.log("Response from login ", data?.userLoginDetails);
        // Set the token to the local storage
        localStorage.setItem("token", data?.userLoginDetails?.token);
        // Set the role to the local storage
        localStorage.setItem("role", data?.userLoginDetails?.role);

        toast.success(data?.message || "Login successful!");

        console.log("token ", data?.userLoginDetails?.token);

        const role = data?.userLoginDetails?.role;

        // If user is a patient, get and store patientId
        if (role === "Patient") {
          try {
            const patientResponse = await axiosInstancePatientService.get(
              `/email/${email}`
            );
            const patientData = patientResponse.data;
            localStorage.setItem("patientId", patientData.patientId);
            localStorage.setItem("userId", patientData.userId);
            console.log("Patient ID saved:", patientData.patientId);
          } catch (error) {
            console.error("Error fetching patient data:", error);
            toast.error("Error fetching patient information");
          }
          navigate("/patient/home");
        } else if (role === "Doctor") {
          navigate("/doctor/home");
        } else {
          navigate("/admin/home");
        }
      })
      .catch((err) => {
        toast.error(err?.response?.data?.message || "Something went wrong!");
      });
  };

  // If showing forgot password form, render it instead
  if (showForgotPassword) {
    return (
      <ForgotPassword onBackToLogin={() => setShowForgotPassword(false)} />
    );
  }

  return (
    <div className="max-w-md mx-auto p-8 bg-gray-50 rounded-xl shadow-lg">
      <h2 className="text-center text-3xl font-extrabold text-gray-900 mb-8">
        Sign In
      </h2>
      <form onSubmit={handleLogin} className="space-y-8">
        <div className="form-group">
          <label
            htmlFor="email"
            className="block text-lg font-semibold text-gray-700"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label
            htmlFor="password"
            className="block text-lg font-semibold text-gray-700"
          >
            Password
          </label>
          <input
            type="password"
            id="password"
            className="mt-2 w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>

        <div className="text-center">
          <button
            type="button"
            onClick={() => setShowForgotPassword(true)}
            className="text-sm text-blue-600 hover:text-blue-800 hover:underline"
          >
            Forgot your password?
          </button>
        </div>

        <div className="form-group">
          <button
            type="submit"
            className="w-full px-4 py-3 text-lg font-medium text-white bg-blue-600 rounded-lg shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            Log In
          </button>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;
