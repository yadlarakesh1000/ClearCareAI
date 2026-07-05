import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useQueryClient } from '@tanstack/react-query';
import api from '../api/axiosConfig';
import {
  useApiMutation,
  useAppointment,
  useConsultationByAppointment,
} from '../hooks/useApi';
import { formatDate, formatTime } from '../utils/format';
import LoadingSpinner from '../components/common/LoadingSpinner';
import ErrorMessage from '../components/common/ErrorMessage';

function PatientSummary({ patientName, date, startTime, endTime }) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-5">
      <h2 className="text-sm font-semibold text-gray-500">Patient</h2>
      <p className="text-lg font-semibold text-gray-900 mt-0.5">{patientName}</p>
      {date && (
        <p className="text-sm text-gray-500 mt-1">
          {formatDate(date)}
          {startTime ? ` • ${formatTime(startTime)} – ${formatTime(endTime)}` : ''}
        </p>
      )}
    </div>
  );
}

export default function ConsultationPage() {
  const { appointmentId } = useParams();
  const queryClient = useQueryClient();

  const consultationKey = ['consultation', 'appointment', appointmentId];

  const { data: appointment } = useAppointment(appointmentId);

  const {
    data: consultation,
    isLoading,
    isError,
    error,
    refetch,
  } = useConsultationByAppointment(appointmentId);

  const notFound = isError && error?.response?.status === 404;

  const startMutation = useApiMutation(
    () => api.post('/consultations', { appointmentId: Number(appointmentId) }).then((r) => r.data.data),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: consultationKey }) }
  );

  const saveMutation = useApiMutation(
    (payload) => api.put(`/consultations/${consultation.id}`, payload).then((r) => r.data.data),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: consultationKey }) }
  );

  const completeMutation = useApiMutation(
    () => api.put(`/consultations/${consultation.id}/complete`).then((r) => r.data.data),
    { onSuccess: () => queryClient.invalidateQueries({ queryKey: consultationKey }) }
  );

  const triggerMutation = useApiMutation((consultationId) =>
    api.post('/voice-reviews/trigger', { consultationId }).then((r) => r.data)
  );

  if (isLoading) return <LoadingSpinner message="Loading consultation..." />;

  // A real error (not the expected 404 "not started yet").
  if (isError && !notFound) {
    return (
      <div className="p-6 md:p-8 max-w-2xl mx-auto">
        <ErrorMessage
          message={error?.response?.data?.message || error?.message}
          onRetry={refetch}
        />
      </div>
    );
  }

  const patientName = consultation?.patientName || appointment?.patientName || 'Patient';
  const startErrorMsg =
    startMutation.error?.response?.data?.message || startMutation.error?.message;

  return (
    <div className="p-6 md:p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Consultation</h1>
      </div>

      <PatientSummary
        patientName={patientName}
        date={appointment?.appointmentDate}
        startTime={appointment?.startTime}
        endTime={appointment?.endTime}
      />

      {/* No consultation yet → start it */}
      {notFound && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-center">
          <p className="text-gray-600 text-sm">
            No consultation has been started for this appointment yet.
          </p>
          {startMutation.isError && (
            <div className="mt-3 text-left">
              <ErrorMessage message={startErrorMsg} />
            </div>
          )}
          <button
            onClick={() => startMutation.mutate()}
            disabled={startMutation.isPending}
            className="mt-4 bg-blue-600 text-white font-medium px-6 py-2.5 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {startMutation.isPending ? 'Starting...' : 'Start Consultation'}
          </button>
        </div>
      )}

      {/* IN_PROGRESS → editable form */}
      {consultation && consultation.status === 'IN_PROGRESS' && (
        <ConsultationEditor
          consultation={consultation}
          saveMutation={saveMutation}
          completeMutation={completeMutation}
        />
      )}

      {/* COMPLETED → read-only + voice review info */}
      {consultation && consultation.status === 'COMPLETED' && (
        <CompletedView consultation={consultation} triggerMutation={triggerMutation} />
      )}
    </div>
  );
}

