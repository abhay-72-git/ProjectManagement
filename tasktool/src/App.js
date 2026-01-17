import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

//import Calendar from "react-calendar";
import {
  User,
  Mail,
  Lock,
  LayoutDashboard,
  FileEdit,
  List,
  LogOut,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Phone,
  Monitor,
  MapPin,
  Building,
  Package,
  HardDrive,
  Code,
  TrendingUp,
  Calendar,
  Ticket,
  AlertCircle,
  Lightbulb,
  BarChart3

} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Label
} from "recharts";
import { authService, userDetailsService, assetService, sprintVelocityService } from "./api/apiService";
import SprintTaskManagement from "./Pages/SprintTaskManagement";
import LeaveManagement from "./Pages/LeaveManagment";
import ISTicketManagement from "./Pages/ISTicketManagement";
import IssueDocumentManagement from "./Pages/IssueDocumentManagement";
import LessonLearnedManagement from "./Pages/LessonLearnedManagement";
import DocumentManagement from "./Pages/DocumentManagement ";
import SprintConfigManagement from "./Pages/SprintConfigManagement";
import SprintFeedbackManagement from "./Pages/SprintFeedbackManagement";


const AssetCategory = {
  PhysicalMachine: 1,
  ClientVDI: 2,
};

const AssetType = {
  Hardware: 1,
  Software: 2,
};

