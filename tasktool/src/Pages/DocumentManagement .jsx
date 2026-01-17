import React, { useState, useEffect } from "react";
import {
  Loader2,
  Plus,
  Edit2,
  Trash2,
  FileText,
  ExternalLink,
  Filter,
  Search,
  ArrowUpDown,
  List
} from "lucide-react";
import { documentService } from "../api/apiService";

const DocumentType = {
  Project: "Project",
  Setup: "Setup",
  Testing: "Testing",
  Issues: "Issues"
};

const DocumentManagement = ({ currentUserId, currentUserName, allUserDetails }) => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentPage, setCurrentPage] = useState("list");
  const [editingDocument, setEditingDocument] = useState(null);
  const [filterType, setFilterType] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [sortBy, setSortBy] = useState("name"); // name, type, uploadedBy
  const [sortOrder, setSortOrder] = useState("asc"); // asc, desc
  const [users, setUsers] = useState([]);

  const [documentForm, setDocumentForm] = useState({
    name: "",
    type: DocumentType.Project,
    uploadedById: currentUserId || "",
    documentLink: ""
  });

  useEffect(() => {
    fetchDocuments();
    fetchUsers();
  }, []);

  useEffect(() => {
    if (currentUserId) {
      setDocumentForm(prev => ({ ...prev, uploadedById: currentUserId }));
    }
  }, [currentUserId]);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAll();
      setDocuments(data);
      setError("");
    } catch (err) {
      setError("Failed to fetch documents: " + (err.message || "Unknown error"));
      console.error("Error fetching documents:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const usersData = await documentService.getUsers();
      setUsers(usersData);
    } catch (err) {
      console.error("Error fetching users:", err);
    }
  };

  const handleSaveDocument = async () => {
    if (!documentForm.name || !documentForm.documentLink) {
      setError("Document name and link are required");
      return;
    }

    if (!documentForm.uploadedById) {
      setError("Please select a user");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const documentData = {
        name: documentForm.name,
        type: documentForm.type,
        uploadedById: parseInt(documentForm.uploadedById),
        documentLink: documentForm.documentLink
      };

      if (editingDocument) {
        await documentService.update(editingDocument.id, documentData);
      } else {
        await documentService.create(documentData);
      }

      await fetchDocuments();
      resetForm();
      setCurrentPage("list");
    } catch (err) {
      setError(err.message || "Failed to save document");
      console.error("Error saving document:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleEditDocument = (document) => {
    setEditingDocument(document);
    setDocumentForm({
      name: document.name,
      type: document.type,
      uploadedById: document.uploadedById.toString(),
      documentLink: document.documentLink
    });
    setCurrentPage("form");
  };

  const handleDeleteDocument = async (id) => {
    if (!window.confirm("Are you sure you want to delete this document?")) return;

    try {
      setLoading(true);
      await documentService.delete(id);
      await fetchDocuments();
      setError("");
    } catch (err) {
      setError("Failed to delete document: " + err.message);
      console.error("Error deleting document:", err);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setEditingDocument(null);
    setDocumentForm({
      name: "",
      type: DocumentType.Project,
      uploadedById: currentUserId || "",
      documentLink: ""
    });
  };

  const getTypeColor = (type) => {
    const colors = {
      [DocumentType.Project]: "bg-blue-100 text-blue-700",
      [DocumentType.Setup]: "bg-green-100 text-green-700",
      [DocumentType.Testing]: "bg-yellow-100 text-yellow-700",
      [DocumentType.Issues]: "bg-red-100 text-red-700"
    };
    return colors[type] || "bg-gray-100 text-gray-700";
  };

  const getUserNameById = (userId) => {
    const user = users.find(u => u.value === userId);
    return user ? user.label : "Unknown User";
  };

  const handleSort = (field) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("asc");
    }
  };

  const filteredAndSortedDocuments = () => {
    let filtered = documents.filter((doc) => {
      const matchesType = filterType === "all" || doc.type === filterType;
      const matchesSearch = 
        doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (doc.uploadedByName || getUserNameById(doc.uploadedById)).toLowerCase().includes(searchTerm.toLowerCase());
      return matchesType && matchesSearch;
    });

    // Sort documents
    filtered.sort((a, b) => {
      let compareA, compareB;

      switch (sortBy) {
        case "name":
          compareA = a.name.toLowerCase();
          compareB = b.name.toLowerCase();
          break;
        case "type":
          compareA = a.type.toLowerCase();
          compareB = b.type.toLowerCase();
          break;
        case "uploadedBy":
          compareA = (a.uploadedByName || getUserNameById(a.uploadedById)).toLowerCase();
          compareB = (b.uploadedByName || getUserNameById(b.uploadedById)).toLowerCase();
          break;
        default:
          return 0;
      }

      if (compareA < compareB) return sortOrder === "asc" ? -1 : 1;
      if (compareA > compareB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    return filtered;
  };

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <ArrowUpDown className="w-4 h-4 opacity-50" />;
    return sortOrder === "asc" ? 
      <ArrowUpDown className="w-4 h-4 rotate-180" /> : 
      <ArrowUpDown className="w-4 h-4" />;
  };

  if (currentPage === "form") {
    return (
      <div className="animate-fadeIn">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          {editingDocument ? "Edit Document" : "Add New Document"}
        </h1>

        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">✕</button>
          </div>
        )}

        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={documentForm.name}
                onChange={(e) => setDocumentForm({ ...documentForm, name: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                placeholder="Enter document name"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Type <span className="text-red-500">*</span>
              </label>
              <select
                value={documentForm.type}
                onChange={(e) => setDocumentForm({ ...documentForm, type: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              >
                <option value={DocumentType.Project}>Project</option>
                <option value={DocumentType.Setup}>Setup</option>
                <option value={DocumentType.Testing}>Testing</option>
                <option value={DocumentType.Issues}>Issues</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Uploaded By <span className="text-red-500">*</span>
              </label>
              <select
                value={documentForm.uploadedById}
                onChange={(e) => setDocumentForm({ ...documentForm, uploadedById: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
              >
                <option value="">Select User</option>
                {users.map((user) => (
                  <option key={user.id} value={user.id}>
                    {user.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Document Link <span className="text-red-500">*</span>
              </label>
              <input
                type="url"
                value={documentForm.documentLink}
                onChange={(e) => setDocumentForm({ ...documentForm, documentLink: e.target.value })}
                className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none transition-all duration-300"
                placeholder="https://example.com/document"
              />
            </div>
          </div>

          <div className="mt-8 flex space-x-4">
            <button
              onClick={handleSaveDocument}
              disabled={loading}
              className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Plus className="w-5 h-5" />
                  <span>{editingDocument ? "Update" : "Save"} Document</span>
                </>
              )}
            </button>
            <button
              onClick={() => {
                resetForm();
                setCurrentPage("list");
              }}
              className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="animate-fadeIn">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
          Document Management
        </h1>
        <button
          onClick={() => {
            resetForm();
            setCurrentPage("form");
          }}
          className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
        >
          <Plus className="w-5 h-5" />
          <span>Add Document</span>
        </button>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-red-700 hover:text-red-900">✕</button>
        </div>
      )}

      {/* Search and Filter Bar */}
      <div className="mb-6 bg-white rounded-xl shadow-md p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by document name or uploader..."
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-lg outline-none transition-all"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-600" />
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="flex-1 px-4 py-2 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-lg outline-none transition-all"
            >
              <option value="all">All Types</option>
              <option value={DocumentType.Project}>Project</option>
              <option value={DocumentType.Setup}>Setup</option>
              <option value={DocumentType.Testing}>Testing</option>
              <option value={DocumentType.Issues}>Issues</option>
            </select>
          </div>
        </div>

        {/* Active Filters Display */}
        {(searchTerm || filterType !== "all") && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-sm text-gray-600">Active filters:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                Search: "{searchTerm}"
                <button onClick={() => setSearchTerm("")} className="hover:text-purple-900">✕</button>
              </span>
            )}
            {filterType !== "all" && (
              <span className="inline-flex items-center gap-1 px-3 py-1 bg-cyan-100 text-cyan-700 rounded-full text-sm">
                Type: {filterType}
                <button onClick={() => setFilterType("all")} className="hover:text-cyan-900">✕</button>
              </span>
            )}
          </div>
        )}
      </div>

      <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
          </div>
        ) : filteredAndSortedDocuments().length === 0 ? (
          <div className="p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg mb-4">
              {searchTerm || filterType !== "all" ? "No documents match your filters" : "No documents found"}
            </p>
            <button
              onClick={() => {
                resetForm();
                setCurrentPage("form");
              }}
              className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
            >
              Add Your First Document
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                <tr>
                  <th 
                    className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Document Name</span>
                      <SortIcon field="name" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSort("type")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Type</span>
                      <SortIcon field="type" />
                    </div>
                  </th>
                  <th 
                    className="px-6 py-4 text-left font-semibold cursor-pointer hover:bg-white/10 transition-colors"
                    onClick={() => handleSort("uploadedBy")}
                  >
                    <div className="flex items-center space-x-2">
                      <span>Uploaded By</span>
                      <SortIcon field="uploadedBy" />
                    </div>
                  </th>
                  <th className="px-6 py-4 text-center font-semibold">Link</th>
                  <th className="px-6 py-4 text-center font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedDocuments().map((doc, idx) => (
                  <tr
                    key={doc.id}
                    className={`border-b hover:bg-gray-50 transition-colors ${
                      idx % 2 === 0 ? "bg-white" : "bg-gray-50"
                    }`}
                  >
                    <td className="px-6 py-4 font-medium text-gray-800">
                      <div className="flex items-center space-x-2">
                        <FileText className="w-5 h-5 text-purple-600" />
                        <span>{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getTypeColor(doc.type)}`}>
                        {doc.type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-700">
                      {doc.uploadedByName || getUserNameById(doc.uploadedById)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <a
                        href={doc.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center space-x-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Link</span>
                      </a>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => handleEditDocument(doc)}
                          className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteDocument(doc.id)}
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

      {/* Results Counter */}
      {!loading && filteredAndSortedDocuments().length > 0 && (
        <div className="mt-4 text-center text-sm text-gray-600">
          Showing {filteredAndSortedDocuments().length} of {documents.length} documents
        </div>
      )}
    </div>
  );
};

export default DocumentManagement;