import React, { useState, useEffect } from 'react';
import { Calendar, Plus, Edit2, Trash2, Loader2, Save, X, Eye, Search } from 'lucide-react';
import { sprintFeedbackService } from "../api/apiService";

const SprintFeedbackManagement = () => {
  const [feedbacks, setFeedbacks] = useState([]);
  const [filteredFeedbacks, setFilteredFeedbacks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [currentView, setCurrentView] = useState('list');
  const [searchQuery, setSearchQuery] = useState('');
  const [editingFeedback, setEditingFeedback] = useState(null);
  const [viewingFeedback, setViewingFeedback] = useState(null);
  
  const [formData, setFormData] = useState({
    momMonth: '',
    momInput: ''
  });

  const sanitizeHtml = (html) => {
    if (!html) return '';

    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = html;

    const msElements = tempDiv.querySelectorAll('[class*="Mso"], [style*="mso-"]');
    msElements.forEach(el => {
      el.removeAttribute('class');
      el.removeAttribute('style');
    });

    const tables = tempDiv.querySelectorAll('table');
    if (tables.length === 0) return '';

    const table = tables[0];

    table.querySelectorAll('*').forEach(el => {
      [...el.attributes].forEach(attr => {
        if (!['colspan', 'rowspan'].includes(attr.name)) {
          el.removeAttribute(attr.name);
        }
      });
    });

    table.setAttribute('border', '1');
    table.setAttribute('style', 'width:100%; border-collapse: collapse;');

    table.querySelectorAll('td, th').forEach(cell => {
      cell.setAttribute('style', 'padding: 8px; border: 1px solid #ddd;');
    });

    table.querySelectorAll('th').forEach(cell => {
      cell.setAttribute(
        'style',
        'padding: 8px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;'
      );
    });

    table.innerHTML = table.innerHTML
      .replace(/<o:p>\s*<\/o:p>/gi, '')
      .replace(/<o:p>.*?<\/o:p>/gi, '')
      .replace(/<!--\[if.*?\]-->/gis, '')
      .replace(/<!--\[endif\]-->/gis, '');

    return table.outerHTML;
  };

  useEffect(() => {
    fetchFeedbacks();
  }, []);

  useEffect(() => {
    handleSearch();
  }, [searchQuery, feedbacks]);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const data = await sprintFeedbackService.getAll();
      setFeedbacks(data);
      setError('');
    } catch (err) {
      setError('Failed to fetch feedbacks: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    if (!searchQuery.trim()) {
      setFilteredFeedbacks(feedbacks);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = feedbacks.filter(feedback => {
      const monthName = getMonthName(feedback.momMonth).toLowerCase();
      const createdDate = new Date(feedback.createdAt).toLocaleString().toLowerCase();
      const htmlContent = feedback.momInput.toLowerCase();
      
      return monthName.includes(query) || 
             createdDate.includes(query) || 
             htmlContent.includes(query);
    });

    setFilteredFeedbacks(filtered);
  };

  const handleSave = async () => {
    if (!formData.momMonth) {
      setError('Please select a feedback month');
      return;
    }

    if (!formData.momInput.trim()) {
      setError('Please paste your table HTML');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const cleanedHtml = sanitizeHtml(formData.momInput);
      
      if (!cleanedHtml) {
        setError('No valid table found in pasted content');
        setLoading(false);
        return;
      }

      const [year, month] = formData.momMonth.split('-').map(Number);
      const feedbackDate = new Date(year, month - 1, 1);

      const feedbackData = {
        momInput: cleanedHtml,
        momMonth: feedbackDate.toISOString()
      };

      if (editingFeedback) {
        await sprintFeedbackService.update(editingFeedback.id, feedbackData);
        setSuccess('Feedback updated successfully!');
      } else {
        await sprintFeedbackService.create(feedbackData);
        setSuccess('Feedback created successfully!');
      }

      await fetchFeedbacks();
      resetForm();
      setTimeout(() => {
        setCurrentView('list');
        setSuccess('');
      }, 2000);
    } catch (err) {
      setError('Failed to save feedback: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (feedback) => {
    setEditingFeedback(feedback);
    const monthStr = new Date(feedback.momMonth).toISOString().substring(0, 7);
    
    setFormData({
      momMonth: monthStr,
      momInput: feedback.momInput
    });
    setCurrentView('edit');
  };

  const handleView = (feedback) => {
    setViewingFeedback(feedback);
    setCurrentView('view');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this feedback?')) return;

    try {
      setLoading(true);
      await sprintFeedbackService.delete(id);
      await fetchFeedbacks();
      setSuccess('Feedback deleted successfully!');
      setTimeout(() => setSuccess(''), 3000);
      setError('');
    } catch (err) {
      setError('Failed to delete feedback: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      momMonth: '',
      momInput: ''
    });
    setEditingFeedback(null);
    setViewingFeedback(null);
  };

  const handleCancel = () => {
    resetForm();
    setCurrentView('list');
    setError('');
    setSuccess('');
  };

  const getMonthName = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-cyan-50 p-8">
      <div className="max-w-7xl mx-auto">
        {error && (
          <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg flex justify-between items-center">
            <span>{error}</span>
            <button onClick={() => setError('')} className="text-red-700 hover:text-red-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {success && (
          <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg flex justify-between items-center">
            <span>{success}</span>
            <button onClick={() => setSuccess('')} className="text-green-700 hover:text-green-900">
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {currentView === 'list' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                Sprint MOM Management
              </h1>
              <button
                onClick={() => setCurrentView('create')}
                className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
              >
                <Plus className="w-5 h-5" />
                <span>Add MOM</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Search MOM
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by month, date, or content..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
              {searchQuery && (
                <p className="text-sm text-gray-600 mt-2">
                  Found {filteredFeedbacks.length} result(s)
                </p>
              )}
            </div>

            <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <Loader2 className="w-12 h-12 animate-spin text-purple-600" />
                </div>
              ) : filteredFeedbacks.length === 0 ? (
                <div className="p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg mb-4">
                    {searchQuery ? 'No feedback records match your search' : 'No feedback records found'}
                  </p>
                  {!searchQuery && (
                    <button
                      onClick={() => setCurrentView('create')}
                      className="px-6 py-2 bg-gradient-to-r from-purple-600 to-cyan-600 text-white rounded-lg hover:shadow-lg transition-all"
                    >
                      Create First MOM
                    </button>
                  )}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gradient-to-r from-purple-600 to-cyan-600 text-white">
                      <tr>
                        <th className="px-6 py-4 text-left font-semibold">Month</th>
                        {/* <th className="px-6 py-4 text-left font-semibold">Created At</th> */}
                        <th className="px-6 py-4 text-center font-semibold">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFeedbacks.map((feedback, idx) => (
                        <tr key={feedback.id} className={`border-b hover:bg-gray-50 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}`}>
                          <td className="px-6 py-4 font-medium text-gray-800">
                            {getMonthName(feedback.momMonth)}
                          </td>
                          {/* <td className="px-6 py-4 text-gray-700">
                            {new Date(feedback.createdAt).toLocaleString()}
                          </td> */}
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-center space-x-2">
                              <button
                                onClick={() => handleView(feedback)}
                                className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                                title="View"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                              {/* <button
                                onClick={() => handleEdit(feedback)}
                                className="p-2 bg-yellow-400 text-white rounded-lg hover:bg-yellow-500 transition-colors"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button> */}
                              <button
                                onClick={() => handleDelete(feedback.id)}
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
          </div>
        )}

        {(currentView === 'create' || currentView === 'edit') && (
          <div>
            <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
              {currentView === 'edit' ? 'Edit Feedback' : 'Create New Feedback'}
            </h1>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  MOM Month <span className="text-red-500">*</span>
                </label>
                <input
                  type="month"
                  value={formData.momMonth}
                  onChange={(e) => setFormData({ ...formData, momMonth: e.target.value })}
                  className="w-full px-4 py-3 bg-gray-50 border-2 border-transparent focus:border-purple-500 rounded-xl outline-none"
                />
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-sm font-semibold text-gray-700">
                    Paste Your Table <span className="text-red-500">*</span>
                  </label>
                </div>
                <p className="text-sm text-gray-600 mb-3">
                  Copy your table from Excel, Word, Google Sheets, or any source and paste it directly here (Ctrl+V). 
                  Microsoft Office formatting will be automatically cleaned.
                </p>
                <div
                  contentEditable
                  onPaste={(e) => {
                    e.preventDefault();
                    const html = e.clipboardData.getData('text/html');
                    const text = e.clipboardData.getData('text/plain');
                    
                    if (html) {
                      const cleaned = sanitizeHtml(html);
                      setFormData({ ...formData, momInput: cleaned });
                    } else if (text) {
                      const rows = text.trim().split('\n');
                      let tableHtml = '<table border="1" style="width:100%; border-collapse: collapse;">\n';
                      
                      rows.forEach((row, idx) => {
                        const cells = row.split('\t');
                        tableHtml += '  <tr>\n';
                        cells.forEach(cell => {
                          const tag = idx === 0 ? 'th' : 'td';
                          const style = idx === 0 
                            ? 'padding: 8px; border: 1px solid #ddd; background-color: #f3f4f6; font-weight: bold;'
                            : 'padding: 8px; border: 1px solid #ddd;';
                          tableHtml += `    <${tag} style="${style}">${cell.trim()}</${tag}>\n`;
                        });
                        tableHtml += '  </tr>\n';
                      });
                      
                      tableHtml += '</table>';
                      setFormData({ ...formData, momInput: tableHtml });
                    }
                  }}
                  onInput={(e) => {
                    const html = e.currentTarget.innerHTML;
                    setFormData({ ...formData, momInput: html });
                  }}
                  dangerouslySetInnerHTML={{ __html: formData.momInput }}
                  className="w-full min-h-[300px] px-4 py-3 bg-gray-50 border-2 border-dashed border-gray-300 focus:border-purple-500 rounded-xl outline-none overflow-auto"
                  style={{ maxHeight: '500px' }}
                />
                <p className="text-xs text-gray-500 mt-2">
                  💡 Tip: Select and copy your table from Excel/Word, then click here and press Ctrl+V to paste
                </p>
              </div>

              {formData.momInput.trim() && (
                <div className="mb-6">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Preview (Cleaned & Ready to Save)
                  </label>
                  <div className="border-2 border-gray-200 rounded-xl p-4 bg-gray-50 overflow-x-auto">
                    <div dangerouslySetInnerHTML={{ __html: formData.momInput }} />
                  </div>
                </div>
              )}

              <div className="flex space-x-4">
                <button
                  onClick={handleSave}
                  disabled={loading}
                  className="flex-1 py-3 bg-gradient-to-r from-purple-600 to-cyan-600 text-white font-semibold rounded-xl hover:shadow-lg transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  {loading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      <span>{currentView === 'edit' ? 'Update' : 'Save'} MOM</span>
                    </>
                  )}
                </button>
                <button
                  onClick={handleCancel}
                  className="px-8 py-3 bg-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>

            <div className="mt-6 bg-blue-50 border border-blue-200 rounded-2xl p-6">
              <h3 className="font-semibold text-blue-800 mb-3">💡 How to Use:</h3>
              <ul className="list-disc list-inside space-y-2 text-sm text-blue-700">
                <li><strong>From Excel/Word:</strong> Select your table → Copy (Ctrl+C) → Click in the input area → Paste (Ctrl+V)</li>
                <li><strong>From Google Sheets:</strong> Select cells → Copy → Paste directly in the input area</li>
                <li>Microsoft Office formatting is automatically cleaned and standardized</li>
                <li>You can edit the table directly in the input area after pasting</li>
                <li>Preview shows exactly how it will be saved and displayed</li>
              </ul>
            </div>
          </div>
        )}

        {currentView === 'view' && viewingFeedback && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-cyan-600 bg-clip-text text-transparent">
                View MOM - {getMonthName(viewingFeedback.momMonth)}
              </h1>
              <button
                onClick={() => setCurrentView('list')}
                className="flex items-center space-x-2 px-6 py-3 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
              >
                <X className="w-5 h-5" />
                <span>Close</span>
              </button>
            </div>

            <div className="bg-white rounded-2xl shadow-lg p-8">
              <div className="mb-6">
                <p className="text-sm text-gray-600">
                  Created: {new Date(viewingFeedback.createdAt).toLocaleString()}
                </p>
              </div>

              <div className="border-2 border-gray-200 rounded-xl p-4 overflow-x-auto">
                <div dangerouslySetInnerHTML={{ __html: viewingFeedback.momInput }} />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SprintFeedbackManagement;