import React, { useState, useEffect } from "react";
import {
    Plus,
    Edit2,
    Trash2,
    Loader2,
    Filter,
    X,
    Calendar,
    User,
    CheckCircle,
    Clock,
    PauseCircle,
    AlertCircle,
    Info,
    Download
} from "lucide-react";
import * as XLSX from "xlsx";
import { sprintTaskService } from "../api/apiService";


const SprintTaskManagement = () => {
    const [tasks, setTasks] = useState([]);
    const [filteredTasks, setFilteredTasks] = useState([]);
    const [sprints, setSprints] = useState([]);
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showForm, setShowForm] = useState(false);
    const [editingTask, setEditingTask] = useState(null);
    const [showFilters, setShowFilters] = useState(false);

    // Form state - UPDATED
    const [taskForm, setTaskForm] = useState({
        sprintVelocityId: "",
        epic: "",
        story: "",
        task: "",
        storyPoint: "",
        coordinatorStoryPoint: "",
        ownerIds: [],
        coordinatorIds: [],
        reviewerId: "",
        assignedDate: "",
        currentStatus: "InProgress",
        startDate: "",
        endDate: "",
        requirementUnderstanding: "",
        dependencies: "",
        definitionOfDone: "",
        delivery: "On-Time",
        comments: "",
        testEvidenceAttached: false
    });

    // Filter state
    const [filters, setFilters] = useState({
        sprintNumber: "",
        month: "",
        owner: ""
    });

    useEffect(() => {
        fetchInitialData();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [tasks, filters]);

    const fetchInitialData = async () => {
        try {
            setLoading(true);
            const [tasksData, sprintsData, usersData] = await Promise.all([
                sprintTaskService.getAll(),
                sprintTaskService.getSprints(),
                sprintTaskService.getUsers()
            ]);

            console.log("Fetched Tasks:", tasksData);
            console.log("Fetched Sprints:", sprintsData);
            console.log("Fetched Users:", usersData);
            setTasks(tasksData);
            setSprints(sprintsData);
            setUsers(usersData);
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const applyFilters = () => {
        let filtered = [...tasks];

        if (filters.sprintNumber) {
            filtered = filtered.filter(task =>
                task.sprintVelocityId === parseInt(filters.sprintNumber)
            );
        }

        if (filters.month) {
            filtered = filtered.filter(task => {
                const taskMonth = new Date(task.startDate).toISOString().substring(0, 7);
                return taskMonth === filters.month;
            });
        }

        if (filters.owner) {
            filtered = filtered.filter(task =>
                task.ownerIds && task.ownerIds.includes(parseInt(filters.owner))
            );
        }
        console.log("Filters applied:", filters);
        console.log("Filtered Tasks before set:", filtered);
        setFilteredTasks(filtered);
    };

    const handleDownloadExcel = () => {
        try {
            const excelData = filteredTasks.map(task => {
                const sprint = sprints.find(s => s.id === task.sprintVelocityId);
                const owners = task.ownerIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ') || '-';
                const coordinators = task.coordinatorIds?.map(id => users.find(u => u.id === id)?.name).filter(Boolean).join(', ') || '-';
                const reviewer = users.find(u => u.id === task.reviewerId);

                return {
                    'Sprint Number': sprint?.sprintNumber || '-',
                    'Epic': task.epic,
                    'Story': task.story,
                    'Task': task.task,
                    'Story Point': task.storyPoint,
                    'Coordinator Story Point': task.coordinatorStoryPoint || '-',
                    'Owners': owners,
                    'Coordinators': coordinators,
                    'Reviewer': reviewer?.name || '-',
                    'Assigned Date': task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : '-',
                    'Start Date': task.startDate ? new Date(task.startDate).toLocaleDateString() : '-',
                    'End Date': task.endDate ? new Date(task.endDate).toLocaleDateString() : '-',
                    'Current Status': task.currentStatus,
                    'Delivery': task.delivery,
                    'Test Evidence': task.testEvidenceAttached ? 'Yes' : 'No',
                    'Requirement Understanding': task.requirementUnderstanding || '-',
                    'Dependencies': task.dependencies || '-',
                    'Definition of Done': task.definitionOfDone || '-',
                    'Comments': task.comments || '-'
                };
            });

            const worksheet = XLSX.utils.json_to_sheet(excelData);
            const columnWidths = [
                { wch: 15 }, { wch: 25 }, { wch: 30 }, { wch: 30 },
                { wch: 12 }, { wch: 18 }, { wch: 25 }, { wch: 25 }, { wch: 20 },
                { wch: 15 }, { wch: 15 }, { wch: 15 }, { wch: 15 },
                { wch: 12 }, { wch: 15 }, { wch: 35 }, { wch: 35 },
                { wch: 35 }, { wch: 35 }
            ];
            worksheet['!cols'] = columnWidths;

            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Sprint Tasks');

            const date = new Date().toISOString().split('T')[0];
            const filename = `Sprint_Tasks_${date}.xlsx`;
            XLSX.writeFile(workbook, filename);
        } catch (err) {
            setError("Failed to download Excel file: " + err.message);
        }
    };

    const handleSprintChange = async (sprintId) => {
        setTaskForm({ ...taskForm, sprintVelocityId: sprintId });

        if (sprintId) {
            try {
                const dates = await sprintTaskService.getSprintDates(sprintId);
                setTaskForm(prev => ({
                    ...prev,
                    sprintVelocityId: sprintId,
                    sprintStartDate: dates.startDate.split('T')[0],
                    sprintEndDate: dates.endDate.split('T')[0]
                }));
            } catch (err) {
                console.error("Error fetching sprint dates:", err);
            }
        }
    };

    const handleSaveTask = async () => {
        if (!taskForm.sprintVelocityId || !taskForm.epic || !taskForm.story || !taskForm.task) {
            setError("Please fill in all required fields");
            return;
        }

        try {
            setLoading(true);
            setError("");

            const taskData = {
                ...taskForm,
                sprintVelocityId: parseInt(taskForm.sprintVelocityId),
                storyPoint: parseInt(taskForm.storyPoint) || 0,
                coordinatorStoryPoint: parseInt(taskForm.coordinatorStoryPoint) || 0,
                ownerIds: taskForm.ownerIds.map(id => parseInt(id)),
                coordinatorIds: taskForm.coordinatorIds.map(id => parseInt(id)),
                reviewerId: parseInt(taskForm.reviewerId),
                testEvidenceAttached: taskForm.testEvidenceAttached === "true" || taskForm.testEvidenceAttached === true
            };

            if (editingTask) {
                await sprintTaskService.update(editingTask.id, taskData);
            } else {
                await sprintTaskService.create(taskData);
            }

            await fetchInitialData();
            resetForm();
            setShowForm(false);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTask = (task, isDisabled) => {
        setEditingTask(task);
        setTaskForm({
            id: task.id,
            sprintVelocityId: task.sprintVelocityId?.toString() || "",
    epic: task.epic || "",
    story: task.story || "",
    task: task.task || "",
    storyPoint: task.storyPoint?.toString() || "",
    coordinatorStoryPoint: task.coordinatorStoryPoint?.toString() || "",
    ownerIds: task.ownerIds || [],
    coordinatorIds: task.coordinatorIds || [],
    reviewerId: task.reviewerId?.toString() || "",
    assignedDate: task.assignedDate ? task.assignedDate.split('T')[0] : "",
    currentStatus: task.currentStatus || "InProgress",
    startDate: task.startDate ? task.startDate.split('T')[0] : "",
    endDate: task.endDate ? task.endDate.split('T')[0] : "",
    requirementUnderstanding: task.requirementUnderstanding || "",
    dependencies: task.dependencies || "",
    definitionOfDone: task.definitionOfDone || "",
    delivery: task.delivery || "On-Time",
    comments: task.comments || "",
    testEvidenceAttached: task.testEvidenceAttached || false,
    isDisabled: isDisabled,
        });
        setShowForm(true);
    };

    const handleDeleteTask = async (id) => {
        if (!window.confirm("Are you sure you want to delete this task?")) return;

        try {
            setLoading(true);
            await sprintTaskService.delete(id);
            await fetchInitialData();
            setError("");
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setEditingTask(null);
        setTaskForm({
            sprintVelocityId: "",
            epic: "",
            story: "",
            task: "",
            storyPoint: "",
            coordinatorStoryPoint: "",
            ownerIds: [],
            coordinatorIds: [],
            reviewerId: "",
            assignedDate: "",
            currentStatus: "InProgress",
            startDate: "",
            endDate: "",
            requirementUnderstanding: "",
            dependencies: "",
            definitionOfDone: "",
            delivery: "On-Time",
            comments: "",
            testEvidenceAttached: false
        });
    };

    const getStatusIcon = (status) => {
        switch (status) {
            case "Completed":
                return <CheckCircle className="w-5 h-5 text-green-600" />;
            case "InProgress":
                return <Clock className="w-5 h-5 text-blue-600" />;
            case "OnHold":
                return <PauseCircle className="w-5 h-5 text-yellow-600" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-600" />;
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case "Completed":
                return "bg-green-100 text-green-700";
            case "InProgress":
                return "bg-blue-100 text-blue-700";
            case "OnHold":
                return "bg-yellow-100 text-yellow-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    const getDeliveryColor = (delivery) => {
        switch (delivery) {
            case "Before":
                return "bg-green-100 text-green-700";
            case "On-Time":
                return "bg-blue-100 text-blue-700";
            case "Delayed":
                return "bg-red-100 text-red-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        Sprint Task Management
                    </h1>
                    <div className="flex space-x-4">
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="flex items-center space-x-2 px-6 py-3 bg-white text-gray-700 rounded-lg hover:shadow-lg transition-all border-2 border-gray-200"
                        >
                            <Filter className="w-5 h-5" />
                            <span>Filters</span>
                        </button>
                        {filteredTasks.length > 0 && (
                            <button
                                onClick={handleDownloadExcel}
                                className="flex items-center space-x-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:shadow-lg hover:bg-green-700 transition-all"
                            >
                                <Download className="w-5 h-5" />
                                <span>Download Excel</span>
                            </button>
                        )}
                        <button
                            onClick={() => {
                                resetForm();
                                setShowForm(true);
                            }}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Task</span>
                        </button>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                        <span>{error}</span>
                        <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                )}

                {/* Filters Panel */}
                {showFilters && (
                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Sprint Number
                                </label>
                                <select
                                    value={filters.sprintNumber}
                                    onChange={(e) => setFilters({ ...filters, sprintNumber: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                >
                                    <option value="">All Sprints</option>
                                    {sprints.map(sprint => (
                                        <option key={sprint.id} value={sprint.id}>
                                            {sprint.sprintNumber}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Month
                                </label>
                                <input
                                    type="month"
                                    value={filters.month}
                                    onChange={(e) => setFilters({ ...filters, month: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Owner
                                </label>
                                <select
                                    value={filters.owner}
                                    onChange={(e) => setFilters({ ...filters, owner: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                >
                                    <option value="">All Owners</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => setFilters({ sprintNumber: "", month: "", owner: "" })}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Clear Filters
                            </button>
                        </div>
                    </div>
                )}
                {/* Summary Cards */}
                {filteredTasks.length > 0 && (
                    <div className="py-2 grid grid-cols-1 md:grid-cols-4 gap-6 mt-8">
                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Total Tasks</p>
                                <Calendar className="w-5 h-5 text-purple-600" />
                            </div>
                            <p className="text-3xl font-bold text-gray-800">{filteredTasks.length}</p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">Completed</p>
                                <CheckCircle className="w-5 h-5 text-green-600" />
                            </div>
                            <p className="text-3xl font-bold text-green-600">
                                {filteredTasks.filter(t => t.currentStatus === "Completed").length}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">In Progress</p>
                                <Clock className="w-5 h-5 text-blue-600" />
                            </div>
                            <p className="text-3xl font-bold text-blue-600">
                                {filteredTasks.filter(t => t.currentStatus === "InProgress").length}
                            </p>
                        </div>

                        <div className="bg-white rounded-2xl shadow-lg p-6">
                            <div className="flex items-center justify-between mb-2">
                                <p className="text-sm text-gray-600">On Hold</p>
                                <PauseCircle className="w-5 h-5 text-yellow-600" />
                            </div>
                            <p className="text-3xl font-bold text-yellow-600">
                                {filteredTasks.filter(t => t.currentStatus === "OnHold").length}
                            </p>
                        </div>
                    </div>
                )}

                {/* Task Form Modal */}
                {showForm && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
                        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl my-8">
                            <div className="p-8 max-h-[90vh] overflow-y-auto">
                                <h2 className="text-3xl font-bold mb-6 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                                    {editingTask ? "Edit Task" : "Add New Task"}
                                </h2>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Sprint Selection */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Sprint Number <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={taskForm.sprintVelocityId}
                                            onChange={(e) => handleSprintChange(e.target.value)}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        >
                                            <option value="">Select Sprint</option>
                                            {sprints.map(sprint => (
                                                <option key={sprint.id} value={sprint.id}>
                                                    {sprint.sprintNumber}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Epic */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Epic <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={taskForm.epic}
                                            onChange={(e) => setTaskForm({ ...taskForm, epic: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter epic"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Story */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Story <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={taskForm.story}
                                            onChange={(e) => setTaskForm({ ...taskForm, story: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter story"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Task */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Task <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            value={taskForm.task}
                                            onChange={(e) => setTaskForm({ ...taskForm, task: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter task"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Story Point */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Story Point
                                        </label>
                                        <input
                                            type="number"
                                            value={taskForm.storyPoint}
                                            onChange={(e) => setTaskForm({ ...taskForm, storyPoint: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter story point"
                                            min="0"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Coordinator Story Point */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Coordinator Story Point
                                        </label>
                                        <input
                                            type="number"
                                            value={taskForm.coordinatorStoryPoint}
                                            onChange={(e) => setTaskForm({ ...taskForm, coordinatorStoryPoint: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter coordinator story point"
                                            min="0"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Owners - Multiple Select */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Owners <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            multiple
                                            value={taskForm.ownerIds.map(id => id.toString())}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                                setTaskForm({ ...taskForm, ownerIds: selected });
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            size="4"
                                            disabled={taskForm.isDisabled}
                                        >
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                                    </div>

                                    {/* Coordinators - Multiple Select */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Coordinators <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            multiple
                                            value={taskForm.coordinatorIds.map(id => id.toString())}
                                            onChange={(e) => {
                                                const selected = Array.from(e.target.selectedOptions, option => parseInt(option.value));
                                                setTaskForm({ ...taskForm, coordinatorIds: selected });
                                            }}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            size="4"
                                            disabled={taskForm.isDisabled}
                                        >
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                        <p className="text-xs text-gray-500 mt-1">Hold Ctrl/Cmd to select multiple</p>
                                    </div>

                                    {/* Reviewer */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Reviewer <span className="text-red-500">*</span>
                                        </label>
                                        <select
                                            value={taskForm.reviewerId}
                                            onChange={(e) => setTaskForm({ ...taskForm, reviewerId: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        >
                                            <option value="">Select Reviewer</option>
                                            {users.map(user => (
                                                <option key={user.id} value={user.id}>
                                                    {user.name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    {/* Assigned Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Assigned Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.assignedDate}
                                            onChange={(e) => setTaskForm({ ...taskForm, assignedDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Current Status */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Current Status
                                        </label>
                                        <select
                                            value={taskForm.currentStatus}
                                            onChange={(e) => setTaskForm({ ...taskForm, currentStatus: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        >
                                            <option value="InProgress">In Progress</option>
                                            <option value="Completed">Completed</option>
                                            <option value="OnHold">On Hold</option>
                                        </select>
                                    </div>

                                    {/* Start Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Start Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.startDate}
                                            onChange={(e) => setTaskForm({ ...taskForm, startDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* End Date */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            End Date <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            value={taskForm.endDate}
                                            onChange={(e) => setTaskForm({ ...taskForm, endDate: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Delivery */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Delivery
                                        </label>
                                        <select
                                            value={taskForm.delivery}
                                            onChange={(e) => setTaskForm({ ...taskForm, delivery: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        >
                                            <option value="Before">Before</option>
                                            <option value="On-Time">On-Time</option>
                                            <option value="Delayed">Delayed</option>
                                        </select>
                                    </div>

                                    {/* Test Evidence */}
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Test Evidence Attached
                                        </label>
                                        <select
                                            value={taskForm.testEvidenceAttached.toString()}
                                            onChange={(e) => setTaskForm({ ...taskForm, testEvidenceAttached: e.target.value })}
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            disabled={taskForm.isDisabled}
                                        >
                                            <option value="false">No</option>
                                            <option value="true">Yes</option>
                                        </select>
                                    </div>

                                    {/* Requirement Understanding */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Requirement Understanding
                                        </label>
                                        <textarea
                                            value={taskForm.requirementUnderstanding}
                                            onChange={(e) => setTaskForm({ ...taskForm, requirementUnderstanding: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter requirement understanding..."
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Dependencies */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Dependencies
                                        </label>
                                        <textarea
                                            value={taskForm.dependencies}
                                            onChange={(e) => setTaskForm({ ...taskForm, dependencies: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter dependencies..."
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Definition of Done */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Definition of Done (DOD)
                                        </label>
                                        <textarea
                                            value={taskForm.definitionOfDone}
                                            onChange={(e) => setTaskForm({ ...taskForm, definitionOfDone: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter definition of done..."
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>

                                    {/* Comments */}
                                    <div className="md:col-span-2">
                                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                                            Comments
                                        </label>
                                        <textarea
                                            value={taskForm.comments}
                                            onChange={(e) => setTaskForm({ ...taskForm, comments: e.target.value })}
                                            rows="3"
                                            className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                            placeholder="Enter comments..."
                                            disabled={taskForm.isDisabled}
                                        />
                                    </div>
                                </div>

                                {/* Form Actions */}
                                <div className="mt-8 flex space-x-4">
                                    <button
                                        onClick={handleSaveTask}
                                        disabled={loading || taskForm.isDisabled}
                                        className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg disabled:opacity-50 flex items-center justify-center space-x-2"
                                    >
                                        {loading ? (
                                            <Loader2 className="w-5 h-5 animate-spin" />
                                        ) : (
                                            <>
                                                <Plus className="w-5 h-5" />
                                                <span>{editingTask ? "Update" : "Save"} Task</span>
                                            </>
                                        )}
                                    </button>
                                    <button
                                        onClick={() => {
                                            setShowForm(false);
                                            resetForm();
                                        }}
                                        className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Tasks List */}
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {loading && !showForm ? (
                        <div className="flex items-center justify-center h-64">
                            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                        </div>
                    ) : filteredTasks.length === 0 ? (
                        <div className="p-12 text-center">
                            <p className="text-gray-500 text-lg mb-4">No tasks found</p>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setShowForm(true);
                                }}
                                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg"
                            >
                                Add Your First Task
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full relative">
                                <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                                    <tr>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Sprint</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Epic</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Story</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Task</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">SP</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Coord SP</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Owners</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Coordinators</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Reviewer</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Assigned Date</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Start Date</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">End Date</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Status</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Delivery</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Test Evidence</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Req. Understanding</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Dependencies</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">DOD</th>
                                        <th className="px-4 py-4 text-left font-semibold whitespace-nowrap">Comments</th>
                                        <th className="px-4 py-4 text-center font-semibold whitespace-nowrap sticky right-0 bg-gradient-to-r from-purple-600 to-cyan-600 shadow-lg">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredTasks.map((task, idx) => {
                                        const sprint = sprints.find(s => s.id === task.sprintVelocityId);
                                        const owners = task.ownerIds?.map(id => users.find(u => u.id === id)).filter(Boolean) || [];
                                        const coordinators = task.coordinatorIds?.map(id => users.find(u => u.id === id)).filter(Boolean) || [];
                                        const reviewer = users.find(u => u.id === task.reviewerId);

                                        return (
                                            <tr key={task.id} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                                <td className="px-4 py-4 text-gray-700 font-medium whitespace-nowrap">
                                                    {sprint?.sprintNumber || "-"}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.epic}>
                                                        {task.epic}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.story}>
                                                        {task.story}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.task}>
                                                        {task.task}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-purple-600 whitespace-nowrap">
                                                    {task.storyPoint}
                                                </td>
                                                <td className="px-4 py-4 text-center font-semibold text-cyan-600 whitespace-nowrap">
                                                    {task.coordinatorStoryPoint || '-'}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="flex flex-wrap gap-1">
                                                        {owners.length > 0 ? owners.map((owner, i) => (
                                                            <span key={i} className="inline-flex items-center space-x-1 bg-purple-100 text-purple-700 px-2 py-1 rounded-full text-xs">
                                                                <User className="w-3 h-3" />
                                                                <span>{owner.name}</span>
                                                            </span>
                                                        )) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="flex flex-wrap gap-1">
                                                        {coordinators.length > 0 ? coordinators.map((coordinator, i) => (
                                                            <span key={i} className="inline-flex items-center space-x-1 bg-cyan-100 text-cyan-700 px-2 py-1 rounded-full text-xs">
                                                                <User className="w-3 h-3" />
                                                                <span>{coordinator.name}</span>
                                                            </span>
                                                        )) : '-'}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-gray-400" />
                                                        <span>{reviewer?.name || "-"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                                                    {task.assignedDate ? new Date(task.assignedDate).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                                                    {task.startDate ? new Date(task.startDate).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-4 py-4 text-gray-700 whitespace-nowrap">
                                                    {task.endDate ? new Date(task.endDate).toLocaleDateString() : "-"}
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <div className="flex items-center space-x-2">
                                                        {getStatusIcon(task.currentStatus)}
                                                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(task.currentStatus)}`}>
                                                            {task.currentStatus}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDeliveryColor(task.delivery)}`}>
                                                        {task.delivery}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-center whitespace-nowrap">
                                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${task.testEvidenceAttached ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                        {task.testEvidenceAttached ? 'Yes' : 'No'}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.requirementUnderstanding}>
                                                        {task.requirementUnderstanding || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.dependencies}>
                                                        {task.dependencies || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.definitionOfDone}>
                                                        {task.definitionOfDone || "-"}
                                                    </div>
                                                </td>
                                                <td className="px-4 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate" title={task.comments}>
                                                        {task.comments || "-"}
                                                    </div>
                                                </td>
                                                <td className={`px-4 py-4 sticky right-0 shadow-lg ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"}`}>
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={() => handleEditTask(task)}
                                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteTask(task.id)}
                                                            disabled={loading}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                            title="Delete"
                                                        >
                                                            <Trash2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleEditTask(task, true)}
                                                            className="p-2 bg-green-400 text-white rounded-lg hover:bg-green-500 transition-colors"
                                                            title="Task Details"
                                                        >
                                                            <Info className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SprintTaskManagement;