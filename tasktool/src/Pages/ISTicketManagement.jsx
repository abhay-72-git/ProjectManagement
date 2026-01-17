import React, { useState, useEffect } from "react";
import {
    Ticket,
    Plus,
    Edit2,
    Trash2,
    Loader2,
    AlertCircle,
    CheckCircle,
    Clock,
    User,
    MessageSquare,
    Filter,
    X
} from "lucide-react";

import { isTicketService } from "../api/apiService";


const ISTicketManagement = ({ currentUserId, currentUserName, allUserDetails = [] }) => {
    const [tickets, setTickets] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [currentView, setCurrentView] = useState("list"); // list, form, detail
    const [editingTicket, setEditingTicket] = useState(null);
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [searchQuery, setSearchQuery] = useState("");
    const [users, setUsers] = useState([]);


    const [ticketForm, setTicketForm] = useState({
        raisedById: currentUserId?.toString() || 0,
        ticketNo:"",
        purpose: "",
        ticketCategory: "",
        ticketProblem: "",
        requiredDetails: "",
        comments: ""
    });

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const data = await isTicketService.getUsers();
            setUsers(data);
        } catch (err) {
            console.error("Error fetching users", err);
        }
    };
    useEffect(() => {
        fetchTickets();
    }, []);

    const fetchTickets = async () => {
        try {
            setLoading(true);
            const data = await isTicketService.getAll();
            setTickets(data);
            setError("");
        } catch (err) {
            setError("Failed to fetch tickets: " + (err.message || "Unknown error"));
            console.error("Error fetching tickets:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleSaveTicket = async () => {
        if (!ticketForm.raisedById || !ticketForm.ticketNo || !ticketForm.purpose || !ticketForm.ticketCategory || !ticketForm.ticketProblem) {
            setError("Please fill in all required fields");
            return;
        }


        try {
            setLoading(true);
            setError("");

            const raisedById = Number(ticketForm.raisedById);

            if (!ticketForm.raisedById) {
                setError("Please select a valid user");
                return;
            }

            const ticketData = {
                raisedById,
                ticketNo: ticketForm.ticketNo,
                purpose: ticketForm.purpose,
                ticketCategory: ticketForm.ticketCategory,
                ticketProblem: ticketForm.ticketProblem,
                requiredDetails: ticketForm.requiredDetails || "",
                comments: ticketForm.comments || ""
            };
            console.log("Ticket payload =>", ticketData);

            if (editingTicket) {
                await isTicketService.update(editingTicket.ticketId, ticketData);
            } else {
                await isTicketService.create(ticketData);
            }

            await fetchTickets();
            resetForm();
            setCurrentView("list");
        } catch (err) {
            setError(err.message || "Failed to save ticket");
            console.error("Error saving ticket:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleEditTicket = (ticket) => {
        setEditingTicket(ticket);
        setTicketForm({
            raisedById: ticket.raisedById,
            ticketNo:ticket.ticketNo,
            purpose: ticket.purpose,
            ticketCategory: ticket.ticketCategory,
            ticketProblem: ticket.ticketProblem,
            requiredDetails: ticket.requiredDetails || "",
            comments: ticket.comments || ""
        });
        setCurrentView("form");
    };

    const handleDeleteTicket = async (ticketId) => {
        if (!window.confirm("Are you sure you want to delete this ticket?")) return;

        try {
            setLoading(true);
            await isTicketService.delete(ticketId);
            await fetchTickets();
            setError("");
        } catch (err) {
            setError("Failed to delete ticket: " + err.message);
            console.error("Error deleting ticket:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setCurrentView("detail");
    };

    const resetForm = () => {
        setEditingTicket(null);
        setTicketForm({
            raisedById: currentUserId || 0,
            ticketNo: "",
            purpose: "",
            ticketCategory: "",
            ticketProblem: "",
            requiredDetails: "",
            comments: ""
        });
    };

    const filteredTickets = tickets.filter(ticket => {
        if (!searchQuery) return true;

        const query = searchQuery.toLowerCase();
        return (
            ticket.ticketNo?.toString().toLowerCase().includes(query) ||
            ticket.purpose?.toLowerCase().includes(query) ||
            ticket.ticketCategory?.toLowerCase().includes(query) ||
            ticket.ticketProblem?.toLowerCase().includes(query) ||
            ticket.raisedByName?.toLowerCase().includes(query) ||
            ticket.ticketId?.toString().includes(query)
        );
    });

    const getCategoryColor = (category) => {
        const colors = {
            "Hardware Issue": "bg-red-100 text-red-700",
            "Software Issue": "bg-blue-100 text-blue-700",
            "Network Issue": "bg-orange-100 text-orange-700",
            "Access Request": "bg-green-100 text-green-700",
            "Account Issue": "bg-purple-100 text-purple-700",
            "VPN Issue": "bg-yellow-100 text-yellow-700",
            "Email Issue": "bg-pink-100 text-pink-700",
            "Other": "bg-gray-100 text-gray-700"
        };
        return colors[category] || "bg-gray-100 text-gray-700";
    };

    return (
        <div className="animate-fadeIn">
            {error && (
                <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
                    <div className="flex items-center space-x-2">
                        <AlertCircle className="w-5 h-5" />
                        <span>{error}</span>
                    </div>
                    <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">
                        <X className="w-5 h-5" />
                    </button>
                </div>
            )}

            {currentView === "list" && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            IS Ticket Management
                        </h1>
                        <button
                            onClick={() => {
                                resetForm();
                                setCurrentView("form");
                            }}
                            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                        >
                            <Plus className="w-5 h-5" />
                            <span>Add Ticket Details</span>
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
                        <div className="flex items-center space-x-4">
                            <Filter className="w-5 h-5 text-gray-600" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Search by ticket ID, purpose, category, problem, or raised by..."
                                className="flex-1 px-4 py-2 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-lg outline-none transition-all"
                            />
                            {searchQuery && (
                                <button
                                    onClick={() => setSearchQuery("")}
                                    className="p-2 text-gray-500 hover:text-gray-700"
                                    title="Clear search"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            )}
                            <span className="text-sm text-gray-600">
                                Showing {filteredTickets.length} of {tickets.length} tickets
                            </span>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                        {loading ? (
                            <div className="flex items-center justify-center h-64">
                                <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                            </div>
                        ) : filteredTickets.length === 0 ? (
                            <div className="p-12 text-center">
                                <Ticket className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg mb-4">No tickets found</p>
                                <button
                                    onClick={() => {
                                        resetForm();
                                        setCurrentView("form");
                                    }}
                                    className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                                >
                                    Add Your First Ticket Details
                                </button>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                                        <tr>
                                            <th className="px-6 py-4 text-left font-semibold">Ticket No</th>
                                            <th className="px-6 py-4 text-left font-semibold">Purpose</th>
                                            <th className="px-6 py-4 text-left font-semibold">Category</th>
                                            <th className="px-6 py-4 text-left font-semibold">Raised By</th>
                                            <th className="px-6 py-4 text-left font-semibold">Problem</th>
                                            <th className="px-6 py-4 text-center font-semibold">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredTickets.map((ticket, idx) => (
                                            <tr
                                                key={ticket.ticketId}
                                                className={`border-b hover:bg-gray-50 transition-colors cursor-pointer ${idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                                                    }`}
                                                onClick={() => handleViewTicket(ticket)}
                                            >
                                                {/* <td className="px-6 py-4 font-medium text-gray-800">
                                                    #{ticket.ticketId}
                                                </td> */}
                                                <td className="px-6 py-4 font-medium text-gray-800">
                                                    #{ticket.ticketNo}
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate">{ticket.purpose}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getCategoryColor(ticket.ticketCategory)}`}>
                                                        {ticket.ticketCategory}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="flex items-center space-x-2">
                                                        <User className="w-4 h-4 text-gray-500" />
                                                        <span>{ticket.raisedByName || "Unknown"}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-gray-700">
                                                    <div className="max-w-xs truncate">{ticket.ticketProblem}</div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center space-x-2">
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleEditTicket(ticket);
                                                            }}
                                                            className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Edit2 className="w-4 h-4" />
                                                        </button>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handleDeleteTicket(ticket.ticketId);
                                                            }}
                                                            disabled={loading}
                                                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors disabled:opacity-50"
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
                </>
            )}

            {currentView === "form" && (
                <>
                    <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                        {editingTicket ? "Edit Ticket" : "Raise New Ticket"}
                    </h1>
                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ticket No <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="Number"
                                    value={ticketForm.ticketNo}
                                    onChange={(e) => setTicketForm({ ...ticketForm, ticketNo: Number(e.target.value) })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Enter ticket Number (e.g., 28451)"
                                />
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Purpose <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ticketForm.purpose}
                                    onChange={(e) => setTicketForm({ ...ticketForm, purpose: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Brief description of the issue"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ticket Category <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={ticketForm.ticketCategory}
                                    onChange={(e) => setTicketForm({ ...ticketForm, ticketCategory: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Enter ticket category (e.g., Hardware Issue, Software Issue)"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Raised By <span className="text-red-500">*</span>
                                </label>

                                <select
                                    value={Number(ticketForm.raisedById)}
                                    onChange={(e) =>
                                        setTicketForm({ ...ticketForm, raisedById: Number(e.target.value) })
                                    }
                                >
                                    <option value={users.find(e=>e.id === ticketForm.raisedById)?.name}>Select user</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                            {user.name}
                                        </option>
                                    ))}
                                </select>



                            </div>


                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Ticket Problem <span className="text-red-500">*</span>
                                </label>
                                <textarea
                                    value={ticketForm.ticketProblem}
                                    onChange={(e) => setTicketForm({ ...ticketForm, ticketProblem: e.target.value })}
                                    rows="4"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Describe the problem in detail..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Required Details
                                </label>
                                <textarea
                                    value={ticketForm.requiredDetails}
                                    onChange={(e) => setTicketForm({ ...ticketForm, requiredDetails: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Any specific details or requirements..."
                                />
                            </div>

                            <div className="md:col-span-2">
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Comments
                                </label>
                                <textarea
                                    value={ticketForm.comments}
                                    onChange={(e) => setTicketForm({ ...ticketForm, comments: e.target.value })}
                                    rows="3"
                                    className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                                    placeholder="Additional comments..."
                                />
                            </div>
                        </div>

                        <div className="mt-8 flex space-x-4">
                            <button
                                onClick={handleSaveTicket}
                                disabled={loading}
                                className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? (
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                ) : (
                                    <>
                                        <CheckCircle className="w-5 h-5" />
                                        <span>{editingTicket ? "Update" : "Submit"} Ticket</span>
                                    </>
                                )}
                            </button>
                            <button
                                onClick={() => {
                                    resetForm();
                                    setCurrentView("list");
                                }}
                                className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </>
            )}

            {currentView === "detail" && selectedTicket && (
                <>
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                            Ticket Details
                        </h1>
                        <button
                            onClick={() => setCurrentView("list")}
                            className="px-6 py-3 bg-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-400 transition-all"
                        >
                            Back to List
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl shadow-lg p-8">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <div className="flex items-center space-x-3 mb-4">
                                    <Ticket className="w-8 h-8 text-purple-600" />
                                    <h2 className="text-3xl font-bold text-gray-800">
                                        Ticket #{selectedTicket.ticketId}
                                    </h2>
                                </div>
                                <span className={`px-4 py-2 rounded-full text-sm font-medium ${getCategoryColor(selectedTicket.ticketCategory)}`}>
                                    {selectedTicket.ticketCategory}
                                </span>
                            </div>
                            <div className="flex space-x-2">
                                <button
                                    onClick={() => handleEditTicket(selectedTicket)}
                                    className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                >
                                    <Edit2 className="w-5 h-5" />
                                </button>
                                <button
                                    onClick={() => {
                                        handleDeleteTicket(selectedTicket.ticketId);
                                        setCurrentView("list");
                                    }}
                                    className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                                >
                                    <Trash2 className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-gradient-to-r from-purple-50 to-cyan-50 rounded-xl p-6">
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-5 h-5 text-purple-600" />
                                    <h3 className="font-semibold text-gray-800">Raised By</h3>
                                </div>
                                <p className="text-gray-700">{selectedTicket.raisedByName || "Unknown User"}</p>
                            </div>
                             <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Ticket No</h3>
                                <p className="text-gray-700">{selectedTicket.ticketNo}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Purpose</h3>
                                <p className="text-gray-700">{selectedTicket.purpose}</p>
                            </div>

                            <div>
                                <h3 className="font-semibold text-gray-800 mb-2">Problem Description</h3>
                                <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.ticketProblem}</p>
                            </div>

                            {selectedTicket.requiredDetails && (
                                <div>
                                    <h3 className="font-semibold text-gray-800 mb-2">Required Details</h3>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.requiredDetails}</p>
                                </div>
                            )}

                            {selectedTicket.comments && (
                                <div className="bg-yellow-50 rounded-xl p-6">
                                    <div className="flex items-center space-x-2 mb-2">
                                        <MessageSquare className="w-5 h-5 text-yellow-600" />
                                        <h3 className="font-semibold text-gray-800">Comments</h3>
                                    </div>
                                    <p className="text-gray-700 whitespace-pre-wrap">{selectedTicket.comments}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </>
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

export default ISTicketManagement;