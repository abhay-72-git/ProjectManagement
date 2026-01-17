import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Loader2, X, Lock, Save } from 'lucide-react';
import { leavePlanService } from "../api/apiService";

const LeaveManagement = ({ userEmail, allUserDetails: initialUserDetails, refreshUserDetails, onUserDetailsUpdate, userService, refreshCurrentUserDetails }) => {
    const [allUserDetails, setAllUserDetails] = useState(initialUserDetails);
    const [leaveRecords, setLeaveRecords] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [showApplyModal, setShowApplyModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingLeave, setEditingLeave] = useState(null);
    const [selectedUser, setSelectedUser] = useState('');

    // Leave balances from user details
    const [leaveBalances, setLeaveBalances] = useState({
        pl: 0,
        ul: 0,
        fl: 0
    });

    const [applyForm, setApplyForm] = useState({
        email: userEmail,
        dateFrom: '',
        dateTo: '',
        breakdowns: [{ type: 'PL', days: 0 }]
    });

    const [editForm, setEditForm] = useState({
        email: '',
        dateFrom: '',
        dateTo: '',
        breakdowns: []
    });

    useEffect(() => {
        setAllUserDetails(initialUserDetails);
    }, [initialUserDetails]);

    useEffect(() => {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        setSelectedMonth(`${year}-${month}`);
    }, []);

    useEffect(() => {
        if (selectedMonth) {
            fetchLeaveRecords();
            fetchUserDetailsFromDB(); // Also fetch user details when month changes
        }
    }, [selectedMonth]);

    useEffect(() => {
        fetchUserLeaveBalances();
    }, [userEmail, allUserDetails]); // Added allUserDetails as dependency

    const fetchUserLeaveBalances = () => {
        const currentUser = allUserDetails.find(u => u.email === userEmail);
        if (currentUser) {
            setLeaveBalances({
                pl: currentUser.pl || 0,
                ul: currentUser.ul || 0,
                fl: currentUser.fl || 0
            });
        }
    };

    const fetchUserDetailsFromDB = async () => {
        try {
            // Call the refresh function if provided
            if (refreshUserDetails) {
                await refreshUserDetails();
            }
            // Refresh current user details for dashboard
            if (refreshCurrentUserDetails) {
                await refreshCurrentUserDetails();
            }
            // If userService is provided, fetch directly
            if (userService && userService.getAllUsers) {
                const users = await userService.getAllUsers();
                setAllUserDetails(users);
            }
        } catch (err) {
            console.error('Error fetching user details:', err);
        }
    };

    const fetchLeaveRecords = async () => {
        if (!selectedMonth) return;

        try {
            setLoading(true);

            const [year, month] = selectedMonth.split('-');

            const data = await leavePlanService.getByMonthYear(
                parseInt(month),
                parseInt(year)
            );

            setLeaveRecords(data);
            setError('');
        } catch (err) {
            console.error('Error fetching leave records:', err);
            setError('Failed to fetch leave records');
        } finally {
            setLoading(false);
        }
    };

    const calculateBusinessDays = (startDate, endDate) => {
        const start = new Date(startDate);
        const end = new Date(endDate);
        let count = 0;

        const current = new Date(start);
        while (current <= end) {
            const dayOfWeek = current.getDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            current.setDate(current.getDate() + 1);
        }

        return count;
    };

    const handleApplyLeave = async () => {
        if (!applyForm.dateFrom || !applyForm.dateTo) {
            setError('Please select both from and to dates');
            return;
        }

        const totalDays = applyForm.breakdowns.reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        if (totalDays === 0) {
            setError('Total leave days must be greater than 0');
            return;
        }

        // Validate business days match total leave days
        const businessDays = calculateBusinessDays(applyForm.dateFrom, applyForm.dateTo);
        if (totalDays !== businessDays) {
            setError(`Total leave days (${totalDays}) must equal business days (${businessDays})`);
            return;
        }

        // Validate leave balance for the selected user
        const selectedUserDetails = allUserDetails.find(u => u.email === applyForm.email);
        if (!selectedUserDetails) {
            setError('User details not found');
            return;
        }

          // Fetch ALL leaves for this user across all months to calculate total used
        let userAllLeaves = [];
        try {
            const allLeavesData = await leavePlanService.getByMonthYear(0, 0); // Assuming 0,0 fetches all
            userAllLeaves = allLeavesData.filter(leave => leave.email === applyForm.email);
        } catch (err) {
            console.error('Error fetching all leaves:', err);
            // Fallback to current month data if API doesn't support fetching all
            userAllLeaves = leaveRecords.filter(leave => leave.email === applyForm.email);
        }
        const currentUsed = {
            PL: userAllLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'PL').reduce((s, b) => s + b.days, 0), 0),
            UL: userAllLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'UL').reduce((s, b) => s + b.days, 0), 0),
            FL: userAllLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'FL').reduce((s, b) => s + b.days, 0), 0)
        };

        const plDays = applyForm.breakdowns.filter(b => b.type === 'PL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        const ulDays = applyForm.breakdowns.filter(b => b.type === 'UL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        const flDays = applyForm.breakdowns.filter(b => b.type === 'FL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);

        const availablePL = (selectedUserDetails.pl || 0) - currentUsed.PL;
        const availableUL = (selectedUserDetails.ul || 0) - currentUsed.UL;
        const availableFL = (selectedUserDetails.fl || 0) - currentUsed.FL;

        if (plDays > availablePL) {
            setError(`Insufficient PL balance. Available: ${availablePL}, Requested: ${plDays}. You don't have enough leaves.`);
            return;
        }
        if (ulDays > availableUL) {
            setError(`Insufficient UL balance. Available: ${availableUL}, Requested: ${ulDays}. You don't have enough leaves.`);
            return;
        }
        if (flDays > availableFL) {
            setError(`Insufficient FL balance. Available: ${availableFL}, Requested: ${flDays}. You don't have enough leaves.`);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                email: applyForm.email,
                dateFrom: new Date(applyForm.dateFrom).toISOString(),
                dateTo: new Date(applyForm.dateTo).toISOString(),
                breakdowns: applyForm.breakdowns.map(b => ({
                    type: b.type,
                    days: parseFloat(b.days) || 0
                }))
            };

            await leavePlanService.apply(payload);

            setShowApplyModal(false);
            resetApplyForm();
            
            // Fetch updated user details from database first
            await fetchUserDetailsFromDB();
            // Then fetch leave records
            await fetchLeaveRecords();
            
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to apply leave');
            console.error('Error applying leave:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateLeave = async () => {
        if (!editingLeave) return;

        // Validate business days match total leave days
        const totalDays = editForm.breakdowns.reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        const businessDays = calculateBusinessDays(editForm.dateFrom, editForm.dateTo);
        if (totalDays !== businessDays) {
            setError(`Total leave days (${totalDays}) must equal business days (${businessDays})`);
            return;
        }

        // Validate leave balance (considering the current leave being edited)
        const selectedUserDetails = allUserDetails.find(u => u.email === editForm.email);
        if (!selectedUserDetails) {
            setError('User details not found');
            return;
        }

        // Calculate current used leaves excluding the one being edited
        const otherLeaves = leaveRecords.filter(leave => leave.id !== editingLeave.id && leave.email === editForm.email);
        const currentUsed = {
            PL: otherLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'PL').reduce((s, b) => s + b.days, 0), 0),
            UL: otherLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'UL').reduce((s, b) => s + b.days, 0), 0),
            FL: otherLeaves.reduce((sum, leave) => sum + leave.breakdown.filter(b => b.type === 'FL').reduce((s, b) => s + b.days, 0), 0)
        };

        const plDays = editForm.breakdowns.filter(b => b.type === 'PL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        const ulDays = editForm.breakdowns.filter(b => b.type === 'UL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);
        const flDays = editForm.breakdowns.filter(b => b.type === 'FL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0);

        const availablePL = (selectedUserDetails.pl || 0) - currentUsed.PL;
        const availableUL = (selectedUserDetails.ul || 0) - currentUsed.UL;
        const availableFL = (selectedUserDetails.fl || 0) - currentUsed.FL;

        if (plDays > availablePL) {
            setError(`Insufficient PL balance. Available: ${availablePL}, Requested: ${plDays}. You don't have enough leaves.`);
            return;
        }
        if (ulDays > availableUL) {
            setError(`Insufficient UL balance. Available: ${availableUL}, Requested: ${ulDays}. You don't have enough leaves.`);
            return;
        }
        if (flDays > availableFL) {
            setError(`Insufficient FL balance. Available: ${availableFL}, Requested: ${flDays}. You don't have enough leaves.`);
            return;
        }

        try {
            setLoading(true);

            const payload = {
                email: editForm.email,
                dateFrom: new Date(editForm.dateFrom).toISOString(),
                dateTo: new Date(editForm.dateTo).toISOString(),
                breakdowns: editForm.breakdowns.map(b => ({
                    type: b.type,
                    days: parseFloat(b.days) || 0
                }))
            };

            await leavePlanService.update(editingLeave.id, payload);

            setShowEditModal(false);
            setEditingLeave(null);
            
            // Fetch updated user details from database first
            await fetchUserDetailsFromDB();
            // Then fetch leave records
            await fetchLeaveRecords();
            
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to update leave');
            console.error('Error updating leave:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleDeleteLeave = async (id) => {
        if (!window.confirm('Are you sure you want to delete this leave record?')) return;

        try {
            setLoading(true);
            await leavePlanService.delete(id);

            // Fetch updated user details from database first
            await fetchUserDetailsFromDB();
            // Then fetch leave records
            await fetchLeaveRecords();
            
            setError('');
        } catch (err) {
            setError(err.message || 'Failed to delete leave');
            console.error('Error deleting leave:', err);
        } finally {
            setLoading(false);
        }
    };

    const openEditModal = (leave) => {
        setEditingLeave(leave);
        setEditForm({
            email: leave.email,
            dateFrom: leave.dateFrom.split('T')[0],
            dateTo: leave.dateTo.split('T')[0],
            breakdowns: leave.breakdown.map(b => ({
                type: b.type,
                days: b.days
            }))
        });
        setShowEditModal(true);
    };

    const resetApplyForm = () => {
        setApplyForm({
            email: selectedUser || userEmail,
            dateFrom: '',
            dateTo: '',
            breakdowns: [{ type: 'PL', days: 0 }]
        });
    };

    const addBreakdown = (isEdit = false) => {
        const form = isEdit ? editForm : applyForm;
        const setForm = isEdit ? setEditForm : setApplyForm;

        setForm({
            ...form,
            breakdowns: [...form.breakdowns, { type: 'PL', days: 0 }]
        });
    };

    const removeBreakdown = (index, isEdit = false) => {
        const form = isEdit ? editForm : applyForm;
        const setForm = isEdit ? setEditForm : setApplyForm;

        setForm({
            ...form,
            breakdowns: form.breakdowns.filter((_, i) => i !== index)
        });
    };

    const updateBreakdown = (index, field, value, isEdit = false) => {
        const form = isEdit ? editForm : applyForm;
        const setForm = isEdit ? setEditForm : setApplyForm;

        const newBreakdowns = [...form.breakdowns];
        newBreakdowns[index] = { ...newBreakdowns[index], [field]: value };
        setForm({ ...form, breakdowns: newBreakdowns });
    };

    const handleDateChange = (field, value, isEdit = false) => {
        const form = isEdit ? editForm : applyForm;
        const setForm = isEdit ? setEditForm : setApplyForm;

        setForm({ ...form, [field]: value });

        if (form.dateFrom && form.dateTo) {
            const businessDays = calculateBusinessDays(
                field === 'dateFrom' ? value : form.dateFrom,
                field === 'dateTo' ? value : form.dateTo
            );

            if (form.breakdowns.length === 1) {
                const newBreakdowns = [...form.breakdowns];
                newBreakdowns[0] = { ...newBreakdowns[0], days: businessDays };
                setForm({ ...form, [field]: value, breakdowns: newBreakdowns });
            }
        }
    };

    const getLeavesByUser = () => {
        const userLeaves = {};

        leaveRecords.forEach(leave => {
            if (!userLeaves[leave.email]) {
                userLeaves[leave.email] = [];
            }
            userLeaves[leave.email].push(leave);
        });

        return userLeaves;
    };

    const calculateTotals = (leaves) => {
        const totals = { PL: 0, UL: 0, FL: 0, total: 0 };

        leaves.forEach(leave => {
            leave.breakdown.forEach(b => {
                totals[b.type] = (totals[b.type] || 0) + b.days;
                totals.total += b.days;
            });
        });

        return totals;
    };

    const getUserDetails = (email) => {
        return allUserDetails.find(u => u.email === email);
    };

    const formatDateRange = (dateFrom, dateTo) => {
        const from = new Date(dateFrom);
        const to = new Date(dateTo);
        const days = Math.ceil((to - from) / (1000 * 60 * 60 * 24)) + 1;

        return `${from.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} to ${to.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })} (${days} days)`;
    };

    const userLeaves = getLeavesByUser();

    return (
        <div className="animate-fadeIn">
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Leave Records Management
            </h1>

            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                    <span>{error}</span>
                    <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                <div className="flex flex-wrap items-center gap-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                            <Calendar className="w-4 h-4" />
                            Select Year & Month
                        </label>
                        <input
                            type="month"
                            value={selectedMonth}
                            onChange={(e) => setSelectedMonth(e.target.value)}
                            className="px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                        />
                    </div>

                    <button
                        onClick={() => {
                            resetApplyForm();
                            setShowApplyModal(true);
                        }}
                        className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:shadow-lg transition-all mt-6"
                    >
                        <Plus className="w-5 h-5" />
                        <span>Apply Leave</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex items-center justify-center h-64">
                    <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
            ) : (
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    {Object.keys(userLeaves).length === 0 ? (
                        <div className="p-12 text-center">
                            <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                            <p className="text-gray-500 text-lg mb-4">No leave records found for this month</p>
                        </div>
                    ) : (
                        <div className="p-6">
                            {Object.entries(userLeaves).map(([email, leaves]) => {
                                const userDetails = getUserDetails(email);
                                const totals = calculateTotals(leaves);
                                // Leaves in hand should come directly from database
                                const leavesInHand = {
                                    PL: userDetails?.pl || 0,
                                    UL: userDetails?.ul || 0,
                                    FL: userDetails?.fl || 0
                                };

                                return (
                                    <div key={email} className="mb-8 border-b pb-6 last:border-b-0">
                                        <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6 mb-4">
                                            <div className="flex justify-between items-start">
                                                <div className="py-2">
                                                    <h3 className="text-xl font-bold text-gray-800 mb-1">
                                                        {userDetails?.name || 'Unknown User'}
                                                    </h3>
                                                    <p className="text-gray-600 text-sm">{email}</p>
                                                    <div className="mt-3 flex items-center gap-4">
                                                    </div>
                                                </div>
                                                <div className="py-3 bg-white rounded-lg px-4 py-2 shadow-sm">
                                                    <p className="text-xs text-gray-600 mb-1">Total Days</p>
                                                    <p className="py-2 text-2xl font-bold text-pink-600">{totals.total}</p>
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Leave Breakdown</p>
                                                    <div className="flex gap-3">
                                                        <div className="bg-blue-100 rounded-lg px-3 py-2 text-center">
                                                            <p className="text-xs text-blue-700">PL</p>
                                                            <p className="text-lg font-bold text-blue-700">{totals.PL}</p>
                                                        </div>
                                                        <div className="bg-purple-100 rounded-lg px-3 py-2 text-center">
                                                            <p className="text-xs text-purple-700">UL</p>
                                                            <p className="text-lg font-bold text-purple-700">{totals.UL}</p>
                                                        </div>
                                                        <div className="bg-green-100 rounded-lg px-3 py-2 text-center">
                                                            <p className="text-xs text-green-700">FL</p>
                                                            <p className="text-lg font-bold text-green-700">{totals.FL}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="space-y-3">
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Date Range</p>
                                                    {leaves.map((leave) => (
                                                        <div key={leave.id} className="flex items-center justify-between bg-gray-50 rounded-lg p-4 hover:bg-gray-100 transition-colors">
                                                            <div className="flex-1">
                                                                <p className="text-gray-800 font-medium">
                                                                    {formatDateRange(leave.dateFrom, leave.dateTo)}
                                                                </p>
                                                            </div>

                                                            <div className="px-5 flex gap-2">
                                                                <button
                                                                    onClick={() => openEditModal(leave)}
                                                                    className="p-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors"
                                                                    title="Edit"
                                                                >
                                                                    <Edit2 className="w-4 h-4" />
                                                                </button>
                                                                <button
                                                                    onClick={() => handleDeleteLeave(leave.id)}
                                                                    disabled={loading}
                                                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
                                                                    title="Delete"
                                                                >
                                                                    <Trash2 className="w-4 h-4" />
                                                                </button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>

                                                <div>
                                                    <p className="text-sm font-semibold text-gray-700 mb-2">Leaves In Hand</p>
                                                    <div className="flex gap-3">
                                                        <div className={`rounded-lg px-3 py-2 text-center border ${leavesInHand.PL < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                                            <p className={`text-xs ${leavesInHand.PL < 0 ? 'text-red-700' : 'text-blue-700'}`}>PL</p>
                                                            <p className={`text-lg font-bold ${leavesInHand.PL < 0 ? 'text-red-700' : 'text-blue-700'}`}>{leavesInHand.PL}</p>
                                                        </div>
                                                        <div className={`rounded-lg px-3 py-2 text-center border ${leavesInHand.UL < 0 ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                                                            <p className={`text-xs ${leavesInHand.UL < 0 ? 'text-red-700' : 'text-purple-700'}`}>UL</p>
                                                            <p className={`text-lg font-bold ${leavesInHand.UL < 0 ? 'text-red-700' : 'text-purple-700'}`}>{leavesInHand.UL}</p>
                                                        </div>
                                                        <div className={`rounded-lg px-3 py-2 text-center border ${leavesInHand.FL < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                                            <p className={`text-xs ${leavesInHand.FL < 0 ? 'text-red-700' : 'text-green-700'}`}>FL</p>
                                                            <p className={`text-lg font-bold ${leavesInHand.FL < 0 ? 'text-red-700' : 'text-green-700'}`}>{leavesInHand.FL}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}

            {/* Apply Leave Modal */}
            {showApplyModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Apply Leave</h2>
                            <button onClick={() => setShowApplyModal(false)} className="hover:bg-white/20 rounded-full p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select User
                                </label>
                                <select
                                    value={applyForm.email}
                                    onChange={(e) => setApplyForm({ ...applyForm, email: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                >
                                    {allUserDetails.map((user) => (
                                        <option key={user.email} value={user.email}>
                                            {user.name} ({user.email})
                                        </option>
                                    ))}
                                </select>
                            </div>
                            {/* Display Leaves in Hand for selected user */}
                            {(() => {
                                const selectedUserDetails = allUserDetails.find(u => u.email === applyForm.email);
                                if (selectedUserDetails) {
                                    return (
                                        <div className="mb-6 bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-4">
                                            <p className="text-sm font-semibold text-gray-700 mb-3">Available Leave Balance</p>
                                            <div className="flex gap-3">
                                                <div className={`rounded-lg px-4 py-3 text-center border flex-1 ${selectedUserDetails.pl < 0 ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
                                                    <p className={`text-xs mb-1 ${selectedUserDetails.pl < 0 ? 'text-red-700' : 'text-blue-700'}`}>Planned Leave</p>
                                                    <p className={`text-2xl font-bold ${selectedUserDetails.pl < 0 ? 'text-red-700' : 'text-blue-700'}`}>{selectedUserDetails.pl || 0}</p>
                                                </div>
                                                <div className={`rounded-lg px-4 py-3 text-center border flex-1 ${selectedUserDetails.ul < 0 ? 'bg-red-50 border-red-200' : 'bg-purple-50 border-purple-200'}`}>
                                                    <p className={`text-xs mb-1 ${selectedUserDetails.ul < 0 ? 'text-red-700' : 'text-purple-700'}`}>Unplanned Leave</p>
                                                    <p className={`text-2xl font-bold ${selectedUserDetails.ul < 0 ? 'text-red-700' : 'text-purple-700'}`}>{selectedUserDetails.ul || 0}</p>
                                                </div>
                                                <div className={`rounded-lg px-4 py-3 text-center border flex-1 ${selectedUserDetails.fl < 0 ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}>
                                                    <p className={`text-xs mb-1 ${selectedUserDetails.fl < 0 ? 'text-red-700' : 'text-green-700'}`}>Floating Leave</p>
                                                    <p className={`text-2xl font-bold ${selectedUserDetails.fl < 0 ? 'text-red-700' : 'text-green-700'}`}>{selectedUserDetails.fl || 0}</p>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                }
                                return null;
                            })()}

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        From Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={applyForm.dateFrom}
                                        onChange={(e) => handleDateChange('dateFrom', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        To Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={applyForm.dateTo}
                                        onChange={(e) => handleDateChange('dateTo', e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                    />
                                </div>
                            </div>

                            {applyForm.dateFrom && applyForm.dateTo && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-semibold">Business Days (Excluding Weekends):</span>{' '}
                                        {calculateBusinessDays(applyForm.dateFrom, applyForm.dateTo)} days
                                    </p>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Leave Applications
                                    </label>
                                    <button
                                        onClick={() => addBreakdown(false)}
                                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Leave
                                    </button>
                                </div>

                                {applyForm.breakdowns.map((breakdown, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 mb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800">Leave Entry #{index + 1}</h4>
                                            {applyForm.breakdowns.length > 1 && (
                                                <button
                                                    onClick={() => removeBreakdown(index, false)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Leave Type
                                                </label>
                                                <select
                                                    value={breakdown.type}
                                                    onChange={(e) => updateBreakdown(index, 'type', e.target.value, false)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                                >
                                                    <option value="PL">Planned Leave (PL)</option>
                                                    <option value="UL">Unplanned Leave (UL)</option>
                                                    <option value="FL">Floating Leave (FL)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Days
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={breakdown.days}
                                                    onChange={(e) => updateBreakdown(index, 'days', e.target.value, false)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-4 mt-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total FL</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {applyForm.breakdowns.filter(b => b.type === 'FL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total PL</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {applyForm.breakdowns.filter(b => b.type === 'PL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total UL</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {applyForm.breakdowns.filter(b => b.type === 'UL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowApplyModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleApplyLeave}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Plus className="w-5 h-5" /> Apply Leave</>}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Leave Modal */}
            {showEditModal && editingLeave && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-cyan-600 text-white p-6 flex justify-between items-center">
                            <h2 className="text-2xl font-bold">Edit Leave Records</h2>
                            <button onClick={() => setShowEditModal(false)} className="hover:bg-white/20 rounded-full p-2">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Select User
                                </label>
                                <div className="w-full px-4 py-3 bg-gray-100 rounded-xl text-gray-700 flex items-center gap-2">
                                    <Lock className="w-4 h-4" />
                                    <span>{getUserDetails(editForm.email)?.name || editForm.email}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4 mb-6">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        From Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dateFrom}
                                        onChange={(e) => handleDateChange('dateFrom', e.target.value, true)}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        To Date <span className="text-red-500">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dateTo}
                                        onChange={(e) => handleDateChange('dateTo', e.target.value, true)}
                                        className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                    />
                                </div>
                            </div>

                            {editForm.dateFrom && editForm.dateTo && (
                                <div className="mb-6 p-4 bg-blue-50 rounded-xl border border-blue-200">
                                    <p className="text-sm text-blue-700">
                                        <span className="font-semibold">Business Days (Excluding Weekends):</span>{' '}
                                        {calculateBusinessDays(editForm.dateFrom, editForm.dateTo)} days
                                    </p>
                                </div>
                            )}

                            <div className="mb-6">
                                <div className="flex justify-between items-center mb-4">
                                    <label className="block text-sm font-semibold text-gray-700">
                                        Leave Applications
                                    </label>
                                    <button
                                        onClick={() => addBreakdown(true)}
                                        className="flex items-center gap-2 px-3 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 text-sm"
                                    >
                                        <Plus className="w-4 h-4" />
                                        Add Leave
                                    </button>
                                </div>

                                {editForm.breakdowns.map((breakdown, index) => (
                                    <div key={index} className="bg-gray-50 rounded-xl p-4 mb-3">
                                        <div className="flex items-center justify-between mb-3">
                                            <h4 className="font-semibold text-gray-800">Leave Entry #{index + 1}</h4>
                                            {editForm.breakdowns.length > 1 && (
                                                <button
                                                    onClick={() => removeBreakdown(index, true)}
                                                    className="text-red-500 hover:text-red-700"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Leave Type
                                                </label>
                                                <select
                                                    value={breakdown.type}
                                                    onChange={(e) => updateBreakdown(index, 'type', e.target.value, true)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                                >
                                                    <option value="PL">Planned Leave (PL)</option>
                                                    <option value="UL">Unplanned Leave (UL)</option>
                                                    <option value="FL">Floating Leave (FL)</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                                    Days
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={breakdown.days}
                                                    onChange={(e) => updateBreakdown(index, 'days', e.target.value, true)}
                                                    className="w-full px-4 py-3 bg-white border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                ))}

                                <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-4 mt-4">
                                    <div className="grid grid-cols-3 gap-4 text-center">
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total FL</p>
                                            <p className="text-2xl font-bold text-green-600">
                                                {editForm.breakdowns.filter(b => b.type === 'FL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total PL</p>
                                            <p className="text-2xl font-bold text-blue-600">
                                                {editForm.breakdowns.filter(b => b.type === 'PL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600 mb-1">Total UL</p>
                                            <p className="text-2xl font-bold text-purple-600">
                                                {editForm.breakdowns.filter(b => b.type === 'UL').reduce((sum, b) => sum + parseFloat(b.days || 0), 0)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowEditModal(false)}
                                    className="flex-1 px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleUpdateLeave}
                                    disabled={loading}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <><Save className="w-5 h-5" /> Update Leave</>}
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
};

export default LeaveManagement;