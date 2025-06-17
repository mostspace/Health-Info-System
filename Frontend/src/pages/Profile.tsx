import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../app/store';
import { useGetUserProfileQuery, useUpdateProfileMutation } from '../features/users/usersAPI';
import { UpdateProfileInput, CompleteUser } from '../types/types';

const Profile = () => {
    const navigate = useNavigate();
    const userState = useSelector((state: RootState) => state.user) || {};
    const currentUser = userState.user;
    const token = userState.token;
    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<UpdateProfileInput>({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        address: '',
    });
    const [validationError, setValidationError] = useState<string>('');

    const { data: userProfile, isLoading: isLoadingProfile } = useGetUserProfileQuery(currentUser?.userId || '');
    const [updateProfile, { isLoading: isUpdating, error: updateError }] = useUpdateProfileMutation();

    useEffect(() => {
        if (!token) {
            navigate('/login');
        }
    }, [token, navigate]);

    useEffect(() => {
        if (userProfile) {
            const profile = userProfile.profile as { firstName: string; lastName: string; phone?: string; address?: string };
            setFormData({
                firstName: profile.firstName,
                lastName: profile.lastName,
                email: userProfile.email,
                phone: profile.phone || '',
                address: profile.address || '',
            });
        }
    }, [userProfile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setValidationError('');

        if (!formData.firstName || !formData.lastName || !formData.email) {
            setValidationError('Please fill in all required fields');
            return;
        }

        try {
            await updateProfile({
                userId: currentUser?.userId || '',
                data: formData
            }).unwrap();
            setIsEditing(false);
        } catch (err) {
            console.error('Update failed:', err);
        }
    };

    if (isLoadingProfile) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-teal-500"></div>
            </div>
        );
    }

    const profile = userProfile?.profile as { firstName: string; lastName: string; phone?: string; address?: string };

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">
                <div className="bg-white shadow overflow-hidden sm:rounded-lg">
                    <div className="px-4 py-5 sm:px-6 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg leading-6 font-medium text-gray-900">
                                Profile Information
                            </h3>
                            <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                Personal details and contact information.
                            </p>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                        >
                            {isEditing ? 'Cancel' : 'Edit Profile'}
                        </button>
                    </div>

                    {isEditing ? (
                        <form onSubmit={handleSubmit} className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <div className="space-y-4">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                                        First Name
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                                        Last Name
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                        Phone
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={formData.phone}
                                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>

                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                        Address
                                    </label>
                                    <textarea
                                        id="address"
                                        name="address"
                                        rows={3}
                                        value={formData.address}
                                        onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-teal-500 focus:border-teal-500 sm:text-sm"
                                    />
                                </div>

                                {(validationError || updateError) && (
                                    <div className="text-red-500 text-sm">
                                        {validationError || 'Failed to update profile. Please try again.'}
                                    </div>
                                )}

                                <div className="flex justify-end">
                                    <button
                                        type="submit"
                                        disabled={isUpdating}
                                        className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500"
                                    >
                                        {isUpdating ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </div>
                        </form>
                    ) : (
                        <div className="border-t border-gray-200 px-4 py-5 sm:px-6">
                            <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">First Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile?.firstName}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Last Name</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile?.lastName}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Email</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{userProfile?.email}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Phone</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile?.phone || 'Not provided'}</dd>
                                </div>

                                <div className="sm:col-span-2">
                                    <dt className="text-sm font-medium text-gray-500">Address</dt>
                                    <dd className="mt-1 text-sm text-gray-900">{profile?.address || 'Not provided'}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Role</dt>
                                    <dd className="mt-1 text-sm text-gray-900 capitalize">{userProfile?.role}</dd>
                                </div>

                                <div className="sm:col-span-1">
                                    <dt className="text-sm font-medium text-gray-500">Account Status</dt>
                                    <dd className="mt-1 text-sm text-gray-900">
                                        {userProfile?.isVerified ? 'Verified' : 'Not Verified'}
                                    </dd>
                                </div>
                            </dl>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Profile;
