import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Bed,
  Home,
  Activity,
  AlertTriangle,
  FileText,
  BarChart3,
  Settings,
  ChevronDown,
  ChevronRight,
  Users
} from 'lucide-react';

const Sidebar = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [expandedSections, setExpandedSections] = useState({});

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      title: 'Dashboard',
      path: '/dashboard',
      icon: LayoutDashboard,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
    },
    {
      title: 'Resources',
      icon: Home,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER'],
      children: [
        {
          title: 'Beds',
          path: '/beds',
          icon: Bed,
          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
        },
        {
          title: 'Rooms',
          path: '/rooms',
          icon: Home,
          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
        },
        {
          title: 'Equipment',
          path: '/equipment',
          icon: Activity,
          roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
        }
      ]
    },
    {
      title: 'Alerts',
      path: '/alerts',
      icon: AlertTriangle,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
    },
    {
      title: 'Audit Log',
      path: '/audit',
      icon: FileText,
      roles: ['ADMIN', 'VIEWER']
    },
    {
      title: 'Analytics',
      path: '/analytics',
      icon: BarChart3,
      roles: ['ADMIN', 'DOCTOR', 'NURSE', 'VIEWER']
    },
    {
      title: 'Settings',
      path: '/settings',
      icon: Settings,
      roles: ['ADMIN']
    }
  ];

  const filterMenuItems = (items) => {
    return items.filter(item => {
      if (item.roles && !item.roles.includes(user?.role)) {
        return false;
      }
      
      if (item.children) {
        item.children = filterMenuItems(item.children);
        return item.children.length > 0;
      }
      
      return true;
    });
  };

  const isActive = (path) => {
    return location.pathname === path || 
           (path !== '/' && location.pathname.startsWith(path));
  };

  const filteredMenuItems = filterMenuItems(menuItems);

  return (
    <div className="hidden md:flex md:flex-shrink-0">
      <div className="flex flex-col w-64">
        <div className="flex flex-col h-0 flex-1 bg-gray-800 border-r border-gray-700">
          <div className="flex-1 flex flex-col pt-5 pb-4 overflow-y-auto">
            <nav className="mt-5 flex-1 px-2 space-y-1">
              {filteredMenuItems.map((item) => {
                const Icon = item.icon;
                const isExpanded = expandedSections[item.title];
                const hasChildren = item.children && item.children.length > 0;
                const isItemActive = hasChildren ? 
                  item.children.some(child => isActive(child.path)) : 
                  isActive(item.path);

                return (
                  <div key={item.title}>
                    {hasChildren ? (
                      <div>
                        <button
                          onClick={() => toggleSection(item.title)}
                          className={`w-full flex items-center justify-between px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                            isItemActive
                              ? 'bg-gray-900 text-white'
                              : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                          }`}
                        >
                          <div className="flex items-center">
                            <Icon className="mr-3 h-5 w-5" />
                            {item.title}
                          </div>
                          {isExpanded ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                        </button>
                        
                        {isExpanded && (
                          <div className="ml-8 mt-1 space-y-1">
                            {item.children.map((child) => {
                              const ChildIcon = child.icon;
                              const isChildActive = isActive(child.path);
                              
                              return (
                                <Link
                                  key={child.path}
                                  to={child.path}
                                  className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                                    isChildActive
                                      ? 'bg-gray-900 text-white'
                                      : 'text-gray-400 hover:bg-gray-700 hover:text-white'
                                  }`}
                                >
                                  <ChildIcon className="mr-3 h-4 w-4" />
                                  {child.title}
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    ) : (
                      <Link
                        to={item.path}
                        className={`flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                          isItemActive
                            ? 'bg-gray-900 text-white'
                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                        }`}
                      >
                        <Icon className="mr-3 h-5 w-5" />
                        {item.title}
                      </Link>
                    )}
                  </div>
                );
              })}
            </nav>
          </div>
          
          {/* User info at bottom */}
          <div className="flex-shrink-0 flex bg-gray-700 border-t border-gray-600 p-4">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 rounded-full bg-primary-500 flex items-center justify-center">
                  <Users className="h-4 w-4 text-white" />
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-300">
                  {user?.role} • {user?.department || 'No Department'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
