import React, { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Users,
  AlertTriangle
} from 'lucide-react';
import { getStatusColor } from '../utils/statusColors';
import { formatRelativeTime } from '../utils/formatDate';
import StatusBadge from '../components/common/StatusBadge';
import toast from 'react-hot-toast';
import { DEPARTMENTS, ROOM_STATUSES } from '../utils/constants';

const Rooms = () => {
  const { user } = useAuth();
  const { isConnected } = useSocket();
  const { rooms, loading, error, stats, fetchRooms, createRoom, updateRoom, updateRoomStatus, deleteRoom } = useRooms();

  // Handle status change
  const handleStatusChange = async (roomId, newStatus) => {
    const result = await updateRoomStatus(roomId, newStatus);
    if (result.success) {
      toast.success(`Room status updated to ${newStatus}`);
    }
  };

  // Handle delete
  const handleDelete = async (roomId) => {
    if (window.confirm('Are you sure you want to delete this room?')) {
      const result = await deleteRoom(roomId);
      if (result.success) {
        toast.success('Room deleted successfully');
      }
    }
  };

  // Handle create/update
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (showEditModal && selectedRoom) {
        const result = await updateRoom(selectedRoom.id, formData);
        if (result.success) {
          toast.success('Room updated successfully');
          setShowEditModal(false);
          setSelectedRoom(null);
        }
      } else {
        const result = await createRoom(formData);
        if (result.success) {
          toast.success('Room created successfully');
          setShowCreateModal(false);
        }
      }
      // Reset form
      setFormData({
        roomNumber: '',
        department: 'GENERAL',
        type: 'General Ward',
        floor: 1,
        capacity: 4,
        currentOccupancy: 0,
        status: 'AVAILABLE',
        notes: '',
      });
    } catch (error) {
      console.error('Submit error:', error);
    }
  };
  const openEditModal = (room) => {
    setSelectedRoom(room);
    setFormData({
      roomNumber: room.roomNumber,
      department: room.department,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      currentOccupancy: room.currentOccupancy,
      status: room.status,
      notes: room.notes || '',
    });
    setShowEditModal(true);
  };

  // Filter rooms based on search and filters
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.roomNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         room.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = !selectedDepartment || room.department === selectedDepartment;
    const matchesStatus = !selectedStatus || room.status === selectedStatus;
    return matchesSearch && matchesDepartment && matchesStatus;
  });



  if (loading && rooms.length === 0) {
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
        <h1 className="text-2xl font-bold text-gray-900">Room Management</h1>
        <p className="text-gray-600">Manage hospital rooms and their occupancy</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="card">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Home className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Rooms</p>
              <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
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
              <p className="text-sm font-medium text-gray-600">Occupied</p>
              <p className="text-2xl font-bold text-red-600">{stats.occupied}</p>
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
                placeholder="Search rooms..."
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
            {ROOM_STATUSES.map(status => (
              <option key={status} value={status}>{status}</option>
            ))}
          </select>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
            disabled={user?.role === 'VIEWER'}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Room
          </button>
        </div>
      </div>

      {/* Rooms Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Room Number
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Type
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Floor
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Occupancy
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
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
              {filteredRooms.map((room) => (
                <tr key={room.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {room.roomNumber}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.type}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {room.floor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    <div className="flex items-center">
                      <div className="text-sm">
                        {room.currentOccupancy}/{room.capacity}
                      </div>
                      <div className="ml-2 w-16 bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            room.currentOccupancy === room.capacity 
                              ? 'bg-red-500' 
                              : room.currentOccupancy > room.capacity * 0.8 
                                ? 'bg-yellow-500' 
                                : 'bg-green-500'
                          }`}
                          style={{ width: `${(room.currentOccupancy / room.capacity) * 100}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={room.status} />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatRelativeTime(room.lastUpdated)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center space-x-2">
                      {/* Status Change Dropdown */}
                      <select
                        value={room.status}
                        onChange={(e) => handleStatusChange(room.id, e.target.value)}
                        className="text-xs border rounded px-2 py-1"
                        disabled={user?.role === 'VIEWER'}
                      >
                        {ROOM_STATUSES.map(status => (
                          <option key={status} value={status}>{status}</option>
                        ))}
                      </select>
                      
                      {/* Edit Button */}
                      <button
                        onClick={() => openEditModal(room)}
                        className="text-blue-600 hover:text-blue-900"
                        disabled={user?.role === 'VIEWER'}
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      
                      {/* Delete Button */}
                      <button
                        onClick={() => handleDelete(room.id)}
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
              {showEditModal ? 'Edit Room' : 'Create New Room'}
            </h3>
            <form onSubmit={handleSubmit}>
              <div className="space-y-4">
                <div>
                  <label className="label">Room Number</label>
                  <input
                    type="text"
                    value={formData.roomNumber}
                    onChange={(e) => setFormData({...formData, roomNumber: e.target.value})}
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
                  <label className="label">Room Type</label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({...formData, type: e.target.value})}
                    className="input"
                    required
                  />
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
                  <label className="label">Capacity</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({...formData, capacity: parseInt(e.target.value)})}
                    className="input"
                    min="1"
                    required
                  />
                </div>
                <div>
                  <label className="label">Current Occupancy</label>
                  <input
                    type="number"
                    value={formData.currentOccupancy}
                    onChange={(e) => setFormData({...formData, currentOccupancy: parseInt(e.target.value)})}
                    className="input"
                    min="0"
                    max={formData.capacity}
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
                    {ROOM_STATUSES.map(status => (
                      <option key={status} value={status}>{status}</option>
                    ))}
                  </select>
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
                    setSelectedRoom(null);
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

export default Rooms;
