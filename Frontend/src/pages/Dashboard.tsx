import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { 
  useGetAllProgramsQuery,
  HealthProgram
} from '../features/healthPrograms/programAPI';
import { useGetAllEnrollmentsQuery } from '../features/enrollment/enrollmentAPI';
import { Enrollment } from '../types/types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { FaUsers, FaClipboardList, FaChartLine, FaTrophy } from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

interface ProgramStat {
  name: string;
  value: number;
}

interface EnrollmentData {
  name: string;
  enrollments: number;
}

const Dashboard: React.FC = () => {
  const { data: programs = [], isLoading: programsLoading } = useGetAllProgramsQuery();
  const { data: enrollments = [], isLoading: enrollmentsLoading, refetch: refetchEnrollments } = useGetAllEnrollmentsQuery();

  // Add debug logs
  console.log('Dashboard - Enrollments:', enrollments);
  console.log('Dashboard - Programs:', programs);

  // Calculate program statistics with proper type checking
  const programStats = Array.isArray(programs) ? programs.reduce((acc: Record<string, number>, program: HealthProgram) => {
    const difficulty = program.difficulty || 'Unknown';
    acc[difficulty] = (acc[difficulty] || 0) + 1;
    return acc;
  }, {}) : {};

  const programData: ProgramStat[] = Object.entries(programStats).map(([name, value]) => ({
    name,
    value
  }));

  // Calculate completion rate with proper type checking
  const completionRate = Array.isArray(enrollments) ? enrollments.reduce((acc: { completed: number; total: number }, enrollment: Enrollment) => {
    if (enrollment.status === 'completed') acc.completed++;
    acc.total++;
    return acc;
  }, { completed: 0, total: 0 }) : { completed: 0, total: 0 };

  const completionPercentage = completionRate.total > 0 
    ? Math.round((completionRate.completed / completionRate.total) * 100) 
    : 0;

  // Calculate enrollment data for chart with proper type checking
  const enrollmentData: EnrollmentData[] = Array.isArray(programs) ? programs.map((program: HealthProgram) => {
    const enrollmentCount = Array.isArray(enrollments) 
      ? enrollments.filter((e: Enrollment) => e.programId === program.programId).length 
      : 0;
    return {
      name: program.name,
      enrollments: enrollmentCount
    };
  }) : [];

  // Refetch enrollments periodically to keep data fresh
  useEffect(() => {
    const interval = setInterval(() => {
      refetchEnrollments();
    }, 30000); // Refetch every 30 seconds

    return () => clearInterval(interval);
  }, [refetchEnrollments]);

  if (programsLoading || enrollmentsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Dashboard</h1>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600">
              <FaUsers className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Programs</p>
              <p className="text-2xl font-semibold text-gray-800">{Array.isArray(programs) ? programs.length : 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600">
              <FaClipboardList className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Enrollments</p>
              <p className="text-2xl font-semibold text-gray-800">{Array.isArray(enrollments) ? enrollments.length : 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600">
              <FaChartLine className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completion Rate</p>
              <p className="text-2xl font-semibold text-gray-800">{completionPercentage}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600">
              <FaTrophy className="h-6 w-6" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed Programs</p>
              <p className="text-2xl font-semibold text-gray-800">{completionRate.completed}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Program Difficulty Distribution */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Program Difficulty Distribution</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={programData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                  {programData.map((_entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Program Enrollments */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Program Enrollments</h2>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={enrollmentData}
                margin={{
                  top: 5,
                  right: 30,
                  left: 20,
                  bottom: 5,
                }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="enrollments" fill="#4FD1C5" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Enrollments */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Recent Enrollments</h2>
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Program</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Enrolled Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {Array.isArray(enrollments) && enrollments.length > 0 ? (
                [...enrollments]
                  .sort((a, b) => new Date(b.enrolledAt).getTime() - new Date(a.enrolledAt).getTime())
                  .slice(0, 5)
                  .map((enrollment, idx) => {
                    const program = Array.isArray(programs) 
                      ? programs.find(p => p.programId === enrollment.programId)
                      : null;
                    const userName = enrollment.userId || 'N/A';
                    return (
                      <tr key={enrollment.id || enrollment.programId || idx}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">{program?.name || 'Unknown Program'}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-700">{userName}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {enrollment.enrolledAt
                              ? new Date(enrollment.enrolledAt).toLocaleDateString()
                              : 'N/A'}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            enrollment.status === 'completed'
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {enrollment.status === 'completed' ? 'Completed' : 'In Progress'}
                          </span>
                        </td>
                      </tr>
                    );
                  })
              ) : (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                    No enrollments found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;