function ConsultationEditor({ consultation, saveMutation, completeMutation }) {
  const {
    register,
    handleSubmit,
    getValues,
  } = useForm({
    defaultValues: {
      diagnosis: consultation.diagnosis ?? '',
      prescription: consultation.prescription ?? '',
      notes: consultation.notes ?? '',
    },
  });

  const payloadFrom = (values) => ({
    appointmentId: consultation.appointmentId,
    diagnosis: values.diagnosis || null,
    prescription: values.prescription || null,
    notes: values.notes || null,
  });

  const onSave = (values) => saveMutation.mutate(payloadFrom(values));

  // Persist current edits before completing so nothing typed is lost.
  const onComplete = () => {
    saveMutation.mutate(payloadFrom(getValues()), {
      onSuccess: () => completeMutation.mutate(),
    });
  };

  const saveErrorMsg =
    saveMutation.error?.response?.data?.message || saveMutation.error?.message;
  const completeErrorMsg =
    completeMutation.error?.response?.data?.message || completeMutation.error?.message;
  const busy = saveMutation.isPending || completeMutation.isPending;

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
      <h2 className="text-lg font-semibold text-gray-900">Consultation Notes</h2>

      {saveMutation.isSuccess && !completeMutation.isPending && (
        <div className="mt-3 rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          Saved.
        </div>
      )}
      {saveMutation.isError && (
        <div className="mt-3">
          <ErrorMessage message={saveErrorMsg} />
        </div>
      )}
      {completeMutation.isError && (
        <div className="mt-3">
          <ErrorMessage message={completeErrorMsg} />
        </div>
      )}

      <form onSubmit={handleSubmit(onSave)} className="mt-4 space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            {...register('diagnosis')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Prescription</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            {...register('prescription')}
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
          <textarea
            rows={3}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none resize-none"
            {...register('notes')}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="submit"
            disabled={busy}
            className="text-sm font-medium text-blue-700 border border-blue-200 px-5 py-2 rounded-lg hover:bg-blue-50 transition-colors disabled:opacity-50"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save'}
          </button>
          <button
            type="button"
            onClick={onComplete}
            disabled={busy}
            className="text-sm font-medium text-white bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
          >
            {completeMutation.isPending ? 'Completing...' : 'Complete Consultation'}
          </button>
        </div>
      </form>
    </div>
  );
}

function CompletedView({ consultation, triggerMutation }) {
  const Field = ({ label, value }) => (
    <div>
      <h4 className="text-sm font-semibold text-gray-700">{label}</h4>
      <p className="text-sm text-gray-600 mt-1 whitespace-pre-wrap">
        {value || <span className="text-gray-400">Not recorded</span>}
      </p>
    </div>
  );

  const triggerData = triggerMutation.data?.data;
  const triggerErrorMsg =
    triggerMutation.error?.response?.data?.message || triggerMutation.error?.message;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">Consultation Summary</h2>
          <span className="text-xs font-medium px-2 py-0.5 rounded bg-blue-50 text-blue-700">
            COMPLETED
          </span>
        </div>
        <div className="mt-4 space-y-4">
          <Field label="Diagnosis" value={consultation.diagnosis} />
          <Field label="Prescription" value={consultation.prescription} />
          <Field label="Notes" value={consultation.notes} />
        </div>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-5">
        <p className="text-sm text-blue-800">
          A voice review call will be scheduled automatically for this patient.
        </p>
        <p className="text-xs text-blue-700 mt-1">
          Optional: place the call now to skip the waiting period (useful for demos).
        </p>

        {triggerMutation.isSuccess && (
          <div className="mt-3 rounded-lg border border-green-200 bg-green-100 p-3 text-sm text-green-800">
            {triggerMutation.data?.message || 'Voice review call requested.'}
            {triggerData?.status ? ` (status: ${triggerData.status})` : ''}
          </div>
        )}
        {triggerMutation.isError && (
          <div className="mt-3">
            <ErrorMessage message={triggerErrorMsg} />
          </div>
        )}

        <button
          onClick={() => triggerMutation.mutate(consultation.id)}
          disabled={triggerMutation.isPending || triggerMutation.isSuccess}
          className="mt-4 text-sm font-medium text-white bg-blue-600 px-5 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60"
        >
          {triggerMutation.isPending ? 'Calling...' : 'Call Now'}
        </button>
      </div>
    </div>
  );
}
