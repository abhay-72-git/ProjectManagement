import React, { useState, useEffect } from 'react';
import { Calendar, Users, Send, BarChart3, Plus, Edit2, Trash2, Loader2 } from 'lucide-react';


import { sprintResponsibilityService } from "../api/apiService";
export default function SprintConfigManagement() {
    const [currentPage, setCurrentPage] = useState('list');
    const [sprints, setSprints] = useState([]);
    const [users, setUsers] = useState([]);
    const [configs, setConfigs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingConfig, setEditingConfig] = useState(null);

    const [formData, setFormData] = useState({
        sprintId: '',
        sprintNumber: '',
        startDate: '',
        endDate: '',
        dsrSendingUserId: '',
        dataMatrixUserId: '',
        scrumMasterUserId: ''
    });

    useEffect(() => {
        loadInitialData();
    }, []);

    useEffect(() => {
        if (currentPage === 'list') {
            fetchConfigs();
        }
    }, [currentPage]);

    const loadInitialData = async () => {
        try {
            setLoading(true);
            const [sprintsData, usersData] = await Promise.all([
                sprintResponsibilityService.getSprints(),
                sprintResponsibilityService.getUsers()
            ]);
            setSprints(sprintsData);
            setUsers(usersData);
            setError('');
        } catch (err) {
            setError('Failed to load data: ' + (err.message || 'Unknown error'));
            console.error('Error loading data:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchConfigs = async () => {
        try {
            setLoading(true);
            const data = await sprintResponsibilityService.getAll();
            setConfigs(data);
            setError('');
        } catch (err) {
            setError('Failed to fetch configurations: ' + (err.message || 'Unknown error'));
            console.error('Error fetching configs:', err);
        } finally {
            setLoading(false);
        }
    };

   const handleSprintChange = async (sprintId) => {
  // ✅ define it FIRST
  const selectedSprint = sprints.find(
    s => String(s.id) === String(sprintId)
  );

  setFormData(prev => ({
    ...prev,
    sprintId,
    sprintNumber: selectedSprint ? selectedSprint.sprintNumber : ''
  }));

        if (sprintId) {
            try {
                const dates = await sprintResponsibilityService.getSprintDates(sprintId);
                setFormData(prev => ({
                    ...prev,
                    startDate: dates.startDate.split('T')[0],
                    endDate: dates.endDate.split('T')[0]
                }));
            } catch (err) {
                setError('Error fetching sprint dates: ' + err.message);
                console.error('Error fetching sprint dates:', err);
            }
        } else {
            setFormData(prev => ({
                ...prev,
                startDate: '',
                endDate: ''
            }));
        }
    };

    const handleSaveConfig = async () => {
        if (!formData.sprintId || !formData.dsrSendingUserId ||
            !formData.dataMatrixUserId || !formData.scrumMasterUserId) {
            setError('All fields are required');
            return;
        }

        try {
            setLoading(true);
            setError('');

            const payload = {
                sprintId: parseInt(formData.sprintId),
                sprintNumber: formData.sprintNumber,
                startDate: new Date(formData.startDate).toISOString(),
                endDate: new Date(formData.endDate).toISOString(),
                dsrSendingUserId: parseInt(formData.dsrSendingUserId),
                dataMatrixUserId: parseInt(formData.dataMatrixUserId),
                scrumMasterUserId: parseInt(formData.scrumMasterUserId)
            };

            if (editingConfig) {
                await sprintResponsibilityService.update(editingConfig.id, payload);
            } else {
                await sprintResponsibilityService.create(payload);
            }

            await fetchConfigs();
            resetForm();
            setCurrentPage('list');
        } catch (err) {
            setError(err.message || 'Failed to save configuration');
            console.error('Error saving config:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditConfig = (config) => {
        setEditingConfig(config);

        setFormData({
            sprintId: config.sprintId?.toString() ?? '',
            sprintNumber: config.sprintNumber ?? '',
            startDate: config.startDate ? config.startDate.split('T')[0] : '',
            endDate: config.endDate ? config.endDate.split('T')[0] : '',
            dsrSendingUserId: config.dsrSendingUserId?.toString() ?? '',
            dataMatrixUserId: config.dataMatrixUserId?.toString() ?? '',
            scrumMasterUserId: config.scrumMasterUserId?.toString() ?? ''
        });

        setCurrentPage('form');
    };


    const handleDeleteConfig = async (id) => {
        if (!window.confirm('Are you sure you want to delete this configuration?')) return;

        try {
            setLoading(true);
            await sprintResponsibilityService.delete(id);
            await fetchConfigs();
            setError('');
        } catch (err) {
            setError('Failed to delete configuration: ' + err.message);
            console.error('Error deleting config:', err);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingConfig(null);
        setFormData({
            sprintId: '',
            sprintNumber: '',
            startDate: '',
            endDate: '',
            dsrSendingUserId: '',
            dataMatrixUserId: '',
            scrumMasterUserId: ''
        });
    };

    const getSprintName = (sprintId) => {
  const sprint = sprints.find(s => s.id === sprintId);
  return sprint ? sprint.sprintNumber : `Sprint-${sprintId}`;
};

    const getUserName = (userId) => {
        const user = users.find(u => u.id === userId);
        return user ? user.name : 'Unknown';
    };

    // Get names from config response if available
    const getDisplaySprintName = (config) => {
  return config.sprintNumber ?? `Sprint-${config.sprintId}`;
};

    const getDisplayUserName = (config, field) => {
        if (field === 'dsr' && config.dsrSendingUser) return config.dsrSendingUser;
        if (field === 'matrix' && config.dataMatrixUser) return config.dataMatrixUser;
        if (field === 'scrum' && config.scrumMasterUser) return config.scrumMasterUser;

        // Fallback to looking up by ID
        if (field === 'dsr') return getUserName(config.dsrSendingUserId);
        if (field === 'matrix') return getUserName(config.dataMatrixUserId);
        if (field === 'scrum') return getUserName(config.scrumMasterUserId);
        return 'Unknown';
    };

    return (
        <div className="animate-fadeIn">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                        ✕
                    </button>
                </div>
            )}

            {currentPage === 'list' && (
                <div>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            Sprint Configuration
                        </h1>
                        <button
                            onClick={() => {
                                resetForm();
                                setCurrentPage('form');
                            }}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add New Configuration</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                            </div>
                        ) : configs.length === 0 ? (
                            <div className="p-12 text-center">
                                <BarChart3 className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg mb-4">No sprint configurations found</p>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setCurrentPage('form');
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    Add Your First Configuration
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Sprint Number</th>
                                            <th className="px-6 py-4 text-left font-semibold">Start Date</th>
                                            <th className="px-6 py-4 text-left font-semibold">End Date</th>
                                            <th className="px-6 py-4 text-left font-semibold">Duration</th>
                                            <th className="px-6 py-4 text-left font-semibold">DSR Sending</th>
                                            <th className="px-6 py-4 text-left font-semibold">Data Matrix</th>
                                            <th className="px-6 py-4 text-left font-semibold">Scrum Master</th>
                                            <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {configs.map((config, idx) => (
                                            <tr
                                                key={config.id}
                                                className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'
                                                    }`}
                                            >
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    {getDisplaySprintName(config)}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {new Date(config.startDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    {new Date(config.endDate).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <span className="px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-700">
                                                        {config.durationInDays} days
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="flex items-center space-x-2">
                                                        <Send className="w-4 h-4 text-green-600" />
                                                        <span>{getDisplayUserName(config, 'dsr')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="flex items-center space-x-2">
                                                        <BarChart3 className="w-4 h-4 text-purple-600" />
                                                        <span>{getDisplayUserName(config, 'matrix')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="flex items-center space-x-2">
                                                        <Users className="w-4 h-4 text-orange-600" />
                                                        <span>{getDisplayUserName(config, 'scrum')}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditConfig(config)}
                                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteConfig(config.id)}
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

            {currentPage === 'form' && (
                <div>
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        {editingConfig ? 'Edit Sprint Configuration' : 'Add New Sprint Configuration'}
                    </h1>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="space-y-6">
                            {/* Sprint Selection */}
                            <div>
                                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                    <BarChart3 className="w-4 h-4 mr-2 text-blue-600" />
                                    Sprint Number <span className="text-red-500 ml-1">*</span>
                                </label>
                                <select
                                    value={formData.sprintId}
                                    onChange={(e) => handleSprintChange(e.target.value)}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                >
                                    <option value="">Select Sprint</option>
                                    {sprints.map(sprint => (
                                        <option
                                            key={sprint.id ?? sprint.sprintId}
                                            value={String(sprint.id ?? sprint.sprintId)}
                                        >
                                            {sprint.name ?? sprint.sprintNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Date Fields */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                        Start Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.startDate}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl outline-none cursor-not-allowed"
                                    />
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                        <Calendar className="w-4 h-4 mr-2 text-blue-600" />
                                        End Date
                                    </label>
                                    <input
                                        type="date"
                                        value={formData.endDate}
                                        readOnly
                                        className="w-full px-4 py-3 bg-gray-100 border-2 border-transparent rounded-xl outline-none cursor-not-allowed"
                                    />
                                </div>
                            </div>

                            {/* User Dropdowns */}
                            <div className="space-y-6 pt-4">
                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                        <Send className="w-4 h-4 mr-2 text-green-600" />
                                        DSR Sending User <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={formData.dsrSendingUserId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dsrSendingUserId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                        <BarChart3 className="w-4 h-4 mr-2 text-purple-600" />
                                        Data Matrix User <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={formData.dataMatrixUserId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, dataMatrixUserId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                                        <Users className="w-4 h-4 mr-2 text-orange-600" />
                                        Scrum Master <span className="text-red-500 ml-1">*</span>
                                    </label>
                                    <select
                                        value={formData.scrumMasterUserId}
                                        onChange={(e) => setFormData(prev => ({ ...prev, scrumMasterUserId: e.target.value }))}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    >
                                        <option value="">Select User</option>
                                        {users.map(user => (
                                            <option key={user.id} value={String(user.id)}>
                                                {user.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {/* Submit Buttons */}
                            <div className="mt-8 flex space-x-4">
                                <button
                                    onClick={handleSaveConfig}
                                    disabled={loading}
                                    className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <Plus className="w-5 h-5" />
                                            <span>{editingConfig ? 'Update' : 'Create'} Configuration</span>
                                        </>
                                    )}
                                </button>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setCurrentPage('list');
                                    }}
                                    className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .animate-fadeIn { animation: fadeIn 0.5s ease-out; }
      `}</style>
        </div>
    );
}