// src/app/employee/[companyId]/page.tsx
'use client';

import { use, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Clock, Calendar, CheckCircle, AlertCircle, PlusCircle, FileText, Map } from 'lucide-react';
import Link from 'next/link';

interface DashboardData {
  companyName: string;
  helperActive: boolean;
  dailyHoursGoal: number;
  currentMonthHours: number;
  lastMonthHours: number;
}

export default function EmployeeDashboard({ params }: { params: Promise<{ companyId: string }> }) {
  const { companyId } = use(params);
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboard() {
      // 1. Obter dados da empresa
      const { data: company } = await supabase
        .from('companies')
        .select('name, helper_active, daily_hours_goal')
        .eq('id', companyId)
        .single();

      // Aqui faríamos a query real à tabela `shifts` para somar as horas.
      // Para já, inserimos valores simulados (mock) para desenhar a interface.
      // Na fase de backend avançado, substituímos pela soma real.
      const mockCurrentHours = 45.5; 
      const mockLastMonthHours = 160.0;
      
      setData({
        companyName: company?.name || 'Empresa',
        helperActive: company?.helper_active || false,
        dailyHoursGoal: company?.daily_hours_goal || 8,
        currentMonthHours: mockCurrentHours,
        lastMonthHours: mockLastMonthHours,
      });
      setLoading(false);
    }
    loadDashboard();
  }, [companyId]);

  if (loading) return <div className="text-center py-10">A carregar estatísticas...</div>;
  if (!data) return <div>Erro ao carregar dados.</div>;

  // Cálculo básico de metas (assumindo 22 dias úteis como exemplo padrão)
  const monthlyGoal = data.dailyHoursGoal * 22; 
  const hoursLeft = Math.max(0, monthlyGoal - data.currentMonthHours);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Visão Geral - {data.companyName}</h1>
        <p className="text-gray-500 mt-1">Resumo das tuas horas de trabalho</p>
      </div>

      {/* Cards de Estatísticas */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        
        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-blue-50 rounded-md p-3">
              <Clock className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Mês Atual</dt>
              <dd className="text-2xl font-semibold text-gray-900">{data.currentMonthHours}h</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-gray-50 rounded-md p-3">
              <Calendar className="h-6 w-6 text-gray-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Mês Passado</dt>
              <dd className="text-2xl font-semibold text-gray-900">{data.lastMonthHours}h</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-yellow-50 rounded-md p-3">
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Meta Mensal</dt>
              <dd className="text-2xl font-semibold text-gray-900">{monthlyGoal}h</dd>
            </div>
          </div>
        </div>

        <div className="bg-white overflow-hidden shadow-sm rounded-xl border border-gray-100 p-5">
          <div className="flex items-center">
            <div className="flex-shrink-0 bg-green-50 rounded-md p-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4 w-0 flex-1">
              <dt className="text-sm font-medium text-gray-500 truncate">Faltam para Meta</dt>
              <dd className="text-2xl font-semibold text-gray-900">{hoursLeft}h</dd>
            </div>
          </div>
        </div>

      </div>

      {/* Botões de Ação */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 mt-8">
        <Link href={`/employee/${companyId}/register-shift`}
          className="flex flex-col items-center justify-center p-8 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-md transition-colors"
        >
          <PlusCircle className="w-10 h-10 mb-3" />
          <span className="text-lg font-semibold">Registar Turno</span>
        </Link>

        <Link href={`/employee/${companyId}/reports`}
          className="flex flex-col items-center justify-center p-8 bg-white border-2 border-gray-200 hover:border-gray-300 hover:bg-gray-50 text-gray-800 rounded-xl transition-colors"
        >
          <FileText className="w-10 h-10 mb-3 text-gray-500" />
          <span className="text-lg font-semibold">Relatórios e PDF</span>
        </Link>
      </div>

      {/* Botão Hour Helper Condicional */}
      {data.helperActive && (
        <div className="mt-4">
          <Link href={`/employee/${companyId}/hour-helper`}
            className="flex items-center justify-center w-full p-6 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-xl shadow-md transition-all"
          >
            <Map className="w-8 h-8 mr-3" />
            <span className="text-xl font-bold">Hour Helper (Rotas)</span>
          </Link>
        </div>
      )}
      
    </div>
  );
}