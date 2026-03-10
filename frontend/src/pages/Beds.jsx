import React, { useState, useEffect } from 'react';
import { useBeds } from '../hooks/useBeds';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Bed, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  Home,
  AlertTriangle
} from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';
import { formatRelativeTime } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { DEPARTMENTS, BED_STATUSES } from '../utils/constants';

const Beds = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { beds, loading, error, stats, fetchBeds, createBed, updateBed, updateBedStatus, deleteBed } = useBeds();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [selectedBed, setSelectedBed] = useState(null);
  const [formData, setFormData] = useState({
    bedNumber: '',
    department: 'GENERAL',
    floor: 1,
    room: '',
    status: 'AVAILABLE',
    patientName: '',
    patientId: '',
  });

  // Filter beds based on search and filters
  const filteredBeds = beds.filter(bed => {
    const matchesSearch = bed.bedNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (bed.patientName && bed.patientName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !selectedDepartment || bed.department === selectedDepartment;
    const matchesStatus = !selectedStatus || bed.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  // Handle status change
  const handleStatusChange = async (bedId, newStatus) => {
    const result = await updateBedStatus(bedId, newStatus);
    if (result.success) {
      toast.success(`Bed status updated to ${newStatus}`);
    }
  };

  // Handle delete
  const handleDelete = async (bedId) => {
    if (window.confirm('Are you sure you want to delete this bed?')) {
      const result = await deleteBed(bedId);
      if (result.success) {
        toast.success('Bed deleted successfully');
      }
    }
  };

  // Handle create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal && selectedBed) {
        const result = await updateBed(selectedBed.id, formData);
        if (result.success) {
          toast.success('Bed updated successfully');
          setShowEditModal(false);
          setSelectedBed(null);
        }
      } else {
        const result = await createBed(formData);
        if (result.success) {
          toast.success('Bed created successfully');
          setShowCreateModal(false);
        }
      }
      // Reset form
      setFormData({
        bedNumber: '',
        department: 'GENERAL',
        floor: 1,
        room: '',
        status: 'AVAILABLE',
        patientName: '',
        patientId: '',
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };

  // Open edit modal
  const openEditModal = (bed) => {
    setSelectedBed(bed);
    setFormData({
      bedNumber: bed.bedNumber,
      department: bed.department,
      floor: bed.floor,
      room: bed.room || '',
      status: bed.status,
      patientName: bed.patientName || '',
      patientId: bed.patientId || '',
    });
    setShowEditModal(true);
  };

  if (loading && beds.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Bed Management</h1>
        <p className="text-gray-600">Manage hospital beds and their status</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Bed className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Beds</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 rounded-lg">
              <Users className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Available</p>
              <p className="text-2xl font-bold text-green-600">{stats.available || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <AlertTriangle className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupied || 0}</p>
            </div>
          </div>
        </div>
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Home className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Maintenance</p>
              <p className="text-2xl font-bold text-yellow-600">{stats.maintenance || 0}</p>
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
                placeholder="Search beds..."
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
            {BED_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            disabled={user?.role === 'VIEWER'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Bed
          </button>
        </div>
      </div>

      {/* Beds Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Bed Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Patient
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Last Updated
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredBeds.map((bed) => (
                <tr key={bed.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {bed.bedNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bed.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bed.floor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bed.room || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={bed.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {bed.patientName ? (
                      <div>
                        <div className="font-medium">{bed.patientName}</div>
                        <div className="text-xs text-gray-400">{bed.patientId}</div>
                      </div>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatRelativeTime(bed.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Status Change Dropdown */}
                      <select
                        value={bed.status}
                        onChange={(e) => handleStatusChange(bed.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                        disabled={user?.role === 'VIEWER'}
                      >
                        {BED_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(bed)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={user?.role === 'VIEWER'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(bed.id)}
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
              {showEditModal ? 'Edit Bed' : 'Create New Bed'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">Bed Number</label>
                  <input
                    type="text"
                    value={formData.bedNumber}
                    onChange={(e) => setFormData({...formData, bedNumber: e.target.value})}
                    className="input"
                    required
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
                  <label className="label">Floor</label>
                  <input
                    type="number"
                    value={formData.floor}
                    onChange={(e) => setFormData({...formData, floor: parseInt(e.target.value)})}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Room</label>
                  <input
                    type="text"
                    value={formData.room}
                    onChange={(e) => setFormData({...formData, room: e.target.value})}
                    className="input"
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
                    {BED_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
                </div>
                {formData.status === 'OCCUPIED' && (
                  <>
                    <div>
                      <label className="label">Patient Name</label>
                      <input
                        type="text"
                        value={formData.patientName}
                        onChange={(e) => setFormData({...formData, patientName: e.target.value})}
                        className="input"
                      />
                    </div>
                    <div>
                      <label className="label">Patient ID</label>
                      <input
                        type="text"
                        value={formData.patientId}
                        onChange={(e) => setFormData({...formData, patientId: e.target.value})}
                        className="input"
                      />
                    </div>
                  </>
                )}
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                    setSelectedBed(null);
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

export default Beds;