const App = () => {
  const [assets, setAssets] = useState([]);
  const [editingAsset, setEditingAsset] = useState(null);
  const [assetForm, setAssetForm] = useState({
    name: "",
    category: AssetCategory.PhysicalMachine,
    type: AssetType.Hardware,
    version: "",
    specifications: "",
  });
  const [currentSprintStoryPoints, setCurrentSprintStoryPoints] = useState(null);
  const [sprintStoryPoints, setSprintStoryPoints] = useState(null);
  const [loadingStoryPoints, setLoadingStoryPoints] = useState(false);
  const [filterType, setFilterType] = useState("all");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isLogin, setIsLogin] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [currentPage, setCurrentPage] = useState("dashboard");
  const [allUserDetails, setAllUserDetails] = useState([]);
  const [currentUserDetails, setCurrentUserDetails] = useState(null);
  const [editingDetails, setEditingDetails] = useState(false);
  const [editUserEmail, setEditUserEmail] = useState("");
  const [sprintForm, setSprintForm] = useState({ sprintNumber: "", startDate: "", endDate: "", velocityAchieved: "" });
  const [editingSprint, setEditingSprint] = useState(null);
  const [sprints, setSprints] = useState([]);
  const [selectedSprintId, setSelectedSprintId] = useState("");
  const [chartData, setChartData] = useState([]);
  const [formData, setFormData] = useState({
    name: "",
    empId: "",
    machineIpAddress: "",
    deviceHostName: "",
    clientVpnUsername: "",
    assetId: "",
    contactNo: "",
    bitLockerPassword: "",
    location: "",
    vdiPhysicalMachineLocation: "",
    hwfhPwfH: "",
    pl: "", // Planned Leave
    ul: "", // Unplanned Leave
    fl: "", // Floating Leave
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [userName, setUserName] = useState("");

  // Auth form state
  const [authForm, setAuthForm] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  useEffect(() => {
    const email = sessionStorage.getItem("userEmail");
    const name = sessionStorage.getItem("userName");
    if (email && name) {
      setUserEmail(email);
      setUserName(name);
      setIsAuthenticated(true);
      fetchCurrentUserDetails(email);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated && currentPage === "all-details") {
      fetchAllUserDetails();
    }
    if (isAuthenticated && currentPage === "assets") {
      fetchAssets();
    }
    if (isAuthenticated && currentPage === "sprint-velocity") {
      fetchSprints();

    }
  }, [isAuthenticated, currentPage]);

  const fetchCurrentUserDetails = async (email) => {
    try {
      const data = await userDetailsService.getByEmail(email);
      setCurrentUserDetails(data);
      if (data) {
        setFormData({
          name: data.name || "",
          empId: data.empId || "",
          machineIpAddress: data.machineIpAddress || "",
          deviceHostName: data.deviceHostName || "",
          clientVpnUsername: data.clientVpnUsername || "",
          assetId: data.assetId || "",
          contactNo: data.contactNo || "",
          bitLockerPassword: data.bitLockerPassword || "",
          location: data.location || "",
          vdiPhysicalMachineLocation: data.vdiPhysicalMachineLocation || "",
          hwfhPwfH: data.hwfhPwfH || "",
          pl: data.pl ?? 0,
          ul: data.ul ?? 0,
          fl: data.fl ?? 0,
        });
      }
    } catch (err) {
      console.error("Error fetching user details:", err);
    }
  };

  const fetchAllUserDetails = async () => {
    try {
      setLoading(true);
      const data = await userDetailsService.getAll();
      setAllUserDetails(data);
      setError("");
    } catch (err) {
      setError(
        "Failed to fetch user details: " +
        (err.response?.data?.message || err.message || JSON.stringify(err))
      );
      console.error("Error fetching all user details:", err);
    } finally {
      setLoading(false);
    }
  };
  const isValidEmail = (email) => {
    // Allows only @ybage.com domain
    const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
    return emailRegex.test(email);
  };

  const isValidPassword = (password) => {
    // Minimum 8 chars, 1 uppercase, 1 lowercase, 1 number, 1 special char
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9])[A-Za-z\d^A-Za-z0-9]{8,}$/;

    return passwordRegex.test(password);
  };


  const handleAuth = async (loginValue) => {
    if (!authForm.email || !authForm.password) {
      setError("Please fill in all required fields");
      return;
    }

    if (!isLogin) {
      if (!authForm.name) {
        setError("Please enter your name");
        return;
      }
      if (authForm.password !== authForm.confirmPassword) {
        setError("Passwords do not match");
        return;
      }
    }

    try {
      setLoading(true);
      setError("");

      let response;

      if (loginValue === 'logIn') {
        response = await authService.login(authForm.email, authForm.password);
        if (response === 'Login Successful') {
          // Login
          try {
            const userDetails = await userDetailsService.getByEmail(authForm.email);
            if (userDetails) {
              setUserName(userDetails.name);
              sessionStorage.setItem("userName", userDetails.name);
            }
          } catch (err) {
            console.warn("No user details found yet, continue to dashboard...");
          }
          sessionStorage.setItem("userEmail", authForm.email);
          setUserEmail(authForm.email);
          setIsAuthenticated(true);
          setCurrentPage("dashboard");
          fetchCurrentUserDetails(authForm.email);
        }
        else {
          setError(response);
        }
      }
      if (loginValue === 'signUp') {

        // ==========================
        // 🔴 EMAIL VALIDATION
        // ==========================
        if (!authForm.email) {
          setError("Email is required");
          setLoading(false);
          return;
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@gmail\.com$/;
        if (!emailRegex.test(authForm.email)) {
          setError("Email must be a valid @gmail.com email address");
          setLoading(false);
          return;
        }

        // ==========================
        // 🔴 PASSWORD VALIDATION
        // ==========================
        if (!authForm.password) {
          setError("Password is required");
          setLoading(false);
          return;
        }

        const passwordRegex =
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;

        if (!passwordRegex.test(authForm.password)) {
          setError(
            "Password must be at least 8 characters long and include uppercase, lowercase, number, and special character"
          );
          setLoading(false);
          return;
        }

        // ==========================
        // 🔴 CONFIRM PASSWORD
        // ==========================
        if (authForm.password !== authForm.confirmPassword) {
          setError("Passwords do not match");
          setLoading(false);
          return;
        }

        // ==========================
        // ✅ REGISTER API CALL
        // ==========================
        response = await authService.register(
          authForm.name,
          authForm.email,
          authForm.password,
          authForm.confirmPassword
        );

        if (response === 'User registered successfully') {
          alert("User registered successfully. Please log in.");
          setIsLogin(true);
          setAuthForm({
            name: "",
            email: "",
            password: "",
            confirmPassword: ""
          });
        } else {
          setError(response);
        }
      }

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        "Authentication failed"
      );
      console.error("Auth error:", err);
    } finally {
      setLoading(false);
    }
  };
  const fetchAllUsers = async () => {
    try {
      const users = await userDetailsService.getAll(); // Use the correct method
      setAllUserDetails(users);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await authService.logout();
    } catch (err) {
      console.error("Logout error:", err);
    } finally {
      sessionStorage.removeItem("userEmail");
      sessionStorage.removeItem("userName");
      setIsAuthenticated(false);
      setIsLogin(true);
      setUserEmail("");
      setUserName("");
      setCurrentUserDetails(null);
      setAllUserDetails([]);
      setAssets([]);
      resetAssetForm();
      setFormData({
        name: "",
        empId: "",
        machineIpAddress: "",
        deviceHostName: "",
        clientVpnUsername: "",
        assetId: "",
        contactNo: "",
        bitLockerPassword: "",
        location: "",
        vdiPhysicalMachineLocation: "",
        hwfhPwfH: "",
        pl: "",
        ul: "",
        fl: "",
      });
    }
  };

  const handleSaveDetails = async () => {
    if (!formData.name) {
      setError("Name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const detailsData = {
        name: formData.name,
        empId: formData.empId ? parseInt(formData.empId, 10) : null,
        machineIpAddress: formData.machineIpAddress || null,
        deviceHostName: formData.deviceHostName || null,
        clientVpnUsername: formData.clientVpnUsername || null,
        assetId: formData.assetId || null,
        contactNo: formData.contactNo || null,
        bitLockerPassword: formData.bitLockerPassword || null,
        location: formData.location || null,
        vdiPhysicalMachineLocation: formData.vdiPhysicalMachineLocation || null,
        hwfhPwfH: formData.hwfhPwfH || null,
        pl: formData.pl || 0,
        ul: formData.ul || 0,
        fl: formData.fl || 0,
      };

      if (editUserEmail && editUserEmail !== userEmail) {
        await userDetailsService.updateAdmin(editUserEmail, detailsData);
      } else {
        await userDetailsService.updateSelf(detailsData);
      }

      await fetchCurrentUserDetails(userEmail);
      setEditingDetails(false);
      setCurrentPage("dashboard");
      setEditUserEmail("");
    } catch (err) {
      setError(
        err.response?.data?.message || err.response?.data || "Failed to save details"
      );
      console.error("Error saving details:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditMyDetails = () => {
    if (currentUserDetails) {
      setFormData({
        name: currentUserDetails.name || "",
        empId: currentUserDetails.empId || "",
        machineIpAddress: currentUserDetails.machineIpAddress || "",
        deviceHostName: currentUserDetails.deviceHostName || "",
        clientVpnUsername: currentUserDetails.clientVpnUsername || "",
        assetId: currentUserDetails.assetId || "",
        contactNo: currentUserDetails.contactNo || "",
        bitLockerPassword: currentUserDetails.bitLockerPassword || "",
        location: currentUserDetails.location || "",
        vdiPhysicalMachineLocation: currentUserDetails.vdiPhysicalMachineLocation || "",
        hwfhPwfH: currentUserDetails.hwfhPwfH || "",
        pl: currentUserDetails.pl || "",
        ul: currentUserDetails.ul || "",
        fl: currentUserDetails.fl || "",
      });
    }
    setEditingDetails(true);
    setCurrentPage("add-edit");
  };

  const handleEditAllDetails = (user) => {
    if (user) {
      setEditUserEmail(user.email);
      setFormData({
        email: user.email || "",
        name: user.name || "",
        empId: user.empId || "",
        machineIpAddress: user.machineIpAddress || "",
        deviceHostName: user.deviceHostName || "",
        clientVpnUsername: user.clientVpnUsername || "",
        assetId: user.assetId || "",
        contactNo: user.contactNo || "",
        bitLockerPassword: user.bitLockerPassword || "",
        location: user.location || "",
        vdiPhysicalMachineLocation: user.vdiPhysicalMachineLocation || "",
        hwfhPwfH: user.hwfhPwfH || "",
        pl: user.pl || "",
        ul: user.ul || "",
        fl: user.fl || "",
      });
    }
    setEditingDetails(true);
    setCurrentPage("add-edit");
  };

  const handleDeleteUser = async (email) => {
    if (!window.confirm("Are you sure you want to delete this user's details?")) return;

    try {
      setLoading(true);
      await userDetailsService.delete(email);
      await fetchAllUserDetails();
      setError("");
    } catch (err) {
      setError(err.response?.data?.message || "Failed to delete user details");
      console.error("Error deleting user:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const data = await assetService.getAll();
      setAssets(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch assets: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAsset = async () => {
    if (!assetForm.name) {
      setError("Asset name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const assetData = {
        name: assetForm.name,
        category: parseInt(assetForm.category),
        type: parseInt(assetForm.type),
        version: assetForm.version || null,
        specifications: assetForm.specifications || null,
      };

      if (editingAsset) {
        await assetService.update(editingAsset.id, assetData);
      } else {
        await assetService.create(assetData);
      }

      await fetchAssets();
      resetAssetForm();
      setCurrentPage("assets");
    } catch (err) {
      setError(err.message || "Failed to save asset");
    } finally {
      setLoading(false);
    }
  };

  const handleEditAsset = (asset) => {
    setEditingAsset(asset);
    setAssetForm({
      name: asset.name,
      category: asset.category,
      type: asset.type,
      version: asset.version || "",
      specifications: asset.specifications || "",
    });
    setCurrentPage("asset-form");
  };

  const handleDeleteAsset = async (id) => {
    if (!window.confirm("Are you sure you want to delete this asset?")) return;

    try {
      setLoading(true);
      await assetService.delete(id);
      await fetchAssets();
      setError("");
    } catch (err) {
      setError("Failed to delete asset: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetAssetForm = () => {
    setEditingAsset(null);
    setAssetForm({
      name: "",
      category: AssetCategory.PhysicalMachine,
      type: AssetType.Hardware,
      version: "",
      specifications: "",
    });
  };

  const getCategoryLabel = (category) => {
    return category === AssetCategory.PhysicalMachine ? "Physical Machine" : "Client VDI";
  };

  const getTypeLabel = (type) => {
    return type === AssetType.Hardware ? "Hardware" : "Software";
  };

  const fetchSprints = async () => {
    try {
      setLoading(true);
      const data = await sprintVelocityService.getAll();
      setSprints(data);
      setError("");

      // After fetching sprints, get the current sprint's story points
      if (data.length > 0) {
        const currentSprint = data.reduce((latest, sprint) =>
          sprint.id > latest.id ? sprint : latest
        );
        fetchCurrentSprintStoryPoints(currentSprint.id);

        // Fetch chart data with story points
        await fetchChartData(data);
      }
    } catch (err) {
      setError("Failed to fetch sprints: " + (err.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };
  const fetchChartData = async (sprintsData) => {
    // Get last 3 sprints sorted by ID descending (most recent first)
    const last3Sprints = [...sprintsData]
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)
      .reverse(); // Reverse to show oldest to newest in chart

    // Fetch story points for each sprint
    const chartDataPromises = last3Sprints.map(async (sprint) => {
      try {
        const storyPoints = await sprintVelocityService.getStoryPointSummary(sprint.id);
        return {
          name: sprint.sprintNumber,
          velocity: storyPoints?.totalStoryPoints ?? sprint.velocityAchieved ?? 0,
        };
      } catch (err) {
        return {
          name: sprint.sprintNumber,
          velocity: sprint.velocityAchieved ?? 0,
        };
      }
    });

    const data = await Promise.all(chartDataPromises);
    setChartData(data);
  };

  const handleSaveSprint = async () => {
    if (!sprintForm.sprintNumber || !sprintForm.startDate || !sprintForm.endDate) {
      setError("Sprint number, start date, and end date are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const sprintData = {
        sprintNumber: sprintForm.sprintNumber,
        startDate: sprintForm.startDate,
        endDate: sprintForm.endDate,
        velocityAchieved: 0, // Will be updated based on story points
      };

      if (editingSprint) {
        await sprintVelocityService.update(editingSprint.id, sprintData);
      } else {
        await sprintVelocityService.create(sprintData);
      }

      await fetchSprints();
      resetSprintForm();
      setSelectedSprintId("");
      setCurrentPage("sprint-velocity");
    } catch (err) {
      setError(err.message || "Failed to save sprint");
    } finally {
      setLoading(false);
    }
  };

  const handleEditSprint = (sprint) => {
    setEditingSprint(sprint);
    setSprintForm({
      sprintNumber: sprint.sprintNumber,
      startDate: sprint.startDate.split('T')[0],
      endDate: sprint.endDate.split('T')[0],
      velocityAchieved: sprint.velocityAchieved.toString(),
    });
    setCurrentPage("sprint-form");
  };

  const handleDeleteSprint = async (id) => {
    if (!window.confirm("Are you sure you want to delete this sprint?")) return;

    try {
      setLoading(true);
      await sprintVelocityService.delete(id);
      await fetchSprints();
      setSelectedSprintId("");
      setError("");
    } catch (err) {
      setError("Failed to delete sprint: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetSprintForm = () => {
    setEditingSprint(null);
    setSprintForm({ sprintNumber: "", startDate: "", endDate: "", velocityAchieved: "" });
  };

  const getChartData = async () => {
    // Get last 3 sprints sorted by ID descending (most recent first)
    const last3Sprints = [...sprints]
      .sort((a, b) => b.id - a.id)
      .slice(0, 3)
      .reverse(); // Reverse to show oldest to newest in chart

    // Fetch story points for each sprint and use total as velocity
    const chartData = await Promise.all(
      last3Sprints.map(async (sprint) => {
        try {
          const storyPoints = await sprintVelocityService.getStoryPointSummary(sprint.id);
          return {
            name: sprint.sprintNumber,
            velocity: storyPoints?.totalStoryPoints ?? sprint.velocityAchieved ?? 0,
          };
        } catch (err) {
          return {
            name: sprint.sprintNumber,
            velocity: sprint.velocityAchieved ?? 0,
          };
        }
      })
    );

    return chartData;
  };

  useEffect(() => {
    if (selectedSprintId) {
      fetchSprintStoryPoints(selectedSprintId);
    } else {
      setSprintStoryPoints(null);
    }
  }, [selectedSprintId]);

  const getCurrentSprint = () => {
    if (sprints.length === 0) return null;
    return sprints.reduce((latest, sprint) =>
      sprint.id > latest.id ? sprint : latest

    );
  };

  const fetchCurrentSprintStoryPoints = async (sprintId) => {
    try {
      const data = await sprintVelocityService.getStoryPointSummary(sprintId);
      setCurrentSprintStoryPoints(data);
    } catch (err) {
      console.error("Error fetching current sprint story points:", err);
      setCurrentSprintStoryPoints(null);
    }
  };

  const fetchSprintStoryPoints = async (sprintId) => {
    try {
      setLoadingStoryPoints(true);
      const data = await sprintVelocityService.getStoryPointSummary(sprintId);
      setSprintStoryPoints(data);
    } catch (err) {
      console.error("Error fetching story points:", err);
      setSprintStoryPoints(null);
    } finally {
      setLoadingStoryPoints(false);
    }
  };

  useEffect(() => {
    const currentSprint = getCurrentSprint();
    if (currentSprint?.id) {
      fetchCurrentSprintStoryPoints(currentSprint.id);
    }
  }, [sprints]);

  console.log("isAuthenticated", isAuthenticated)


  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 via-blue-600 to-cyan-500 flex items-center justify-center p-4">
        <div className="relative w-full max-w-md">
          <div className="absolute inset-0 bg-white/10 backdrop-blur-xl rounded-3xl transform rotate-3" />
          <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl overflow-hidden">
            <div
              className={`absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-purple-500 to-cyan-500 transition-all duration-500 ${isLogin ? "translate-x-0" : "translate-x-full"
                }`}
            />
            <div className="p-8">
              <div className="text-center mb-8">
                <div
                  className={`inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-cyan-500 mb-4 transition-transform duration-500 ${isLogin ? "rotate-0" : "rotate-180"
                    }`}
                >
                  <User className="w-10 h-10 text-white" />
                </div>

                <h2
                  className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 ${isLogin ? "opacity-100 relative" : "opacity-0 absolute"
                    }`}
                >
                  {isLogin ? "Welcome Back" : ""}
                </h2>

                <h2
                  className={`text-3xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent transition-all duration-500 ${!isLogin ? "opacity-100 relative" : "opacity-0 absolute"
                    }`}
                >
                  {!isLogin ? "Create Account" : ""}
                </h2>
              </div>

              {error && (
                <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <div className="space-y-5">
                {!isLogin && (
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <input
                      type="text"
                      placeholder="Full Name"
                      value={authForm.name}
                      onChange={(e) => setAuthForm({ ...authForm, name: e.target.value })}
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                    />
                  </div>
                )}

                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="email"
                    placeholder="Email Address"
                    value={authForm.email}
                    onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                  <input
                    type="password"
                    placeholder="Password"
                    value={authForm.password}
                    onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  />
                </div>

                {!isLogin && (
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-500" />
                    <input
                      type="password"
                      placeholder="Confirm Password"
                      value={authForm.confirmPassword}
                      onChange={(e) =>
                        setAuthForm({ ...authForm, confirmPassword: e.target.value })
                      }
                      className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                    />
                  </div>
                )}

                <button
                  onClick={() => handleAuth(isLogin ? "logIn" : "signUp")}
                  disabled={loading}
                  className="w-full py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                >
                  {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : isLogin ? "Sign In" : "Sign Up"}
                </button>
              </div>

              <div className="mt-6 text-center">
                <p className="text-gray-600">
                  {isLogin ? "Don't have an account? " : "Already have an account? "}
                  <button
                    onClick={() => {
                      setIsLogin(!isLogin);
                      setError("");
                    }}
                    className="text-purple-600 font-semibold hover:text-cyan-600 transition-colors duration-300"
                  >
                    {isLogin ? "Sign Up" : "Sign In"}
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const filteredAssets = assets.filter((asset) => {
    const matchesType =
      filterType === "all" || asset.type === Number(filterType);

    const matchesCategory =
      filterCategory === "all" || asset.category === Number(filterCategory);

    return matchesType && matchesCategory;
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50">
      <nav className="bg-white shadow-lg sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-cyan-600 rounded-lg flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                User Dashboard
              </span>
              <span className="ml-4 text-gray-600 text-sm">Welcome, {userName || userEmail}</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </nav>

      {error && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
              ✕
            </button>
          </div>
        </div>
      )}

      <div className="flex">
        <aside className="w-64 bg-white shadow-xl min-h-screen">
          <nav className="p-4 space-y-2">
            {[
              { id: "dashboard", icon: LayoutDashboard, label: "Dashboard" },
              { id: "add-edit", icon: FileEdit, label: "My Details" },

              { id: "all-details", icon: List, label: "All User Details" },
              { id: "assets", icon: Package, label: "Asset Management" },
              { id: "sprint-velocity", icon: TrendingUp, label: "Sprint Velocity" },
              { id: "sprint-tasks", icon: FileEdit, label: "Sprint Tasks" },
              { id: "leave-records", icon: Calendar, label: "Leave Records" },
              { id: "is-tickets", icon: Ticket, label: "IS Tickets" },
              { id: "issue-documents", icon: AlertCircle, label: "Issues Faced" },
              { id: "lessons-learned", icon: Lightbulb, label: "Learnings" },
              { id: "Document-Managment", icon: List, label: "Documents" },
              { id: "sprint-Responsibility", icon: BarChart3, label: "Sprint Responsibilty" },
              { id: "sprint-Feedback", icon: List, label: "Sprint MOM" }

            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setError("");
                  if (item.id === "add-edit") {
                    handleEditMyDetails();
                  }
                  if (item.id === "assets") {
                    resetAssetForm();
                  }
                  if (item.id == "sprint-velocity") {
                    resetSprintForm();
                  }
                  if (isAuthenticated && currentPage === "leave-records") {
                    fetchAllUsers(); // Fetch user details when viewing leave records
                  }
                }}
                className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl transition-all duration-300 ${currentPage === item.id
                  ? "bg-gradient-to-r from-purple-600 to-cyan-600 text-white shadow-lg transform scale-105"
                  : "hover:bg-gray-100 text-gray-700"
                  }`}
              >
                <item.icon className="w-5 h-5" />
                <span className="font-medium">{item.label}</span>
              </button>
            ))}
          </nav>
        </aside>

        <main className="flex-1 p-8">
          <div className="max-w-6xl mx-auto">
            {loading && currentPage === "dashboard" ? (
              <div className="flex items-center justify-center h-64">
                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
              </div>
            ) : (
              <>
                {currentPage === "dashboard" && (
                  <div className="animate-fadeIn">
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      Dashboard Overview
                    </h1>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-purple-500 to-purple-600 mb-4">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Profile Status</p>
                        <p className="text-3xl font-bold text-gray-800 mt-2">
                          {currentUserDetails ? "Complete" : "Incomplete"}
                        </p>
                      </div>

                      <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-transform duration-300">
                        <div className="inline-flex p-3 rounded-xl bg-gradient-to-br from-cyan-500 to-cyan-600 mb-4">
                          <Mail className="w-6 h-6 text-white" />
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Email</p>
                        <p className="text-lg font-bold text-gray-800 mt-2 truncate">{userEmail}</p>
                      </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6">
                      <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-gray-800">My Information</h2>
                        <button
                          onClick={handleEditMyDetails}
                          className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                          <Edit2 className="w-4 h-4" />
                          <span>Edit Details</span>
                        </button>
                      </div>

                      {currentUserDetails ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {[
                            { label: "Name", value: currentUserDetails.name, icon: User },
                            { label: "Employee ID", value: currentUserDetails.empId, icon: User },
                            {
                              label: "IP Address",
                              value: currentUserDetails.machineIpAddress,
                              icon: Monitor,
                            },
                            {
                              label: "Device Hostname",
                              value: currentUserDetails.deviceHostName,
                              icon: Monitor,
                            },
                            {
                              label: "VPN Username",
                              value: currentUserDetails.clientVpnUsername,
                              icon: User,
                            },
                            { label: "Asset ID", value: currentUserDetails.assetId, icon: Building },
                            { label: "Contact No", value: currentUserDetails.contactNo, icon: Phone },
                            { label: "Location", value: currentUserDetails.location, icon: MapPin },
                            {
                              label: "VDI Location",
                              value: currentUserDetails.vdiPhysicalMachineLocation,
                              icon: Building,
                            },
                            { label: "Work Mode", value: currentUserDetails.hwfhPwfH, icon: Building },
                            { label: "Planned Leave (PL)", value: currentUserDetails.pl, icon: Calendar },
                            { label: "Unplanned Leave (UL)", value: currentUserDetails.ul, icon: Calendar },
                            { label: "Floating Leave (FL)", value: currentUserDetails.fl, icon: Calendar },
                          ].map((field, idx) =>
                            field.value ? (
                              <div key={idx} className="flex items-start space-x-3 p-4 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl">
                                <field.icon className="w-5 h-5 text-purple-600 mt-0.5" />
                                <div>
                                  <p className="text-sm text-gray-600">{field.label}</p>
                                  <p className="font-semibold text-gray-800">{field.value}</p>
                                </div>
                              </div>
                            ) : null
                          )}
                        </div>
                      ) : (
                        <div className="text-center py-12">
                          <p className="text-gray-500 mb-4">No details added yet</p>
                          <button
                            onClick={handleEditMyDetails}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            Add My Details
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentPage === "add-edit" && (
                  <div className="animate-fadeIn">
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      {currentUserDetails ? "Edit My Details" : "Add My Details"}
                    </h1>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter your name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Employee ID</label>
                          <input
                            type="number"
                            value={formData.empId}
                            onChange={(e) => setFormData({ ...formData, empId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter employee ID"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Machine IP Address</label>
                          <input
                            type="text"
                            value={formData.machineIpAddress}
                            onChange={(e) => setFormData({ ...formData, machineIpAddress: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="e.g., 192.168.1.100"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Device Hostname</label>
                          <input
                            type="text"
                            value={formData.deviceHostName}
                            onChange={(e) => setFormData({ ...formData, deviceHostName: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter device hostname"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Client VPN Username</label>
                          <input
                            type="text"
                            value={formData.clientVpnUsername}
                            onChange={(e) => setFormData({ ...formData, clientVpnUsername: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter VPN username"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Asset ID</label>
                          <input
                            type="text"
                            value={formData.assetId}
                            onChange={(e) => setFormData({ ...formData, assetId: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter asset ID"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Contact Number</label>
                          <input
                            type="tel"
                            value={formData.contactNo}
                            onChange={(e) => setFormData({ ...formData, contactNo: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter contact number"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">BitLocker Password</label>
                          <input
                            type="password"
                            value={formData.bitLockerPassword}
                            onChange={(e) => setFormData({ ...formData, bitLockerPassword: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter BitLocker password"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                          <input
                            type="text"
                            value={formData.location}
                            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">VDI Physical Machine Location</label>
                          <input
                            type="text"
                            value={formData.vdiPhysicalMachineLocation}
                            onChange={(e) => setFormData({ ...formData, vdiPhysicalMachineLocation: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter VDI location"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Work Mode (HWFH/PWFH)</label>
                          <select
                            value={formData.hwfhPwfH}
                            onChange={(e) => setFormData({ ...formData, hwfhPwfH: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                          >
                            <option value="">Select Work Mode</option>
                            <option value="HWFH">HWFH (Hybrid Work From Home)</option>
                            <option value="PWFH">PWFH (Permanent Work From Home)</option>
                            <option value="Office">Office</option>
                          </select>
                        </div>
                      </div>

                      <div className="mt-8 mb-4">
                        <h3 className="text-xl font-bold text-gray-800 mb-4">Leave Balance</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Planned Leave (PL)
                          </label>
                          <input
                            type="number"
                            value={formData.pl}
                            onChange={(e) => setFormData({ ...formData, pl: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter planned leave"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Unplanned Leave (UL)
                          </label>
                          <input
                            type="number"
                            value={formData.ul}
                            onChange={(e) => setFormData({ ...formData, ul: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter unplanned leave"
                            min="0"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Floating Leave (FL)
                          </label>
                          <input
                            type="number"
                            value={formData.fl}
                            onChange={(e) => setFormData({ ...formData, fl: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter floating leave"
                            min="0"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex space-x-4">
                        <button
                          onClick={handleSaveDetails}
                          disabled={loading}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>{currentUserDetails ? "Update" : "Save"} Details</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setCurrentPage("dashboard")}
                          className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {currentPage === "all-details" && (
                  <div className="animate-fadeIn">
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      All User Details
                    </h1>
                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      {loading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        </div>
                      ) : allUserDetails.length === 0 ? (
                        <div className="p-12 text-center">
                          <p className="text-gray-500 text-lg">No user details found</p>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full" style={{ minWidth: '1800px' }}>
                            <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white sticky top-0 z-10">
                              <tr>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Email</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Name</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Emp ID</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">IP Address</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Hostname</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">VPN Username</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Asset ID</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Contact No</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Location</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">VDI Location</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Work Mode</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">PL</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">UL</th>
                                <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">FL</th>
                                <th className="px-4 py-4 text-center font-semibold whitespace-nowrap sticky right-0 bg-gradient-to-r from-purple-600 to-cyan-600">Actions</th>

                              </tr>
                            </thead>
                            <tbody>
                              {allUserDetails.map((user, idx) => (
                                <tr key={idx} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                  <td className="px-4 py-4 font-medium text-gray-800 whitespace-nowrap">{user.email}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.name || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.empId || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.machineIpAddress || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.deviceHostName || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.clientVpnUsername || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.assetId || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.contactNo || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.location || "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.vdiPhysicalMachineLocation || "-"}</td>
                                  <td className="px-4 py-4 whitespace-nowrap">
                                    <span
                                      className={`px-3 py-1 rounded-full text-sm font-medium ${user.hwfhPwfH === "HWFH"
                                        ? "bg-blue-100 text-blue-700"
                                        : user.hwfhPwfH === "PWFH"
                                          ? "bg-green-100 text-green-700"
                                          : user.hwfhPwfH === "Office"
                                            ? "bg-purple-100 text-purple-700"
                                            : "bg-gray-100 text-gray-700"
                                        }`}
                                    >
                                      {user.hwfhPwfH || "-"}
                                    </span>
                                  </td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.pl ?? "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.ul ?? "-"}</td>
                                  <td className="px-4 py-4 text-gray-700 whitespace-nowrap">{user.fl ?? "-"}</td>
                                  <td
                                    className={`px-4 py-4 whitespace-nowrap sticky right-0 ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                      }`}
                                  >
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => handleEditAllDetails(user)}
                                        className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>

                                      <button
                                        onClick={() => handleDeleteUser(user.email)}
                                        disabled={loading || user.email === userEmail}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title={
                                          user.email === userEmail
                                            ? "Cannot delete your own account"
                                            : "Delete"
                                        }
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>

                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentPage === "assets" && (
                  <div className="animate-fadeIn">
                    <div className="flex justify-between items-center mb-8">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        Asset Management
                      </h1>
                      <button
                        onClick={() => {
                          resetAssetForm();
                          setCurrentPage("asset-form");
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add New Asset</span>
                      </button>
                    </div>

                    <div className="filters" style={{ display: "flex", gap: "10px", margin: "15px 0" }}>
                      {/* Type Filter */}
                      <select
                        value={filterType}
                        onChange={(e) => setFilterType(e.target.value)}
                        className="form-select"
                      >
                        <option value="all">All Types</option>
                        <option value="1">Hardware</option>
                        <option value="2">Software</option>
                      </select>

                      {/* Category Filter */}
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="form-select"
                      >
                        <option value="all">All Categories</option>
                        <option value="1">Physical Machine</option>
                        <option value="2">Client VDI</option>
                      </select>
                    </div>


                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                      {loading ? (
                        <div className="flex items-center justify-center h-64">
                          <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        </div>
                      ) : assets.length === 0 ? (
                        <div className="p-12 text-center">
                          <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                          <p className="text-gray-500 text-lg mb-4">No assets found</p>
                          <button
                            onClick={() => {
                              resetAssetForm();
                              setCurrentPage("asset-form");
                            }}
                            className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                          >
                            Add Your First Asset
                          </button>
                        </div>
                      ) : (
                        <div className="overflow-x-auto">
                          <table className="w-full">
                            <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                              <tr>
                                <th className="px-6 py-4 text-left font-semibold">Name</th>
                                <th className="px-6 py-4 text-left font-semibold">Category</th>
                                <th className="px-6 py-4 text-left font-semibold">Type</th>
                                <th className="px-6 py-4 text-left font-semibold">Version</th>
                                <th className="px-6 py-4 text-left font-semibold">Specifications</th>
                                <th className="px-6 py-4 text-center font-semibold">Actions</th>
                              </tr>
                            </thead>
                            <tbody>
                              {filteredAssets.map((asset, idx) => (
                                <tr key={asset.id} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                  <td className="px-6 py-4 font-medium text-gray-800">
                                    <div className="flex items-center space-x-2">
                                      {asset.type === AssetType.Hardware ? (
                                        <HardDrive className="w-5 h-5 text-purple-600" />
                                      ) : (
                                        <Code className="w-5 h-5 text-cyan-600" />
                                      )}
                                      <span>{asset.name}</span>
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${asset.category === AssetCategory.PhysicalMachine
                                      ? "bg-blue-100 text-blue-700"
                                      : "bg-green-100 text-green-700"
                                      }`}>
                                      {getCategoryLabel(asset.category)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4">
                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${asset.type === AssetType.Hardware
                                      ? "bg-purple-100 text-purple-700"
                                      : "bg-cyan-100 text-cyan-700"
                                      }`}>
                                      {getTypeLabel(asset.type)}
                                    </span>
                                  </td>
                                  <td className="px-6 py-4 text-gray-700">{asset.version || "-"}</td>
                                  <td className="px-6 py-4 text-gray-700">
                                    <div className="max-w-xs truncate" title={asset.specifications}>
                                      {asset.specifications || "-"}
                                    </div>
                                  </td>
                                  <td className="px-6 py-4">
                                    <div className="flex items-center justify-center space-x-2">
                                      <button
                                        onClick={() => handleEditAsset(asset)}
                                        className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                        title="Edit"
                                      >
                                        <Edit2 className="w-4 h-4" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteAsset(asset.id)}
                                        disabled={loading}
                                        className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                        title="Delete"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </div>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {currentPage === "asset-form" && (
                  <div className="animate-fadeIn">
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      {editingAsset ? "Edit Asset" : "Add New Asset"}
                    </h1>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Asset Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={assetForm.name}
                            onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter asset name"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Category <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={assetForm.category}
                            onChange={(e) => setAssetForm({ ...assetForm, category: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                          >
                            <option value={AssetCategory.PhysicalMachine}>Physical Machine</option>
                            <option value={AssetCategory.ClientVDI}>Client VDI</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Type <span className="text-red-500">*</span>
                          </label>
                          <select
                            value={assetForm.type}
                            onChange={(e) => setAssetForm({ ...assetForm, type: parseInt(e.target.value) })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                          >
                            <option value={AssetType.Hardware}>Hardware</option>
                            <option value={AssetType.Software}>Software</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Version {assetForm.type === AssetType.Software && <span className="text-gray-500">(for software)</span>}
                          </label>
                          <input
                            type="text"
                            value={assetForm.version}
                            onChange={(e) => setAssetForm({ ...assetForm, version: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="e.g., v2.0.1"
                          />
                        </div>

                        <div className="md:col-span-2">
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Specifications {assetForm.type === AssetType.Hardware && <span className="text-gray-500">(for hardware)</span>}
                          </label>
                          <textarea
                            value={assetForm.specifications}
                            onChange={(e) => setAssetForm({ ...assetForm, specifications: e.target.value })}
                            rows="4"
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                            placeholder="Enter detailed specifications..."
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex space-x-4">
                        <button
                          onClick={handleSaveAsset}
                          disabled={loading}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>{editingAsset ? "Update" : "Save"} Asset</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            resetAssetForm();
                            setCurrentPage("assets");
                          }}
                          className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {currentPage === "sprint-velocity" && (
                  <div>
                    <div className="flex justify-between items-center mb-8">
                      <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        Sprint Velocity Tracker
                      </h1>
                      <button
                        onClick={() => { resetSprintForm(); setCurrentPage("sprint-form"); }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg"
                      >
                        <Plus className="w-5 h-5" />
                        <span>Add New Sprint</span>
                      </button>
                    </div>

                    {loading ? (
                      <div className="flex items-start justify-center h-64">
                        <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                      </div>
                    ) : (
                      <>
                        {getCurrentSprint() && (
                          <div className="bg-gradient-to-r from-purple-600 to-cyan-600 rounded-2xl shadow-lg p-6 mb-8 text-white">
                            <div className="flex items-start justify-between mb-6">
                              <div>
                                <p className="text-sm opacity-90 mb-1">Current Sprint</p>
                                <h2 className="text-3xl font-bold">{getCurrentSprint().sprintNumber}</h2>
                                <p className="mt-2 opacity-90">
                                  {new Date(getCurrentSprint().startDate).toLocaleDateString()} - {new Date(getCurrentSprint().endDate).toLocaleDateString()}
                                </p>
                              </div>
                              <div className="text-right space-y-2">
                                {/* <p className="text-sm opacity-90">Velocity Achieved</p>
                                <p className="text-5xl font-bold">
                                  {getCurrentSprint().velocityAchieved}
                                </p> */}

                                {currentSprintStoryPoints && (
                                  <div className="mt-3 text-sm space-y-1 opacity-90">
                                    <p>
                                      🟡 In Progress:{" "}
                                      <span className="font-semibold">
                                        {currentSprintStoryPoints.inProgressStoryPoints}
                                      </span>
                                    </p>
                                    <p>
                                      🟢 Completed:{" "}
                                      <span className="font-semibold">
                                        {currentSprintStoryPoints.completedStoryPoints}
                                      </span>
                                    </p>
                                    <p>
                                      📊 Total:{" "}
                                      <span className="font-semibold">
                                        {currentSprintStoryPoints.totalStoryPoints}
                                      </span>
                                    </p>
                                  </div>
                                )}
                              </div>
                            </div>

                            {currentSprintStoryPoints && (
                              <div className="grid grid-cols-3 gap-4 pt-6 border-t border-white/20">
                                <div className="text-center">
                                  <p className="text-sm opacity-90 mb-1">Total Points</p>
                                  <p className="text-2xl font-bold">{currentSprintStoryPoints.totalStoryPoints}</p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm opacity-90 mb-1">In Progress</p>
                                  <p className="text-2xl font-bold">{currentSprintStoryPoints.inProgressStoryPoints}</p>
                                  <p className="text-xs opacity-75 mt-1">
                                    {currentSprintStoryPoints.totalStoryPoints > 0
                                      ? `${Math.round((currentSprintStoryPoints.inProgressStoryPoints / currentSprintStoryPoints.totalStoryPoints) * 100)}%`
                                      : '0%'}
                                  </p>
                                </div>
                                <div className="text-center">
                                  <p className="text-sm opacity-90 mb-1">Completed</p>
                                  <p className="text-2xl font-bold">{currentSprintStoryPoints.completedStoryPoints}</p>
                                  <p className="text-xs opacity-75 mt-1">
                                    {currentSprintStoryPoints.totalStoryPoints > 0
                                      ? `${Math.round((currentSprintStoryPoints.completedStoryPoints / currentSprintStoryPoints.totalStoryPoints) * 100)}%`
                                      : '0%'}
                                  </p>
                                </div>
                              </div>
                            )}

                            {currentSprintStoryPoints && (
                              <div className="mt-4">
                                <div className="w-full bg-white/20 rounded-full h-3 overflow-hidden">
                                  <div
                                    className="bg-white h-full rounded-full transition-all duration-500"
                                    style={{
                                      width: `${currentSprintStoryPoints.totalStoryPoints > 0
                                        ? (currentSprintStoryPoints.completedStoryPoints / currentSprintStoryPoints.totalStoryPoints) * 100
                                        : 0}%`
                                    }}
                                  />
                                </div>
                                <p className="text-xs text-center mt-2 opacity-90">
                                  Sprint Progress: {currentSprintStoryPoints.totalStoryPoints > 0
                                    ? `${Math.round((currentSprintStoryPoints.completedStoryPoints / currentSprintStoryPoints.totalStoryPoints) * 100)}%`
                                    : '0%'} Complete
                                </p>
                              </div>
                            )}
                          </div>
                        )}

                        {sprints.length >= 1 && !selectedSprintId && (
                          <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
                            <h2 className="text-2xl font-bold text-gray-800 mb-6">Last 3 Sprints Performance</h2>
                            <ResponsiveContainer width="100%" height={300}>
                              <LineChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="name"
                                  padding={{ left: 90, right: 2 }} />
                                <YAxis />
                                <Tooltip />
                                <Legend />
                                <Line
                                  type="linear"
                                  dataKey="velocity"
                                  stroke="#8b5cf6"
                                  strokeWidth={3}
                                  name="Velocity Achieved"
                                  dot={{ fill: '#8b5cf6', r: 6 }}
                                  connectNulls={true}
                                />
                              </LineChart>
                            </ResponsiveContainer>
                          </div>
                        )}

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                          <div className="mb-6">
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                              Select Sprint to View Details
                            </label>
                            <select
                              value={selectedSprintId}
                              onChange={(e) => setSelectedSprintId(e.target.value)}
                              className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                            >
                              <option value="">-- Select a Sprint --</option>
                              {sprints.map((sprint) => (
                                <option key={sprint.id} value={sprint.id}>
                                  {sprint.sprintNumber} ({new Date(sprint.startDate).toLocaleDateString()} - {new Date(sprint.endDate).toLocaleDateString()})
                                </option>
                              ))}
                            </select>
                          </div>

                          {selectedSprintId && (() => {
                            const sprint = sprints.find(s => s.id === parseInt(selectedSprintId));
                            return sprint ? (
                              <div className="border-t pt-6">
                                <div className="flex justify-between items-start mb-6">
                                  <div>
                                    <h3 className="text-2xl font-bold text-gray-800 mb-2">{sprint.sprintNumber}</h3>
                                    <div className="space-y-2">
                                      <div className="flex items-center space-x-2 text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                        <span>Start: {new Date(sprint.startDate).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-gray-600">
                                        <Calendar className="w-5 h-5" />
                                        <span>End: {new Date(sprint.endDate).toLocaleDateString()}</span>
                                      </div>
                                      <div className="flex items-center space-x-2 text-gray-600">
                                        <TrendingUp className="w-5 h-5" />
                                        <span>Velocity: {sprintStoryPoints?.totalStoryPoints ?? sprint.velocityAchieved ?? 0}</span>
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex space-x-2">
                                    <button
                                      onClick={() => handleEditSprint(sprint)}
                                      className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500"
                                    >
                                      <Edit2 className="w-5 h-5" />
                                    </button>
                                    <button
                                      onClick={() => handleDeleteSprint(sprint.id)}
                                      disabled={loading}
                                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                                    >
                                      <Trash2 className="w-5 h-5" />
                                    </button>
                                  </div>
                                </div>

                                {loadingStoryPoints ? (
                                  <div className="flex items-center justify-center py-8">
                                    <Loader2 className="w-8 h-8 animate-spin text-purple-600" />
                                  </div>
                                ) : sprintStoryPoints ? (
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                    <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl p-6 text-white shadow-lg">
                                      <p className="text-sm opacity-90 mb-1">Total Story Points</p>
                                      <p className="text-4xl font-bold">{sprintStoryPoints.totalStoryPoints}</p>
                                    </div>
                                    <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-6 text-white shadow-lg">
                                      <p className="text-sm opacity-90 mb-1">In Progress</p>
                                      <p className="text-4xl font-bold">{sprintStoryPoints.inProgressStoryPoints}</p>
                                      <p className="text-xs mt-2 opacity-90">
                                        {sprintStoryPoints.totalStoryPoints > 0
                                          ? `${Math.round((sprintStoryPoints.inProgressStoryPoints / sprintStoryPoints.totalStoryPoints) * 100)}%`
                                          : '0%'}
                                      </p>
                                    </div>
                                    <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white shadow-lg">
                                      <p className="text-sm opacity-90 mb-1">Completed</p>
                                      <p className="text-4xl font-bold">{sprintStoryPoints.completedStoryPoints}</p>
                                      <p className="text-xs mt-2 opacity-90">
                                        {sprintStoryPoints.totalStoryPoints > 0
                                          ? `${Math.round((sprintStoryPoints.completedStoryPoints / sprintStoryPoints.totalStoryPoints) * 100)}%`
                                          : '0%'}
                                      </p>
                                    </div>
                                  </div>
                                ) : null}

                                <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6">
                                  <h4 className="font-semibold text-gray-800 mb-3">Sprint Duration</h4>
                                  <p className="text-gray-600">
                                    {Math.ceil((new Date(sprint.endDate) - new Date(sprint.startDate)) / (1000 * 60 * 60 * 24))} days
                                  </p>
                                </div>
                              </div>
                            ) : null;
                          })()}

                          {!selectedSprintId && sprints.length === 0 && (
                            <div className="text-center py-12">
                              <TrendingUp className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                              <p className="text-gray-500 text-lg mb-4">No sprints found</p>
                              <button
                                onClick={() => { resetSprintForm(); setCurrentPage("sprint-form"); }}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg"
                              >
                                Add Your First Sprint
                              </button>
                            </div>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}


                {currentPage === "sprint-form" && (
                  <div>
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                      {editingSprint ? "Edit Sprint" : "Add New Sprint"}
                    </h1>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sprint Number <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={sprintForm.sprintNumber}
                            onChange={(e) => setSprintForm({ ...sprintForm, sprintNumber: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                            placeholder="e.g., Sprint 24"
                          />
                        </div>

                        {/* <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Velocity Achieved <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="number"
                            value={sprintForm.velocityAchieved}
                            onChange={(e) => setSprintForm({ ...sprintForm, velocityAchieved: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                            placeholder="e.g., 42"
                            min="0"
                          />
                        </div> */}


                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Start Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={sprintForm.startDate}
                            onChange={(e) => setSprintForm({ ...sprintForm, startDate: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            End Date <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="date"
                            value={sprintForm.endDate}
                            onChange={(e) => setSprintForm({ ...sprintForm, endDate: e.target.value })}
                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                          />
                        </div>
                      </div>

                      <div className="mt-8 flex space-x-4">
                        <button
                          onClick={handleSaveSprint}
                          disabled={loading}
                          className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                        >
                          {loading ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                          ) : (
                            <>
                              <Plus className="w-5 h-5" />
                              <span>{editingSprint ? "Update" : "Save"} Sprint</span>
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => { resetSprintForm(); setCurrentPage("sprint-velocity"); }}
                          className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  </div>
                )}
                {isAuthenticated && currentPage === "sprint-tasks" && (
                  <SprintTaskManagement />
                )}

                {currentPage === "leave-records" && (
                  <LeaveManagement
                    userEmail={userEmail}
                    allUserDetails={allUserDetails}
                    refreshUserDetails={fetchAllUsers}
                    refreshCurrentUserDetails={() => fetchCurrentUserDetails(userEmail)}
                  />
                )}
                {currentPage === "is-tickets" && (
                  <ISTicketManagement
                    currentUserId={currentUserDetails?.empId}
                    currentUserName={currentUserDetails?.name || userName}
                    allUserDetails={allUserDetails}
                  />
                )}
                {currentPage === "issue-documents" && (
                  <IssueDocumentManagement
                    currentUserId={currentUserDetails?.empId}
                    currentUserName={currentUserDetails?.name || userName}
                    allUserDetails={allUserDetails}
                  />
                )}
                {currentPage === "lessons-learned" && (
                  <LessonLearnedManagement
                    currentUserId={currentUserDetails?.empId}
                    currentUserName={currentUserDetails?.name || userName}
                  />
                )}
                {currentPage === "Document-Managment" && (
                  <DocumentManagement
                    currentUserId={currentUserDetails?.empId}
                    currentUserName={currentUserDetails?.name || userName}
                    allUserDetails={allUserDetails}
                  />
                )}
                {currentPage === "sprint-Responsibility" && (
                  <SprintConfigManagement />
                )}
                {currentPage === "sprint-Feedback" && (
                  <SprintFeedbackManagement />
                )}
              </>
            )}
          </div>
        </main>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};


export default App;


