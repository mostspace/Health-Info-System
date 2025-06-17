import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useGetAllUsersQuery } from '../features/users/usersAPI';
import { useGetAllEnrollmentsQuery, useCreateEnrollmentMutation } from '../features/enrollment/enrollmentAPI';
import { useGetAllProgramsQuery } from '../features/programs/programsAPI';
import { CompleteUser, UserRole } from '../types/types';
import { FaSearch, FaUserPlus, FaEye, FaEdit, FaClipboardList, FaGraduationCap } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Client = () => {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedRole, setSelectedRole] = useState<UserRole | ''>('');
    const [selectedClient, setSelectedClient] = useState<CompleteUser | null>(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);
    const [isEnrollModalOpen, setIsEnrollModalOpen] = useState(false);
    const [selectedPrograms, setSelectedPrograms] = useState<string[]>([]);
    const [enrollmentNotes, setEnrollmentNotes] = useState('');

    const { data: clients, isLoading: isLoadingClients } = useGetAllUsersQuery();
    const { data: enrollments = [], isLoading: isLoadingEnrollments, refetch: refetchEnrollments } = useGetAllEnrollmentsQuery();
    const [createEnrollment] = useCreateEnrollmentMutation();
    const { data: programs = [], isLoading: isLoadingPrograms, error: programsError } = useGetAllProgramsQuery();

    // Add debug logs
    console.log('Enrollments:', enrollments);
    console.log('Selected Client:', selectedClient);
    console.log('Programs:', programs);

    // Filter clients in the frontend
    const displayedClients = (clients || []).filter(client => {
        const matchesRole = selectedRole ? client.role === selectedRole : true;
        const matchesSearch = searchQuery
            ? (
                (client.profile?.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
                (client.profile?.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) || '') ||
                (client.email?.toLowerCase().includes(searchQuery.toLowerCase()) || '')
            )
            : true;
        return matchesRole && matchesSearch;
    });

    const handleViewClient = (client: CompleteUser) => {
        setSelectedClient(client);
        setIsViewModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsViewModalOpen(false);
        setIsEnrollModalOpen(false);
        setSelectedClient(null);
        setSelectedPrograms([]);
        setEnrollmentNotes('');
    };

    const handleEnrollClient = (client: CompleteUser) => {
        setSelectedClient(client);
        setIsEnrollModalOpen(true);
    };

    const handleProgramSelection = (programId: string) => {
        setSelectedPrograms(prev => {
            if (prev.includes(programId)) {
                return prev.filter(id => id !== programId);
            } else {
                return [...prev, programId];
            }
        });
    };

    const handleSubmitEnrollment = async () => {
        if (selectedClient && selectedPrograms.length > 0) {
            try {
                for (const programId of selectedPrograms) {
                    await createEnrollment({
                        userId: selectedClient.userId,
                        programId: programId,
                        notes: enrollmentNotes
                    }).unwrap();
                }
                // Refetch enrollments after successful enrollment
                await refetchEnrollments();
                
                toast.success('Client enrolled successfully!', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
                handleCloseModal();
            } catch (error) {
                console.error('Failed to create enrollment:', error);
                toast.error('Failed to enroll client. Please try again.', {
                    position: "top-right",
                    autoClose: 3000,
                    hideProgressBar: false,
                    closeOnClick: true,
                    pauseOnHover: true,
                    draggable: true,
                });
            }
        } else {
            toast.warning('Please select at least one program to enroll.', {
                position: "top-right",
                autoClose: 3000,
                hideProgressBar: false,
                closeOnClick: true,
                pauseOnHover: true,
                draggable: true,
            });
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
            <ToastContainer />
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Client Management</h1>
                    <button
                        onClick={() => navigate('/clients/new')}
                        className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                    >
                        <FaUserPlus className="mr-2" />
                        Add New Client
                    </button>
                </div>

                {/* Search and Filter */}
                <div className="bg-white shadow rounded-lg p-6 mb-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <FaSearch className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Search clients..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                            />
                        </div>
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value as UserRole | '')}
                            className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm rounded-md"
                        >
                            <option value="">All Roles</option>
                            <option value="client">Patient</option>
                            <option value="client">Doctor</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                </div>

                {/* Clients List */}
                <div className="bg-white shadow rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {isLoadingClients ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500 mx-auto"></div>
                                        </td>
                                    </tr>
                                ) : displayedClients?.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="px-6 py-4 text-center text-gray-500">
                                            No clients found
                                        </td>
                                    </tr>
                                ) : (
                                    displayedClients?.map((client) => (
                                        <tr key={client.userId} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <div className="flex-shrink-0 h-10 w-10">
                                                        <img
                                                            className="h-10 w-10 rounded-full"
                                                            src={client.imageUrl || "https://cdn.pixabay.com/photo/2016/04/15/18/05/computer-1331579_1280.png"}
                                                            alt=""
                                                        />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {client.profile?.firstName} {client.profile?.lastName}
                                                        </div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {client.email}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    client.role === 'client' ? 'bg-green-100 text-green-800' :
                                                    client.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-purple-100 text-purple-800'
                                                }`}>
                                                    {client.role}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    client.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {client.isVerified ? 'Verified' : 'Pending'}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                                <div className="flex space-x-3">
                                                    <button
                                                        onClick={() => handleViewClient(client)}
                                                        className="text-teal-600 hover:text-teal-900"
                                                    >
                                                        View
                                                        <FaEye className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleEnrollClient(client)}
                                                        className="text-indigo-600 hover:text-indigo-900"
                                                    >
                                                        Enroll
                                                        <FaGraduationCap className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/clients/edit/${client.userId}`)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                    >
                                                        Edit
                                                        <FaEdit className="h-5 w-5" />
                                                    </button>
                                                    <button
                                                        onClick={() => navigate(`/clients/programs/${client.userId}`)}
                                                        className="text-purple-600 hover:text-purple-900"
                                                    >
                                                        <FaClipboardList className="h-5 w-5" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* View Modal */}
                {isViewModalOpen && selectedClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <div className="flex flex-col items-center">
                                <img
                                    className="h-24 w-24 rounded-full object-cover border-4 border-teal-100 mb-4"
                                    src={selectedClient.imageUrl || 'https://cdn.pixabay.com/photo/2016/04/15/18/05/computer-1331579_1280.png'}
                                    alt="Client avatar"
                                />
                                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                    {selectedClient.profile?.firstName || ''} {selectedClient.profile?.lastName || ''}
                                </h3>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-2 ${
                                    selectedClient.role === 'client' ? 'bg-green-100 text-green-800' :
                                    selectedClient.role === 'doctor' ? 'bg-blue-100 text-blue-800' :
                                    'bg-purple-100 text-purple-800'
                                }`}>
                                    {selectedClient.role}
                                </span>
                                <span className={`px-3 py-1 rounded-full text-xs font-semibold mb-4 ${
                                    selectedClient.isVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                    {selectedClient.isVerified ? 'Verified' : 'Pending Verification'}
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 mt-4">
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Email</p>
                                    <p className="text-base text-gray-900 break-all">{selectedClient.email}</p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500">Phone</p>
                                    <p className="text-base text-gray-900">{selectedClient.profile?.phone || 'Not provided'}</p>
                                </div>
                                <div className="sm:col-span-2">
                                    <p className="text-sm font-medium text-gray-500">Address</p>
                                    <p className="text-base text-gray-900">{selectedClient.profile?.address || 'Not provided'}</p>
                                </div>
                            </div>
                            {/* Enrolled Programs Section */}
                            <div className="mt-8">
                                <h4 className="text-lg font-semibold text-gray-800 mb-2">Enrolled Programs</h4>
                                <div className="bg-gray-50 rounded-lg p-4">
                                    {isLoadingEnrollments ? (
                                        <div className="text-gray-500 text-sm">Loading enrollments...</div>
                                    ) : Array.isArray(enrollments) && selectedClient ? (
                                        (() => {
                                            const clientEnrollments = enrollments.filter(e => e.userId === selectedClient.userId);
                                            console.log('Client Enrollments:', clientEnrollments);
                                            
                                            return clientEnrollments.length > 0 ? (
                                                <ul className="divide-y divide-gray-200">
                                                    {clientEnrollments.map((enrollment, idx) => {
                                                        const program = Array.isArray(programs) 
                                                            ? programs.find(p => p.programId === enrollment.programId) 
                                                            : null;
                                                        console.log('Found Program:', program);
                                                        
                                                        return (
                                                            <li key={enrollment.id || idx} className="py-2 flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <span className="font-medium text-gray-900">{program?.name || 'Unknown Program'}</span>
                                                                    <span className="ml-2 text-xs px-2 py-1 rounded-full font-semibold 'bg-gray-100 text-gray-700'">
                                                                        {enrollment.status.charAt(0).toUpperCase() + enrollment.status.slice(1)}
                                                                    </span>
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1 sm:mt-0">
                                                                    Enrolled: {enrollment.enrolledAt ? new Date(enrollment.enrolledAt).toLocaleDateString() : 'N/A'}
                                                                </div>
                                                            </li>
                                                        );
                                                    })}
                                                </ul>
                                            ) : (
                                                <div className="text-gray-500 text-sm">No enrolled programs.</div>
                                            );
                                        })()
                                    ) : (
                                        <div className="text-gray-500 text-sm">No enrolled programs.</div>
                                    )}
                                </div>
                            </div>
                            <div className="mt-8 flex justify-end">
                                <button
                                    type="button"
                                    onClick={handleCloseModal}
                                    className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Enrollment Modal */}
                {isEnrollModalOpen && selectedClient && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60">
                        <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 relative">
                            <button
                                onClick={handleCloseModal}
                                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                            <h2 className="text-xl font-bold mb-4">Enroll Client in Programs</h2>
                            {isLoadingPrograms ? (
                                <div className="flex justify-center items-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-500"></div>
                                </div>
                            ) : programsError ? (
                                <div className="text-red-500 text-center">Error loading programs.</div>
                            ) : programs && programs.length > 0 ? (
                                <div className="mb-4 max-h-60 overflow-y-auto border rounded-md">
                                    {programs.map((program) => (
                                        <div
                                            key={program.programId}
                                            className={`p-3 border-b last:border-b-0 cursor-pointer hover:bg-gray-50 ${
                                                selectedPrograms.includes(program.programId) ? 'bg-teal-50' : ''
                                            }`}
                                            onClick={() => handleProgramSelection(program.programId)}
                                        >
                                            <div className="flex items-center">
                                                <input
                                                    type="checkbox"
                                                    checked={selectedPrograms.includes(program.programId)}
                                                    onChange={() => handleProgramSelection(program.programId)}
                                                    className="h-4 w-4 text-teal-600 focus:ring-teal-500 border-gray-300 rounded"
                                                />
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">{program.name}</p>
                                                    <p className="text-xs text-gray-500">{program.description}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-gray-500 text-center">No programs available.</div>
                            )}
                            <div className="mb-4">
                                <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    id="notes"
                                    rows={3}
                                    value={enrollmentNotes}
                                    onChange={(e) => setEnrollmentNotes(e.target.value)}
                                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                                    placeholder="Add any additional notes about these enrollments..."
                                />
                            </div>
                            <div className="mt-6 flex justify-end">
                                <button
                                    onClick={handleSubmitEnrollment}
                                    disabled={selectedPrograms.length === 0 || isLoadingPrograms}
                                    className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Enroll
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Client;