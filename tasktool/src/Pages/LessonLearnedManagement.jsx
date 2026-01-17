// LessonLearnedManagement.js
import React, { useState, useEffect } from "react";
import {
  BookOpen,
  Lightbulb,
  Plus,
  Edit2,
  Trash2,
  Loader2,
  Calendar,
  MessageSquare,
  Tag,
  Save,
  X,
  Search,
  Filter
} from "lucide-react";
import { lessonsLearnedService } from "../api/apiService";

const LessonLearnedManagement = ({ currentUserId, currentUserName }) => {
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [editingLesson, setEditingLesson] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedSource, setSelectedSource] = useState("");
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    lessonLearnt: "",
    comments: "",
    source: ""
  });

  const sourceOptions = [
    "Project Experience",
    "Code Review",
    "Bug Investigation",
    "Team Discussion",
    "Training Session",
    "Client Feedback",
    "Performance Issue",
    "Security Audit",
    "Deployment",
    "Testing",
    "Documentation",
    "Architecture Review",
    "Other"
  ];

  useEffect(() => {
    fetchLessons();
  }, []);

  const fetchLessons = async () => {
    try {
      setLoading(true);
      const response = await lessonsLearnedService.getAll();
      
      // Debug: Log the full response
      console.log("Full API Response:", response);
      console.log("Response data:", response.data);
      
      // Handle different response structures
      let data;
      if (Array.isArray(response.data)) {
        data = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        data = response.data.data;
      } else if (Array.isArray(response)) {
        data = response;
      } else {
        console.warn("Unexpected response structure:", response);
        data = [];
      }
      
      console.log("Processed lessons data:", data);
      setLessons(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch lessons learned: " + (err.message || "Unknown error"));
      console.error("Error fetching lessons:", err);
      setLessons([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const resetForm = () => {
    setFormData({
      date: new Date().toISOString().split('T')[0],
      lessonLearnt: "",
      comments: "",
      source: ""
    });
    setEditingLesson(null);
    setShowForm(false);
  };

  const handleSubmit = async () => {
    if (!formData.lessonLearnt || !formData.comments || !formData.source) {
      setError("Please fill in all required fields");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const submitData = {
        date: formData.date,
        lessonLearnt: formData.lessonLearnt,
        comments: formData.comments,
        source: formData.source
      };

      if (editingLesson) {
        await lessonsLearnedService.update(editingLesson.id, submitData);
      } else {
        await lessonsLearnedService.create(submitData);
      }

      await fetchLessons();
      resetForm();
    } catch (err) {
      setError(err.message || "Failed to save lesson learned");
      console.error("Error saving lesson:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (lesson) => {
    setEditingLesson(lesson);
    setFormData({
      date: lesson.date.split('T')[0],
      lessonLearnt: lesson.lessonLearnt,
      comments: lesson.comments,
      source: lesson.source
    });
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this lesson learned?")) return;

    try {
      setLoading(true);
      await lessonsLearnedService.delete(id);
      await fetchLessons();
      setError("");
    } catch (err) {
      setError("Failed to delete lesson: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // Enhanced filtering with month and source
  const filteredLessons = (lessons || []).filter(lesson => {
    // Search filter
    const matchesSearch = !searchTerm || 
      lesson.lessonLearnt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.comments.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lesson.source.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Month filter (format: YYYY-MM)
    let matchesMonth = true;
    if (selectedMonth) {
      const lessonDate = new Date(lesson.date);
      const year = lessonDate.getFullYear();
      const month = String(lessonDate.getMonth() + 1).padStart(2, '0');
      const lessonYearMonth = `${year}-${month}`;
      matchesMonth = lessonYearMonth === selectedMonth;
    }
    
    // Source filter
    const matchesSource = !selectedSource || lesson.source === selectedSource;
    
    return matchesSearch && matchesMonth && matchesSource;
  });

  const getSourceColor = (source) => {
    const colors = {
      "Project Experience": "bg-blue-100 text-blue-700",
      "Code Review": "bg-purple-100 text-purple-700",
      "Bug Investigation": "bg-red-100 text-red-700",
      "Team Discussion": "bg-green-100 text-green-700",
      "Training Session": "bg-yellow-100 text-yellow-700",
      "Client Feedback": "bg-pink-100 text-pink-700",
      "Performance Issue": "bg-orange-100 text-orange-700",
      "Security Audit": "bg-indigo-100 text-indigo-700",
      "Deployment": "bg-teal-100 text-teal-700",
      "Testing": "bg-cyan-100 text-cyan-700",
      "Documentation": "bg-lime-100 text-lime-700",
      "Architecture Review": "bg-violet-100 text-violet-700",
      "Other": "bg-gray-100 text-gray-700"
    };
    return colors[source] || "bg-gray-100 text-gray-700";
  };

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
            Learnings
          </h1>
          <p className="text-gray-600 mt-2">Document and share knowledge from experiences</p>
        </div>
        <button
          onClick={() => {
            resetForm();
            setShowForm(true);
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add </span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-start space-x-2">
          <MessageSquare className="w-5 h-5 mt-0.5 flex-shrink-0" />
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
          <h2 className="text-2xl font-bold text-gray-800 mb-6 flex items-center space-x-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            <span>{editingLesson ? "Edit Learning Learned" : "Add New Learning Learned"}</span>
          </h2>

          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                />
              </div>

              {/* Source */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Source <span className="text-red-500">*</span>
                </label>
                <select
                  name="source"
                  value={formData.source}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                >
                  <option value="">Select Source</option>
                  {sourceOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              {/* Learning Learnt */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Learning Learnt <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="lessonLearnt"
                  value={formData.lessonLearnt}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  placeholder="What did you learn? Be specific and clear..."
                />
              </div>

              {/* Comments */}
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Comments / Context <span className="text-red-500">*</span>
                </label>
                <textarea
                  name="comments"
                  value={formData.comments}
                  onChange={handleInputChange}
                  rows="4"
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                  placeholder="Provide context, why this is important, and how it can be applied..."
                />
              </div>
            </div>

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
                    <span>{editingLesson ? "Update Learning" : "Save Learning"}</span>
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

      {/* Search and Filters Section - Only show when form is hidden */}
      {!showForm && lessons.length > 0 && (
        <div className="mb-6 space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search lessons by content, comments, or source..."
              className="w-full pl-12 pr-4 py-3 bg-white border-2 border-gray-200 focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
            />
          </div>

          {/* Filters Row */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Month Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Filter by Month</span>
              </label>
              <input
                type="month"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              />
            </div>

            {/* Source Filter */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1">
                <Filter className="w-4 h-4" />
                <span>Filter by Source</span>
              </label>
              <select
                value={selectedSource}
                onChange={(e) => setSelectedSource(e.target.value)}
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              >
                <option value="">All Sources</option>
                {sourceOptions.map(option => (
                  <option key={option} value={option}>{option}</option>
                ))}
              </select>
            </div>

            {/* Clear Filters Button */}
            <div className="flex items-end">
              <button
                onClick={() => {
                  setSearchTerm("");
                  setSelectedMonth("");
                  setSelectedSource("");
                }}
                disabled={!searchTerm && !selectedMonth && !selectedSource}
                className="w-full px-4 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <X className="w-5 h-5" />
                <span>Clear Filters</span>
              </button>
            </div>
          </div>

          {/* Active Filters Summary */}
          {(searchTerm || selectedMonth || selectedSource) && (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span className="font-semibold text-gray-700 flex items-center space-x-1">
                <Filter className="w-4 h-4" />
                <span>Active filters:</span>
              </span>
              {searchTerm && (
                <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full flex items-center space-x-1">
                  <Search className="w-3 h-3" />
                  <span>Search: "{searchTerm}"</span>
                </span>
              )}
              {selectedMonth && (
                <span className="px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full flex items-center space-x-1">
                  <Calendar className="w-3 h-3" />
                  <span>Month: {new Date(selectedMonth + "-01").toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span>
                </span>
              )}
              {selectedSource && (
                <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full flex items-center space-x-1">
                  <Tag className="w-3 h-3" />
                  <span>Source: {selectedSource}</span>
                </span>
              )}
              <span className="text-gray-500 ml-2">
                ({filteredLessons.length} result{filteredLessons.length !== 1 ? 's' : ''})
              </span>
            </div>
          )}
        </div>
      )}

      {/* Lessons List - Only show when form is hidden */}
      {!showForm && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading && !showForm ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : filteredLessons.length === 0 ? (
          <div className="p-12 text-center">
            {(searchTerm || selectedMonth || selectedSource) ? (
              <>
                <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No lessons found matching your filters</p>
                <button
                  onClick={() => {
                    setSearchTerm("");
                    setSelectedMonth("");
                    setSelectedSource("");
                  }}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Clear All Filters
                </button>
              </>
            ) : (
              <>
                <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500 text-lg mb-4">No lessons learned documented yet</p>
                <button
                  onClick={() => setShowForm(true)}
                  className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                >
                  Add Learning
                </button>
              </>
            )}
          </div>
        ) : (
          <div className="p-6 space-y-4">
            {filteredLessons.map((lesson) => (
              <div
                key={lesson.id}
                className="border-2 border-gray-100 rounded-xl p-6 hover:border-purple-200 hover:shadow-md transition-all duration-300"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getSourceColor(lesson.source)}`}>
                        {lesson.source}
                      </span>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(lesson.date).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => handleEdit(lesson)}
                      className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                      title="Edit"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(lesson.id)}
                      disabled={loading}
                      className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <Lightbulb className="w-5 h-5 text-yellow-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Learning Learned</h3>
                        <p className="text-gray-700 leading-relaxed">{lesson.lessonLearnt}</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-start space-x-2">
                      <MessageSquare className="w-5 h-5 text-purple-500 mt-0.5 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-gray-800 mb-1">Context & Comments</h3>
                        <p className="text-gray-700 leading-relaxed">{lesson.comments}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Summary Stats - Updated to show filtered results */}
      {lessons.length > 0 && !showForm && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">
                  {(searchTerm || selectedMonth || selectedSource) ? 'Filtered Lessons' : 'Total Lessons'}
                </p>
                <p className="text-3xl font-bold">{filteredLessons.length}</p>
                {(searchTerm || selectedMonth || selectedSource) && (
                  <p className="text-xs opacity-75 mt-1">of {lessons.length} total</p>
                )}
              </div>
              <BookOpen className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">This Month</p>
                <p className="text-3xl font-bold">
                  {filteredLessons.filter(l => {
                    const lessonDate = new Date(l.date);
                    const now = new Date();
                    return lessonDate.getMonth() === now.getMonth() && 
                           lessonDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="w-12 h-12 opacity-50" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 rounded-xl p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm opacity-90 mb-1">Unique Sources</p>
                <p className="text-3xl font-bold">
                  {new Set(filteredLessons.map(l => l.source)).size}
                </p>
              </div>
              <Tag className="w-12 h-12 opacity-50" />
            </div>
          </div>
        </div>
      )}

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

export default LessonLearnedManagement;