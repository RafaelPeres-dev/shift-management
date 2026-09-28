// src/app/employee/[companyId]/reports/page.tsx
'use client';

import { useState } from 'react';
import { Filter, FileText, ArrowLeft, Calendar as CalendarIcon } from 'lucide-react';
import Link from 'next/link';
import { generateEmployeeReport } from '@/lib/generatePDF';

export default function ReportsPage({ params }: { params: { companyId: string } }) {
  const [showFilters, setShowFilters] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const handleGeneratePDF = () => {
    if (!startDate) {
      alert("Por favor, selecione pelo menos a Data de Início.");
      return;
    }

    const start = new Date(startDate);
    let end = endDate ? new Date(endDate) : new Date(start.getFullYear(), start.getMonth() + 1, 0);

    // Validação de limite máximo de 3 meses
    const monthsDiff = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
    if (monthsDiff > 2) {
      alert("O período máximo para geração de relatório é de 3 meses.");
      return;
    }

    // SIMULAÇÃO: Aqui faríamos a chamada à BD Supabase para buscar os turnos entre `start` e `end`.
    // Vamos injetar dados falsos baseados na tua imagem para o PDF.
    const mockShifts = [
      { day: 24, std: 8.92, nacht: 5.33, bonus: 0.53, total: 9.45 },
      { day: 25, std: 9.25, nacht: 5.17, bonus: 0.52, total: 9.77 },
      { day: 27, std: 8.33, nacht: 5.33, bonus: 0.53, total: 8.87 },
      { day: 28, std: 9.50, nacht: 5.50, bonus: 0.55, total: 10.05 },
    ];

    const mockSummary = {
      total: 53.98,
      target: 207,
      balance: -153.02
    };

    const monthName = start.toLocaleString('pt-PT', { month: 'long' });
    const year = start.getFullYear().toString();

    // Chama a função que cria o PDF
    generateEmployeeReport("Rafael", monthName, year, mockShifts, mockSummary);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <Link href={`/employee/${params.companyId}`} className="text-gray-500 hover:text-blue-600">
            <ArrowLeft className="w-6 h-6" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Relatório de Horas</h1>
        </div>
        
        <div className="flex space-x-3">
          <button 
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
          >
            <Filter className="w-4 h-4 mr-2" /> Filtros
          </button>
          <button 
            onClick={handleGeneratePDF}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <FileText className="w-4 h-4 mr-2" /> Gerar PDF
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Início (Obrigatório)</label>
            <input 
              type="date" 
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Data Fim (Opcional)</label>
            <input 
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md text-black"
              min={startDate}
            />
          </div>
          <div className="text-sm text-gray-500 pb-2">
            * Se não preencher o fim, será exportado apenas o mês de início. Max: 3 meses.
          </div>
        </div>
      )}
      
      {/* (O carrossel de turnos da Etapa 5 mantém-se inalterado aqui abaixo) */}
    </div>
  );
}