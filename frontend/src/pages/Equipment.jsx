import React, { useState } from 'react';
import { useEquipment } from '../hooks/useEquipment';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Activity, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  AlertTriangle,
  Calendar
} from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';
import { formatRelativeTime, formatDate } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { DEPARTMENTS, EQUIPMENT_STATUSES } from '../utils/constants';

const Equipment = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { equipment, loading, error, stats, fetchEquipment, createEquipment, updateEquipment, updateEquipmentStatus, deleteEquipment, scheduleMaintenance, completeMaintenance } = useEquipment();

  // Handle status change
  const handleStatusChange = async (equipmentId, newStatus) => {
    const result = await updateEquipmentStatus(equipmentId, newStatus);
    if (result.success) {
      toast.success(`Equipment status updated to ${newStatus}`);
    }
  };

  // Handle delete
  const handleDelete = async (equipmentId) => {
    if (window.confirm('Are you sure you want to delete this equipment?')) {
      const result = await deleteEquipment(equipmentId);
      if (result.success) {
        toast.success('Equipment deleted successfully');
      }
    }
  };

  // Handle maintenance
  const handleScheduleMaintenance = async (equipmentId) => {
    const nextMaintenance = new Date();
    nextMaintenance.setDate(nextMaintenance.getDate() + 30);
    
    // Using the dedicated API endpoint
    await scheduleMaintenance(equipmentId, { 
      nextMaintenance: nextMaintenance.toISOString(),
      notes: "Scheduled routine maintenance" 
    });
  };

  const handleCompleteMaintenance = async (equipmentId) => {
    const nextMaintenance = new Date();
    nextMaintenance.setDate(nextMaintenance.getDate() + 90);
    
    // Using the dedicated API endpoint
    await completeMaintenance(equipmentId, { 
      nextMaintenance: nextMaintenance.toISOString(),
      notes: "Completed routine maintenance"
    });
  };

  // Handle create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const dbFormData = {
        ...formData,
        lastMaintenance: formData.lastMaintenance ? new Date(formData.lastMaintenance).toISOString() : null,
        nextMaintenance: formData.nextMaintenance ? new Date(formData.nextMaintenance).toISOString() : null,
      };

      if (showEditModal && selectedEquipment) {
        const result = await updateEquipment(selectedEquipment.id, dbFormData);
        if (result.success) {
          toast.success('Equipment updated successfully');
          setShowEditModal(false);
          setSelectedEquipment(null);
        }
      } else {
        const result = await createEquipment(dbFormData);
        if (result.success) {
          toast.success('Equipment created successfully');
          setShowCreateModal(false);
        }
      }
      // Reset form
      setFormData({
        name: '',
        type: '',
        model: '',
        serialNumber: '',
        department: 'GENERAL',
        location: '',
        status: 'AVAILABLE',
        lastMaintenance: '',
        nextMaintenance: '',
        notes: '',
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Open edit modal
  const openEditModal = (eq) => {
    setSelectedEquipment(eq);
    setFormData({
      name: eq.name,
      type: eq.type,
      model: eq.model || '',
      serialNumber: eq.serialNumber || '',
      department: eq.department,
      location: eq.location,
      status: eq.status,
      lastMaintenance: eq.lastMaintenance ? formatDate(eq.lastMaintenance, 'yyyy-MM-dd') : '',
      nextMaintenance: eq.nextMaintenance ? formatDate(eq.nextMaintenance, 'yyyy-MM-dd') : '',
      notes: eq.notes || '',
    });
    setShowEditModal(true);
  };

  // Filter equipment based on search and filters
  const filteredEquipment = equipment.filter(eq => {
    const matchesSearch = eq.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         eq.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (eq.serialNumber && eq.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !selectedDepartment || eq.department === selectedDepartment;
    const matchesStatus = !selectedStatus || eq.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Check if maintenance is due soon
  const isMaintenanceDueSoon = (nextMaintenance) => {
    if (!nextMaintenance) return false;
    const today = new Date();
    const dueDate = new Date(nextMaintenance);
    const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));
    return daysUntilDue <= 7 && daysUntilDue >= 0;
  };

  // Check if maintenance is overdue
  const isMaintenanceOverdue = (nextMaintenance) => {
    if (!nextMaintenance) return false;
    const today = new Date();
    const dueDate = new Date(nextMaintenance);
    return dueDate < today;
  };



  if (loading && equipment.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Equipment Management</h1>
        <p className="text-gray-600">Manage medical equipment and maintenance schedules</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Equipment</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Activity className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">In Use</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Calendar className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="card mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search equipment..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="input pl-10"
              />
            </div>
          </div>
          <select
            value={selectedDepartment}
            onChange={(e) => setSelectedDepartment(e.target.value)}
            className="input"
          >
            <option value="">All Departments</option>
            {DEPARTMENTS.map(dept => (
              <option key={dept} value={dept}>{dept}</option>
            ))}
          </select>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="input"
          >
            <option value="">All Statuses</option>
            {EQUIPMENT_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            disabled={user?.role === 'VIEWER'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Equipment
          </button>
        </div>
      </div>

      {/* Equipment Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Name
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Serial Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Location
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Next Maintenance
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEquipment.map((eq) => (
                <tr key={eq.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    <div>
                      <div>{eq.name}</div>
                      {eq.model && <div className="text-xs text-gray-500">{eq.model}</div>}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eq.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eq.serialNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eq.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {eq.location}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={eq.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {eq.nextMaintenance ? (
                      <div>
                        <div className={`font-medium ${
                          isMaintenanceOverdue(eq.nextMaintenance) 
                            ? 'text-red-600' 
                            : isMaintenanceDueSoon(eq.nextMaintenance) 
                              ? 'text-yellow-600' 
                              : 'text-gray-900'
                        }`}>
                          {formatDate(eq.nextMaintenance, 'MMM dd, yyyy')}
                        </div>
                        {isMaintenanceOverdue(eq.nextMaintenance) && (
                          <div className="text-xs text-red-500">Overdue</div>
                        )}
                        {isMaintenanceDueSoon(eq.nextMaintenance) && !isMaintenanceOverdue(eq.nextMaintenance) && (
                          <div className="text-xs text-yellow-500">Due soon</div>
                        )}
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Status Change Dropdown */}
                      <select
                        value={eq.status}
                        onChange={(e) => handleStatusChange(eq.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                        disabled={user?.role === 'VIEWER'}
                      >
                        {EQUIPMENT_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      
                      {/* Maintenance Actions */}
                      {eq.status === 'MAINTENANCE' ? (
                        <button
                          onClick={() => handleCompleteMaintenance(eq.id)}
                          className="text-green-600 hover:text-green-900"
                          title="Complete Maintenance"
                          disabled={user?.role === 'VIEWER'}
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleScheduleMaintenance(eq.id)}
                          className="text-yellow-600 hover:text-yellow-900"
                          title="Schedule Maintenance"
                          disabled={user?.role === 'VIEWER'}
                        >
                          <Calendar className="h-4 w-4" />
                        </button>
                      )}
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(eq)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={user?.role === 'VIEWER'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(eq.id)}
                        className="text-red-600 hover:text-red-900"
                        disabled={user?.role === 'VIEWER'}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create/Edit Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
            <h3 className="text-lg font-bold text-gray-900 mb-4">
              {showEditModal ? 'Edit Equipment' : 'Create New Equipment'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Model</label>
                  <input
                    type="text"
                    value={formData.model}
                    onChange={(e) => setFormData({...formData, model: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Serial Number</label>
                  <input
                    type="text"
                    value={formData.serialNumber}
                    onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Department</label>
                  <select
                    value={formData.department}
                    onChange={(e) => setFormData({...formData, department: e.target.value})}
                    className="input"
                    required
                  >
                    {DEPARTMENTS.map(dept => (
                      <option key={dept} value={dept}>{dept}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Location</label>
                  <input
                    type="text"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({...formData, status: e.target.value})}
                    className="input"
                    required
                  >
                    {EQUIPMENT_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Last Maintenance</label>
                  <input
                    type="date"
                    value={formData.lastMaintenance}
                    onChange={(e) => setFormData({...formData, lastMaintenance: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Next Maintenance</label>
                  <input
                    type="date"
                    value={formData.nextMaintenance}
                    onChange={(e) => setFormData({...formData, nextMaintenance: e.target.value})}
                    className="input"
                  />
                </div>
                <div>
                  <label className="label">Notes</label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="input"
                    rows="3"
                  />
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedEquipment(null);
                  }}
                  className="btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  {showEditModal ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Equipment;
