import React, { useState } from 'react';
import {
  useGetAllProgramsQuery,
  useCreateProgramMutation,
  useUpdateProgramMutation,
  useDeleteProgramMutation,
  useToggleProgramStatusMutation,
  useEnrollInProgramMutation,
  useGetUserEnrollmentsQuery,
  HealthProgram,
  CreateProgramInput,
  UpdateProgramInput
} from '../features/healthPrograms/programAPI';
import { FaPlus, FaEdit, FaTrash, FaToggleOn, FaUserPlus, FaUserCheck, FaClock, FaChartLine, FaSpinner } from 'react-icons/fa';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'react-toastify';

const ProgramManagement: React.FC = () => {
  const { user } = useSelector((state: RootState) => state.auth);
  const isAdmin = user?.role === 'admin';
  
  const { data: programs, isLoading, error, refetch } = useGetAllProgramsQuery();
  const { data: userEnrollments } = useGetUserEnrollmentsQuery(undefined, {
    skip: isAdmin
  });
  const [createProgram, { isLoading: isCreating }] = useCreateProgramMutation();
  const [updateProgram, { isLoading: isUpdating }] = useUpdateProgramMutation();
  const [deleteProgram, { isLoading: isDeleting }] = useDeleteProgramMutation();
  const [toggleStatus] = useToggleProgramStatusMutation();
  const [enrollInProgram] = useEnrollInProgramMutation();

  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<HealthProgram | null>(null);
  const [formData, setFormData] = useState<CreateProgramInput>({
    name: '',
    description: '',
    difficulty: 'Beginner',
    duration: '4 weeks',
    imageUrl: ''
  });
  const [formErrors, setFormErrors] = useState<Partial<CreateProgramInput>>({});

  const validateForm = () => {
    const errors: Partial<CreateProgramInput> = {};
    if (!formData.name?.trim()) errors.name = 'Name is required';
    if (!formData.description?.trim()) errors.description = 'Description is required';
    if (!formData.duration?.trim()) errors.duration = 'Duration is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleOpenDialog = (program?: HealthProgram) => {
    if (program) {
      setSelectedProgram(program);
      setFormData({
        name: program.name,
        description: program.description || '',
        difficulty: program.difficulty || 'Beginner',
        duration: program.duration || '4 weeks',
        imageUrl: program.imageUrl || ''
      });
    } else {
      setSelectedProgram(null);
      setFormData({
        name: '',
        description: '',
        difficulty: 'Beginner',
        duration: '4 weeks',
        imageUrl: ''
      });
    }
    setFormErrors({});
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedProgram(null);
    setFormErrors({});
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    try {
      if (selectedProgram) {
        const updateData: UpdateProgramInput = {
          ...formData,
          isActive: selectedProgram.isActive
        };
        await updateProgram({ programId: selectedProgram.programId, data: updateData }).unwrap();
        toast.success('Program updated successfully');
      } else {
        await createProgram(formData).unwrap();
        toast.success('Program created successfully');
      }
      handleCloseDialog();
      refetch(); // Refresh the programs list
    } catch (error) {
      toast.error('Failed to save program. Please try again.');
      console.error('Error saving program:', error);
    }
  };

  const handleDelete = async (programId: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        await deleteProgram(programId).unwrap();
        toast.success('Program deleted successfully');
        refetch(); // Refresh the programs list
      } catch (error) {
        toast.error('Failed to delete program. Please try again.');
        console.error('Error deleting program:', error);
      }
    }
  };

  const handleToggleStatus = async (programId: string) => {
    try {
      await toggleStatus(programId).unwrap();
    } catch (error) {
      console.error('Error toggling program status:', error);
    }
  };

  const handleEnroll = async (programId: string) => {
    try {
      await enrollInProgram(programId).unwrap();
    } catch (error) {
      console.error('Error enrolling in program:', error);
    }
  };

  if (isLoading) return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-500"></div>
    </div>
  );

  if (error) return (
    <div className="p-4 text-red-500 text-center">
      Error loading programs. Please try again later.
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Health Programs</h1>
          {isAdmin && (
            <button
              onClick={() => handleOpenDialog()}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
            >
              <FaPlus className="mr-2" />
              Add Program
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {programs?.map((program) => {
            const isEnrolled = userEnrollments?.some(
              enrollment => enrollment.programId === program.programId
            );

            return (
              <div
                key={program.programId}
                className="bg-white overflow-hidden shadow rounded-lg hover:shadow-lg transition-shadow duration-300"
              >
                <div className="relative h-48">
                  <img
                    src={
                      // program.imageUrl ||
                       "https://cdn.pixabay.com/photo/2015/07/30/14/36/hypertension-867855_1280.jpg"}
                    alt={program.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2 right-2">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      program.isActive
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {program.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                </div>
                <div className="px-4 py-5 sm:p-6">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">{program.name}</h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      program.difficulty === 'Beginner'
                        ? 'bg-green-100 text-green-800'
                        : program.difficulty === 'Intermediate'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {program.difficulty}
                    </span>
                  </div>
                  <p className="mt-2 text-sm text-gray-500 line-clamp-2">{program.description}</p>
                  <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-500">
                      <FaClock className="mr-1" />
                      <span>{program.duration}</span>
                    </div>
                    <div className="flex space-x-2">
                      {isAdmin ? (
                        <>
                          <button
                            onClick={() => handleOpenDialog(program)}
                            className="text-teal-600 hover:text-teal-800"
                            title="Edit"
                          >
                            <FaEdit />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(program.programId)}
                            className="text-blue-600 hover:text-blue-800"
                            title="Toggle Status"
                          >
                            <FaToggleOn />
                          </button>
                          <button
                            onClick={() => handleDelete(program.programId)}
                            className="text-red-600 hover:text-red-800"
                            title="Delete"
                          >
                            <FaTrash />
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEnroll(program.programId)}
                          disabled={isEnrolled || !program.isActive}
                          className={`inline-flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                            isEnrolled
                              ? 'bg-green-100 text-green-800 cursor-default'
                              : 'bg-teal-100 text-teal-800 hover:bg-teal-200'
                          }`}
                          title={isEnrolled ? 'Already Enrolled' : 'Enroll in Program'}
                        >
                          {isEnrolled ? (
                            <>
                              <FaUserCheck className="mr-1" />
                              Enrolled
                            </>
                          ) : (
                            <>
                              <FaUserPlus className="mr-1" />
                              Enroll
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dialog */}
        {openDialog && (
          <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-md transform transition-all">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedProgram ? 'Edit Program' : 'Add Program'}
                </h2>
                <button
                  onClick={handleCloseDialog}
                  className="text-gray-400 hover:text-gray-500"
                >
                  <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, name: e.target.value })}
                    className={`w-full px-3 py-2 border ${
                      formErrors.name ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="Enter program name"
                  />
                  {formErrors.name && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.name}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                  <textarea
                    value={formData.description}
                    onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) =>
                      setFormData({ ...formData, description: e.target.value })}
                    className={`w-full px-3 py-2 border ${
                      formErrors.description ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    rows={4}
                    placeholder="Enter program description"
                  />
                  {formErrors.description && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.description}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                  <input
                    type="text"
                    value={formData.imageUrl}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, imageUrl: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                    placeholder="https://example.com/image.jpg"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                  <select
                    value={formData.difficulty}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) =>
                      setFormData({ ...formData, difficulty: e.target.value as 'Beginner' | 'Intermediate' | 'Advanced' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                  <input
                    type="text"
                    value={formData.duration}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                      setFormData({ ...formData, duration: e.target.value })}
                    className={`w-full px-3 py-2 border ${
                      formErrors.duration ? 'border-red-500' : 'border-gray-300'
                    } rounded-lg focus:ring-2 focus:ring-teal-500 focus:border-teal-500`}
                    placeholder="e.g., 4 weeks"
                  />
                  {formErrors.duration && (
                    <p className="mt-1 text-sm text-red-600">{formErrors.duration}</p>
                  )}
                </div>
              </div>
              <div className="mt-6 flex justify-end space-x-3">
                <button
                  onClick={handleCloseDialog}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isCreating || isUpdating}
                  className="inline-flex items-center px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {(isCreating || isUpdating) ? (
                    <>
                      <FaSpinner className="animate-spin mr-2" />
                      {selectedProgram ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    selectedProgram ? 'Update' : 'Create'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProgramManagement;
