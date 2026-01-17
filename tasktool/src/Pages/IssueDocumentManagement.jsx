import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  FileText,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  ExternalLink,
  Save,
  X
} from "lucide-react";

import { issueDocumentService } from "../api/apiService";
import { userDetailsService } from "../api/apiService";

const IssueDocumentManagement = () => {
  const [issues, setIssues] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingIssue, setEditingIssue] = useState(null);
  
  const [formData, setFormData] = useState({
    issueDate: new Date().toISOString().split('T')[0],
    teamMemberId: "",
    type: "",
    comments: "",
    didDelayClientDelivery: false,
    issueDetails: "",
    approachToSolve: "",
    technicalInvestigation: "",
    fixImplementation: "",
    documentLink: ""
  });

  const issueTypes = [
    "Bug",
    "Performance Issue",
    "Security Vulnerability",
    "Configuration Error",
    "Integration Issue",
    "Data Quality Issue",
    "Infrastructure Problem",
    "Other"
  ];

  useEffect(() => {
    fetchIssues();
    fetchUsers();
  }, []);

  const fetchIssues = async () => {
    try {
      setLoading(true);
      const data = await issueDocumentService.getAll();
      setIssues(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch issues: " + (err.message || "Unknown error"));
      console.error("Error fetching issues:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const data = await issueDocumentService.getUsers();
      setUsers(data);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const resetForm = () => {
    setFormData({
      issueDate: new Date().toISOString().split('T')[0],
      teamMemberId: "",
      type: "",
      comments: "",
      didDelayClientDelivery: false,
      issueDetails: "",
      approachToSolve: "",
      technicalInvestigation: "",
      fixImplementation: "",
      documentLink: ""
    });
    setEditingIssue(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.teamMemberId || !formData.type || !formData.comments) {
      setError("Please fill in all required fields");
      return;
    }

    if (formData.didDelayClientDelivery && (
      !formData.issueDetails || 
      !formData.approachToSolve || 
      !formData.technicalInvestigation || 
      !formData.fixImplementation
    )) {
      setError("When delay occurred, all investigation fields are required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData = {
        issueDate: formData.issueDate,
        teamMemberId: parseInt(formData.teamMemberId),
        type: formData.type,
        comments: formData.comments,
        didDelayClientDelivery: formData.didDelayClientDelivery,
        issueDetails: formData.didDelayClientDelivery ? formData.issueDetails : null,
        approachToSolve: formData.didDelayClientDelivery ? formData.approachToSolve : null,
        technicalInvestigation: formData.didDelayClientDelivery ? formData.technicalInvestigation : null,
        fixImplementation: formData.didDelayClientDelivery ? formData.fixImplementation : null,
        documentLink: formData.documentLink || ''
      };

      if (editingIssue) {
        await issueDocumentService.update(editingIssue.id, submitData);
      } else {
        await issueDocumentService.create(submitData);
      }

      await fetchIssues();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save issue document");
      console.error("Error saving issue:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (issue) => {
    setEditingIssue(issue);
    setFormData({
      issueDate: issue.issueDate.split('T')[0],
      teamMemberId: issue.teamMemberId.toString(),
      type: issue.type,
      comments: issue.comments,
      didDelayClientDelivery: issue.didDelayClientDelivery,
      issueDetails: issue.issueDetails || "",
      approachToSolve: issue.approachToSolve || "",
      technicalInvestigation: issue.technicalInvestigation || "",
      fixImplementation: issue.fixImplementation || "",
      documentLink: issue.documentLink || ""
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this issue document?")) return;

    try {
      setLoading(true);
      await issueDocumentService.delete(id);
      await fetchIssues();
      setError("");
    } catch (err) {
      setError("Failed to delete issue: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const getUserName = (userId) => {
    const user = users.find(u => u.id === userId);
    return user ? user.name : "Unknown";
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Issue Document Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Report New Issue</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start space-x-2">
          <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
          <div className="flex-1">
            <span>{error}</span>
          </div>
          <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {showForm && (
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {editingIssue ? "Edit Issue Document" : "Report New Issue"}
          </h2>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Issue Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="issueDate"
                  value={formData.issueDate}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                />
              </div>

              {/* Team Member */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Team Member <span className="text-red-500">*</span>
                </label>
                <select
                  name="teamMemberId"
                  value={formData.teamMemberId}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                >
                  <option value="">Select Team Member</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                  ))}
                </select>
              </div>

              {/* Issue Type */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Issue Type <span className="text-red-500">*</span>
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                >
                  <option value="">Select Issue Type</option>
                  {issueTypes.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              {/* Document Link */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Document Link
                </label>
                <input
                  type="url"
                  name="documentLink"
                  value={formData.documentLink}
                  onChange={handleInputChange}
                  placeholder="https://..."
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                />
              </div>

              {/* Comments */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows="3"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  placeholder="Describe the issue..."
                />
              </div>

              {/* Did Delay Client Delivery */}
              <div className="md:col-span-2">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="didDelayClientDelivery"
                    checked={formData.didDelayClientDelivery}
                    onChange={handleInputChange}
                    className="w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                  />
                  <span className="text-sm font-semibold text-gray-700">
                    This issue caused delay in client delivery
                  </span>
                </label>
              </div>
            </div>

            {/* Conditional Fields for Delayed Delivery */}
            {formData.didDelayClientDelivery && (
              <div className="mt-6 p-6 bg-orange-50 rounded-xl border-2 border-orange-200">
                <h3 className="text-lg font-bold text-orange-800 mb-4 flex items-center space-x-2">
                  <AlertCircle className="w-5 h-5" />
                  <span>Detailed Investigation Required</span>
                </h3>

                <div className="space-y-6">
                  {/* Issue Details */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Issue Details <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="issueDetails"
                      value={formData.issueDetails}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all duration-300"
                      placeholder="Detailed description of the issue..."
                    />
                  </div>

                  {/* Approach to Solve */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Approach to Solve <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="approachToSolve"
                      value={formData.approachToSolve}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all duration-300"
                      placeholder="Describe the approach taken to solve the issue..."
                    />
                  </div>

                  {/* Technical Investigation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Technical Investigation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="technicalInvestigation"
                      value={formData.technicalInvestigation}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all duration-300"
                      placeholder="Technical investigation findings..."
                    />
                  </div>

                  {/* Fix Implementation */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Fix Implementation <span className="text-red-500">*</span>
                    </label>
                    <textarea
                      name="fixImplementation"
                      value={formData.fixImplementation}
                      onChange={handleInputChange}
                      rows="3"
                      className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-orange-500 rounded-xl outline-none transition-all duration-300"
                      placeholder="How the fix was implemented..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Form Actions */}
            <div className="mt-8 flex space-x-4">
              <button
                onClick={handleSubmit}
                disabled={loading}
                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>{editingIssue ? "Update Issue" : "Save Issue"}</span>
                  </>
                )}
              </button>
              <button
                onClick={resetForm}
                className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Issues List */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : issues.length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">No issue documents found</p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Report First Issue
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left font-semibold">Date</th>
                  <th className="px-6 py-4 text-left font-semibold">Team Member</th>
                  <th className="px-6 py-4 text-left font-semibold">Type</th>
                  <th className="px-6 py-4 text-left font-semibold">Comments</th>
                  <th className="px-6 py-4 text-center font-semibold">Delayed Delivery</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {issues.map((issue, idx) => (
                  <tr key={issue.id} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        <span className="font-medium text-gray-800">
                          {new Date(issue.issueDate).toLocaleDateString()}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <User className="w-4 h-4 text-gray-400" />
                        <span className="text-gray-700">{issue.teamMemberName}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                        {issue.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs truncate text-gray-700" title={issue.comments}>
                        {issue.comments}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        {issue.didDelayClientDelivery ? (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-red-100 text-red-700">
                            <XCircle className="w-4 h-4" />
                            <span>Yes</span>
                          </span>
                        ) : (
                          <span className="flex items-center space-x-1 px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-700">
                            <CheckCircle className="w-4 h-4" />
                            <span>No</span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        {issue.documentLink && (
                          <a
                            href={issue.documentLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                            title="View Document"
                          >
                            <ExternalLink className="w-4 h-4" />
                          </a>
                        )}
                        <button
                          onClick={() => handleEdit(issue)}
                          className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(issue.id)}
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

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
    </div>
  );
};

export default IssueDocumentManagement;