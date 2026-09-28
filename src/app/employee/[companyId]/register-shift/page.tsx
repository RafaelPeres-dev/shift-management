// src/app/employee/[companyId]/register-shift/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Save, ArrowLeft, Clock } from 'lucide-react';
import Link from 'next/link';

interface CustomField {
  id: string;
  field_name: string;
  field_type: 'text' | 'number' | 'boolean';
  is_required: boolean;
}

export default function RegisterShiftPage({ params }: { params: { companyId: string } }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [customFields, setCustomFields] = useState<CustomField[]>([]);
  
  // Campos Base
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [notes, setNotes] = useState('');
  
  // Valores dos campos dinâmicos
  const [customValues, setCustomValues] = useState<Record<string, string>>({});

  useEffect(() => {
    async function loadCustomFields() {
      const { data } = await supabase
        .from('company_custom_fields')
        .select('*')
        .eq('company_id', params.companyId);
      
      if (data) setCustomFields(data);
    }
    loadCustomFields();
  }, [params.companyId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Não autenticado');

      // 1. Criar o Turno (Shift)
      const { data: shift, error: shiftError } = await supabase
        .from('shifts')
        .insert({
          company_id: params.companyId,
          user_id: user.id,
          start_time: new Date(startTime).toISOString(),
          end_time: endTime ? new Date(endTime).toISOString() : null,
          notes: notes,
          status: 'pending'
        })
        .select()
        .single();

      if (shiftError) throw shiftError;

      // 2. Inserir os campos customizados, se existirem
      if (customFields.length > 0 && shift) {
        const customValuesToInsert = customFields.map(field => ({
          shift_id: shift.id,
          field_id: field.id,
          value: customValues[field.id] || ''
        }));

        const { error: customError } = await supabase
          .from('shift_custom_values')
          .insert(customValuesToInsert);

        if (customError) throw customError;
      }

      router.push(`/employee/${params.companyId}`);
    } catch (error) {
      console.error('Erro ao registar turno:', error);
      alert('Erro ao registar o turno.');
    } finally {
      setLoading(false);
    }
  };

  const handleCustomValueChange = (fieldId: string, value: string) => {
    setCustomValues(prev => ({ ...prev, [fieldId]: value }));
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center space-x-4">
        <Link href={`/employee/${params.companyId}`} className="text-gray-500 hover:text-blue-600">
          <ArrowLeft className="w-6 h-6" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Registar Turno</h1>
      </div>

      <div className="bg-white p-6 md:p-8 rounded-xl shadow-sm border border-gray-100">
        <form onSubmit={handleSubmit} className="space-y-6">
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de Início *</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Data e Hora de Fim</label>
              <input
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notas / Ocorrências</label>
            <textarea
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
              placeholder="Alguma nota importante sobre o turno?"
            />
          </div>

          {/* Renderização Dinâmica dos Campos Extra da Empresa */}
          {customFields.length > 0 && (
            <div className="pt-4 border-t border-gray-200 space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Campos Adicionais da Empresa</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {customFields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.field_name} {field.is_required && '*'}
                    </label>
                    {field.field_type === 'boolean' ? (
                      <select
                        required={field.is_required}
                        value={customValues[field.id] || ''}
                        onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                      >
                        <option value="">Selecione...</option>
                        <option value="true">Sim</option>
                        <option value="false">Não</option>
                      </select>
                    ) : (
                      <input
                        type={field.field_type === 'number' ? 'number' : 'text'}
                        required={field.is_required}
                        value={customValues[field.id] || ''}
                        onChange={(e) => handleCustomValueChange(field.id, e.target.value)}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 text-black"
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300 font-medium text-lg transition-colors"
            >
              {loading ? 'A Guardar...' : (
                <>
                  <Save className="w-5 h-5 mr-2" />
                  Guardar Turno
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}