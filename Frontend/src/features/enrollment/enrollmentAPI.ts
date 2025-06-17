import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Enrollment } from '../../types/types';
import { ApiDomain } from '../../utils/ApiDomain';

export const enrollmentApi = createApi({
    reducerPath: 'enrollmentApi',
    baseQuery: fetchBaseQuery({ baseUrl: ApiDomain }),
    tagTypes: ['Enrollment'],
    endpoints: (builder) => ({
        // Get all enrollments
        getAllEnrollments: builder.query<Enrollment[], void>({
            query: () => 'enrollment',
            providesTags: ['Enrollment'],
        }),

        // Get enrollments by user ID
        getEnrollmentsByUserId: builder.query<Enrollment[], string>({
            query: (userId) => `enrollment/user/${userId}`,
            providesTags: ['Enrollment'],
        }),

        // Create new enrollment
        createEnrollment: builder.mutation<Enrollment, { userId: string; programId: string; notes?: string }>({
            query: (enrollmentData) => ({
                url: 'enrollment',
                method: 'POST',
                body: enrollmentData,
            }),
            invalidatesTags: ['Enrollment'],
        }),

        // Update enrollment
        updateEnrollment: builder.mutation<Enrollment, { enrollmentId: number; status?: 'active' | 'completed' | 'inactive'; progress?: number; notes?: string }>({
            query: ({ enrollmentId, ...updateData }) => ({
                url: `enrollment/${enrollmentId}`,
                method: 'PUT',
                body: updateData,
            }),
            invalidatesTags: ['Enrollment'],
        }),

        // Complete enrollment
        completeEnrollment: builder.mutation<Enrollment, number>({
            query: (enrollmentId) => ({
                url: `enrollment/${enrollmentId}/complete`,
                method: 'PUT',
            }),
            invalidatesTags: ['Enrollment'],
        }),

        // Delete enrollment
        deleteEnrollment: builder.mutation<void, number>({
            query: (enrollmentId) => ({
                url: `enrollment/${enrollmentId}`,
                method: 'DELETE',
            }),
            invalidatesTags: ['Enrollment'],
        }),
    }),
});

export const {
    useGetAllEnrollmentsQuery,
    useGetEnrollmentsByUserIdQuery,
    useCreateEnrollmentMutation,
    useUpdateEnrollmentMutation,
    useCompleteEnrollmentMutation,
    useDeleteEnrollmentMutation,
} = enrollmentApi;

