'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useRouter } from 'next/navigation';
import { Building2, User, ShieldAlert, Loader2 } from 'lucide-react';

interface CompanyAccess {
  role: 'admin' | 'employee';
  companies: {
    id: string;
    name: string;
  };
}

export default function SelectProfilePage() {
  const [loading, setLoading] = useState(true);
  const [isSuperadmin, setIsSuperadmin] = useState(false);
  const [adminCompanies, setAdminCompanies] = useState<CompanyAccess[]>([]);
  const [employeeCompanies, setEmployeeCompanies] = useState<CompanyAccess[]>([]);
  const router = useRouter();

  useEffect(() => {
    async function loadUserProfiles() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          router.push('/');
          return;
        }

        // 1. Verificar se é Superadmin
        const { data: profile } = await supabase
          .from('profiles')
          .select('system_role')
          .eq('id', user.id)
          .single();

        const superAdmin = profile?.system_role === 'superadmin';
        setIsSuperadmin(superAdmin);

        // 2. Buscar empresas associadas
        const { data: companiesData } = await supabase
          .from('company_users')
          .select('role, companies(id, name)')
          .eq('user_id', user.id);

        const companies = (companiesData as unknown as CompanyAccess[]) || [];
        
        const adminAccess = companies.filter(c => c.role === 'admin');
        const employeeAccess = companies.filter(c => c.role === 'employee');

        setAdminCompanies(adminAccess);
        setEmployeeCompanies(employeeAccess);

        // 3. Lógica de redirecionamento automático
        // Se só for empregado de uma empresa e não for superadmin nem admin de nada
        if (!superAdmin && adminAccess.length === 0 && employeeAccess.length === 1) {
          router.push(`/employee/${employeeAccess[0].companies.id}`);
          return;
        }

        setLoading(false);
      } catch (error) {
        console.error('Erro ao carregar perfis:', error);
        setLoading(false);
      }
    }

    loadUserProfiles();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold text-gray-900">Selecionar Perfil</h2>
          <p className="mt-2 text-gray-600">Escolha como pretende entrar no sistema hoje</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 mt-8">
          
          {/* Opção Superadmin */}
          {isSuperadmin && (
            <button
              onClick={() => router.push('/superadmin')}
              className="bg-white p-6 rounded-xl shadow-sm border border-red-100 hover:border-red-300 hover:shadow-md transition-all text-left group"
            >
              <ShieldAlert className="w-8 h-8 text-red-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900">Superadmin</h3>
              <p className="text-sm text-gray-500 mt-1">Gestão global do sistema</p>
            </button>
          )}

          {/* Opções de Admin de Empresas */}
          {adminCompanies.map((access) => (
            <button
              key={`admin-${access.companies.id}`}
              onClick={() => router.push(`/admin/${access.companies.id}`)}
              className="bg-white p-6 rounded-xl shadow-sm border border-blue-100 hover:border-blue-300 hover:shadow-md transition-all text-left group"
            >
              <Building2 className="w-8 h-8 text-blue-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900">{access.companies.name}</h3>
              <p className="text-sm text-blue-600 font-medium mt-1">Modo Empregador</p>
            </button>
          ))}

          {/* Opções de Empregado */}
          {employeeCompanies.map((access) => (
            <button
              key={`emp-${access.companies.id}`}
              onClick={() => router.push(`/employee/${access.companies.id}`)}
              className="bg-white p-6 rounded-xl shadow-sm border border-green-100 hover:border-green-300 hover:shadow-md transition-all text-left group"
            >
              <User className="w-8 h-8 text-green-500 mb-4 group-hover:scale-110 transition-transform" />
              <h3 className="text-lg font-semibold text-gray-900">{access.companies.name}</h3>
              <p className="text-sm text-green-600 font-medium mt-1">Modo Empregado</p>
            </button>
          ))}

        </div>
      </div>
    </div>
  );
}