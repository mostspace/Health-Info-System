import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { HealthProgram } from '../../types/types';
import { ApiDomain } from '../../utils/ApiDomain';
import { RootState } from '../../store';

export const programsApi = createApi({
    reducerPath: 'programsApi',
    baseQuery: fetchBaseQuery({
        baseUrl: ApiDomain,
        prepareHeaders: (headers, { getState }) => {
            const token = (getState() as RootState).auth.user?.token;
            if (token) {
                headers.set('Authorization', `Bearer ${token}`);
            }
            headers.set('Content-Type', 'application/json');
            return headers;
        },
    }),
    tagTypes: ['Program'],
    endpoints: (builder) => ({
        // Get all health programs
        getAllPrograms: builder.query<HealthProgram[], void>({
            query: () => 'program',
            providesTags: ['Program'],
        }),

        // Get program by ID
        getProgramById: builder.query<HealthProgram, string>({
            query: (programId) => `program/${programId}`,
            providesTags: ['Program'],
        }),
    }),
});

export const {
    useGetAllProgramsQuery,
    useGetProgramByIdQuery,
} = programsApi; 