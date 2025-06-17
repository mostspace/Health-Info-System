import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { ApiDomain } from "../../utils/ApiDomain";
import { CompleteUser, AuthResponse, LoginInput, RegisterInput, UpdateProfileInput, ApiResponse } from "../../types/types";
import { RootState } from "../../store";

// API Slice
export const usersAPI = createApi({
    reducerPath: 'usersAPI',
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
    tagTypes: ['Users'],
    endpoints: (builder) => ({
        // Auth endpoints
        register: builder.mutation<ApiResponse<{ userId: string }>, Omit<RegisterInput, 'confirmPassword'>>({
            query: (userData) => ({
                url: 'register',
                method: 'POST',
                body: userData,
            }),
        }),
        login: builder.mutation<AuthResponse, LoginInput>({
            query: (credentials) => ({
                url: 'login',
                method: 'POST',
                body: credentials,
            }),
        }),
        verifyAccount: builder.mutation<ApiResponse<void>, { token: string }>({
            query: ({ token }) => ({
                url: 'verify',
                method: 'POST',
                body: { token },
            }),
        }),

        // User Profile endpoints
        getUserProfile: builder.query<CompleteUser, string>({
            query: (userId) => `users/${userId}`,
            providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
        }),
        updateProfile: builder.mutation<ApiResponse<void>, { userId: string; data: UpdateProfileInput }>({
            query: ({ userId, data }) => ({
                url: `users/${userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { userId }) => [{ type: 'Users', id: userId }],
        }),
        changePassword: builder.mutation<ApiResponse<void>, { userId: string; currentPassword: string; newPassword: string }>({
            query: ({ userId, currentPassword, newPassword }) => ({
                url: `users/${userId}/password`,
                method: 'PUT',
                body: { currentPassword, newPassword },
            }),
        }),

        // Admin endpoints
        getAllUsers: builder.query<CompleteUser[], void>({
            query: () => 'users',
            providesTags: ['Users'],
        }),
        searchUsers: builder.query<CompleteUser[], { query: string; role?: string }>({
            query: ({ query, role }) => ({
                url: 'users/search',
                params: { query, role },
            }),
            providesTags: ['Users'],
        }),

        // V2 endpoints (for backward compatibility)
        getAllUsersV2: builder.query<CompleteUser[], void>({
            query: () => 'v2/users',
            providesTags: ['Users'],
        }),
        getUserProfileV2: builder.query<CompleteUser, string>({
            query: (userId) => `v2/users/${userId}`,
            providesTags: (_result, _error, userId) => [{ type: 'Users', id: userId }],
        }),
        updateProfileV2: builder.mutation<ApiResponse<void>, { userId: string; data: UpdateProfileInput }>({
            query: ({ userId, data }) => ({
                url: `v2/users/${userId}`,
                method: 'PUT',
                body: data,
            }),
            invalidatesTags: (_result, _error, { userId }) => [{ type: 'Users', id: userId }],
        }),
    }),
});

// Export hooks for usage in components
export const {
    useRegisterMutation,
    useLoginMutation,
    useVerifyAccountMutation,
    useGetUserProfileQuery,
    useUpdateProfileMutation,
    useChangePasswordMutation,
    useGetAllUsersQuery,
    useSearchUsersQuery,
    useGetAllUsersV2Query,
    useGetUserProfileV2Query,
    useUpdateProfileV2Mutation,
} = usersAPI;