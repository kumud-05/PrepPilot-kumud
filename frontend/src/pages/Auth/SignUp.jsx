import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";
import Input from "../../components/Inputs/Input";
import Button from "../../components/Button/Button";
import ProfilePhotoSelector from "../../components/Inputs/ProfilePhotoSelector";
import { validateEmail } from "../../utils/helper";
import axiosInstance from "../../utils/axiosinstance";
import { API_PATHS } from "../../utils/apiPaths";
import { UserContext } from "../../context/userContext";
import uploadImage from "../../utils/uploadimage";
import { LuArrowRight } from "react-icons/lu";

const passwordChecks = {
  length: password.length >= 8,
  uppercase: /[A-Z]/.test(password),
  lowercase: /[a-z]/.test(password),
  number: /[0-9]/.test(password),
  special: /[@$!%*?&]/.test(password),
};

const strengthScore =
  Object.values(passwordChecks).filter(Boolean).length;

const passwordStrength =
  strengthScore <= 2
    ? "Weak"
    : strengthScore <= 4
      ? "Medium"
      : "Strong";

const SignUp = ({ setCurrentPage }) => {
  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const { updateUser } = useContext(UserContext);
  const navigate = useNavigate();

  const handleSignup = async (e) => {
    e.preventDefault();

    let profileImageUrl = "";

    if (!fullName) {
      setError("Please enter your full name");
      return;
    }
    if (!validateEmail(email)) {
      setError("Please enter a valid email address");
      return;
    }
    if (!password || password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError("Password must contain at least one uppercase letter.");
      return;
    }
    if (!/[a-z]/.test(password)) {
      setError("Password must contain at least one lowercase letter.");
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError("Password must contain at least one number.");
      return;
    }
    if (!/[@$!%*?&]/.test(password)) {
      setError("Password must contain at least one special character (@$!%*?&).");
      return;
    }
    setError("");
    setLoading(true);

    try {
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || "";
      }

      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        name: fullName,
        email,
        password,
        profileImageUrl: profileImageUrl || "",
      });

      const { token } = response.data;
      if (token) {
        localStorage.setItem("token", token);
        updateUser(response.data);
        navigate("/dashboard");
      }
    } catch (error) {
      if (error.response && error.response.data.message) {
        setError(error.response.data.message);
      } else {
        setError("Something went wrong. Please try again");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <img
            src="/PrepPilot-Logo.png"
            alt="PrepPilot Logo"
            className="w-8 h-8 object-contain"
          />
          <span className="font-semibold text-gray-300">PrepPilot</span>
        </div>
        <h2 className="text-3xl font-bold bg-gradient-to-r from-violet-300 to-blue-300 bg-clip-text text-transparent mb-2">
          Create Account
        </h2>
        <p className="text-sm text-gray-400">
          Join thousands preparing smarter for their dream jobs
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSignup} className="space-y-4">
        {/* Profile Photo */}
        <div className="mb-6">
          <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
        </div>

        {/* Full Name Input */}
        <Input

  value={fullName}
  onChange={({ target }) => setFullName(target.value)}
  label="Full Name"
  placeholder="John Doe"
  type="text"
  aria-invalid={!!error && !fullName}
  aria-describedby={error && !fullName ? "signup-error" : undefined}
/>

          value={fullName}
          onChange={({ target }) => setFullName(target.value)}
          label="Full Name"
          placeholder="John Doe"
          type="text"
          autoFocus
        />

        {/* Email Input */}
        <Input
          value={email}
          onChange={({ target }) => setEmail(target.value)}
          label="Email Address"
          placeholder="your@email.com"
          type="text"
        />

        {/* Password Input */}
        <Input
          value={password}
          onChange={({ target }) => setPassword(target.value)}
          label="Password"
          placeholder="Min 8 characters"
          type="password"
        />

        {password && (
          <div className="mt-3">
            {/* Strength Meter */}
            <div className="flex justify-between text-sm mb-2">
              <span className="text-gray-400">Password Strength</span>
              <span
                className={`font-medium ${passwordStrength === "Weak"
                    ? "text-red-400"
                    : passwordStrength === "Medium"
                      ? "text-yellow-400"
                      : "text-green-400"
                  }`}
              >
                {passwordStrength}
              </span>
            </div>

            <div className="w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-300 ${passwordStrength === "Weak"
                    ? "bg-red-500"
                    : passwordStrength === "Medium"
                      ? "bg-yellow-500"
                      : "bg-green-500"
                  }`}
                style={{ width: `${strengthScore * 20}%` }}
              />
            </div>

            {/* Requirements */}
            <div className="mt-3 text-sm space-y-1">
              <p className="text-gray-300 font-medium">
                Password Requirements
              </p>

              <div className={passwordChecks.length ? "text-green-400" : "text-gray-400"}>
                {passwordChecks.length ? "✅" : "❌"} Minimum 8 characters
              </div>

              <div className={passwordChecks.uppercase ? "text-green-400" : "text-gray-400"}>
                {passwordChecks.uppercase ? "✅" : "❌"} Uppercase letter
              </div>

              <div className={passwordChecks.lowercase ? "text-green-400" : "text-gray-400"}>
                {passwordChecks.lowercase ? "✅" : "❌"} Lowercase letter
              </div>

              <div className={passwordChecks.number ? "text-green-400" : "text-gray-400"}>
                {passwordChecks.number ? "✅" : "❌"} Number
              </div>

              <div className={passwordChecks.special ? "text-green-400" : "text-gray-400"}>
                {passwordChecks.special ? "✅" : "❌"} Special character
              </div>
            </div>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div
  id="signup-error"
  role="alert"
  aria-live="polite"
  className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
>
            <p className="text-red-400 text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Sign Up Button */}
        <Button
          type="submit"
          loading={loading}
          loadingText="Creating account..."
          icon={<LuArrowRight className="group-hover:translate-x-1 transition-transform" />}
          className="mt-6"
        >
          Create Account
        </Button>

        {/* Login Link */}
        <div className="mt-6 pt-4 border-t border-white/10">
          <p className="text-sm text-gray-400 text-center">
            Already have an account?{" "}
            <button
              type="button"
              className="font-semibold text-transparent bg-gradient-to-r from-violet-400 to-blue-400 bg-clip-text hover:opacity-80 transition-opacity cursor-pointer"
              onClick={() => {
                setCurrentPage("login");
                setError(null);
              }}
            >
              Sign in
            </button>
          </p>
        </div>
      </form>
    </div>
  );
};

export default SignUp;
