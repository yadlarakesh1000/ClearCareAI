import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';

// ── Doctors ──────────────────────────────────────────────────────────────────
export function useDoctors(params = {}) {
  return useQuery({
    queryKey: ['doctors', params],
    queryFn: () => api.get('/doctors', { params }).then((r) => r.data.data),
  });
}

export function useDoctor(id) {
  return useQuery({
    queryKey: ['doctor', id],
    queryFn: () => api.get(`/doctors/${id}`).then((r) => r.data.data),
    enabled: !!id,
  });
}

// A missing profile returns 404 — the doctor dashboard uses that signal to show
// the profile-creation form instead of the dashboard cards (don't retry a 404).
export function useDoctorProfile() {
  return useQuery({
    queryKey: ['doctorProfile'],
    queryFn: () => api.get('/doctors/profile').then((r) => r.data.data),
    retry: (count, err) => err?.response?.status !== 404 && count < 1,
  });
}

// ── Patient Profile ───────────────────────────────────────────────────────────
// A missing profile returns 404 (not an error to retry) — dashboards use that
// signal to show the profile-creation form instead of the dashboard cards.
export function usePatientProfile() {
  return useQuery({
    queryKey: ['patientProfile'],
    queryFn: () => api.get('/patients/profile').then((r) => r.data.data),
    retry: (count, err) => err?.response?.status !== 404 && count < 1,
  });
}

// ── Slots ─────────────────────────────────────────────────────────────────────
export function useDoctorSlots(doctorId, dayOfWeek) {
  return useQuery({
    queryKey: ['slots', doctorId, dayOfWeek],
    queryFn: () =>
      api
        .get(`/slots/doctor/${doctorId}`, { params: dayOfWeek ? { dayOfWeek } : {} })
        .then((r) => r.data.data),
    enabled: !!doctorId,
  });
}

export function useAvailableSlots(doctorId, date) {
  return useQuery({
    queryKey: ['availableSlots', doctorId, date],
    queryFn: () =>
      api.get('/slots/available', { params: { doctorId, date } }).then((r) => r.data.data),
    enabled: !!doctorId && !!date,
  });
}

// ── Appointments ──────────────────────────────────────────────────────────────
export function useMyAppointments(params = {}, options = {}) {
  return useQuery({
    queryKey: ['myAppointments', params],
    queryFn: () => api.get('/appointments/my', { params }).then((r) => r.data.data),
    ...options,
  });
}

export function useDoctorAppointments(params = {}, options = {}) {
  return useQuery({
    queryKey: ['doctorAppointments', params],
    queryFn: () => api.get('/appointments/doctor', { params }).then((r) => r.data.data),
    ...options,
  });
}

// ── Appointments (single) ──────────────────────────────────────────────────────
export function useAppointment(id, options = {}) {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: () => api.get(`/appointments/${id}`).then((r) => r.data.data),
    enabled: !!id,
    ...options,
  });
}

// ── Consultations ─────────────────────────────────────────────────────────────
// A consultation may not exist yet for an appointment — that returns 404, which is
// a normal "not started" signal, so don't retry it.
export function useConsultationByAppointment(appointmentId, options = {}) {
  return useQuery({
    queryKey: ['consultation', 'appointment', appointmentId],
    queryFn: () =>
      api.get(`/consultations/appointment/${appointmentId}`).then((r) => r.data.data),
    enabled: !!appointmentId,
    retry: (count, err) => err?.response?.status !== 404 && count < 1,
    ...options,
  });
}

// ── Reviews ───────────────────────────────────────────────────────────────────
export function useDoctorReviews(doctorId, params = {}) {
  return useQuery({
    queryKey: ['doctorReviews', doctorId, params],
    queryFn: () =>
      api.get(`/reviews/doctor/${doctorId}`, { params }).then((r) => r.data.data),
    enabled: !!doctorId,
  });
}

export function useMyReviews(params = {}) {
  return useQuery({
    queryKey: ['myReviews', params],
    queryFn: () => api.get('/reviews/my', { params }).then((r) => r.data.data),
  });
}

// ── Analytics ─────────────────────────────────────────────────────────────────
export function useDoctorAnalytics(doctorId) {
  return useQuery({
    queryKey: ['doctorAnalytics', doctorId],
    queryFn: () => api.get(`/analytics/doctor/${doctorId}`).then((r) => r.data.data),
    enabled: !!doctorId,
  });
}

export function usePlatformAnalytics() {
  return useQuery({
    queryKey: ['platformAnalytics'],
    queryFn: () => api.get('/analytics/platform').then((r) => r.data.data),
  });
}

// ── Admin ─────────────────────────────────────────────────────────────────────
export function useAdminUsers(params = {}) {
  return useQuery({
    queryKey: ['adminUsers', params],
    queryFn: () => api.get('/admin/users', { params }).then((r) => r.data.data),
  });
}

export function useAdminDoctors(params = {}) {
  return useQuery({
    queryKey: ['adminDoctors', params],
    queryFn: () => api.get('/admin/doctors', { params }).then((r) => r.data.data),
  });
}

export function useFlaggedReviews(params = {}) {
  return useQuery({
    queryKey: ['flaggedReviews', params],
    queryFn: () => api.get('/admin/reviews/flagged', { params }).then((r) => r.data.data),
  });
}

// ── Generic mutation factory ───────────────────────────────────────────────────
export function useApiMutation(mutationFn, options = {}) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn,
    onSuccess: () => {
      if (options.invalidateKeys) {
        options.invalidateKeys.forEach((key) => queryClient.invalidateQueries({ queryKey: key }));
      }
    },
    ...options,
  });
}
