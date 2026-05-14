import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormProgress } from './FormProgress';
import { StepDadosFornecedor } from './StepDadosFornecedor';
import { StepDocumentacoes } from './StepDocumentacoes';
import { StepRegimeTributario } from './StepRegimeTributario';
import { StepISO } from './StepISO';
import { StepResponsavel } from './StepResponsavel';
import { StepAutoavaliacao } from './StepAutoavaliacao';
import { FornecedorFormData } from '@/types/fornecedor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, ArrowLeft, ArrowRight, Send, CheckCircle2 } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('E-mail inválido');

const initialFormData: FornecedorFormData = {
  email: '', tipo_fornecedor: '', razao_social: '', ramo_atuacao: '', cnpj: '', telefone: '',
  regime_tributario: '', possui_iso_9001: '', iso_data_emissao: '', iso_data_validade: '',
  responsavel: '', auto_recebimento: '', auto_verificacao_qualidade: '', auto_produto_nao_conforme: '',
  auto_nao_conformidade_tratativa: '', auto_rastreabilidade: '', auto_controle_processo: '',
  auto_calibracao_maquinas: '', auto_eficacia_acoes_corretivas: '', auto_qualidade_operacional: '',
  auto_taxa_defeitos: '', auto_ambiente_expedicao: '', auto_expedicao_transporte: '',
};

export function FornecedorForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FornecedorFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentacoesUrl, setDocumentacoesUrl] = useState<string | null>(null);
  const [isoPdfUrl, setIsoPdfUrl] = useState<string | null>(null);

  const getSteps = () => formData.possui_iso_9001 === 'SIM'
    ? ['Dados', 'Documentos', 'Regime Fiscal', 'ISO 9001', 'Responsável']
    : ['Dados', 'Documentos', 'Regime Fiscal', 'ISO 9001', 'Responsável', 'Autoavaliação'];

  const STEPS = getSteps();
  const totalSteps = STEPS.length;

  const handleChange = (field: keyof FornecedorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
        else { try { emailSchema.parse(formData.email); } catch { newErrors.email = 'E-mail inválido'; } }
        if (!formData.tipo_fornecedor) newErrors.tipo_fornecedor = 'Selecione o tipo';
        if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
        break;
      case 2: if (!documentacoesUrl) newErrors.documentacoes = 'Upload obrigatório'; break;
      case 3: if (!formData.regime_tributario) newErrors.regime_tributario = 'Selecione o regime'; break;
      case 4:
        if (!formData.possui_iso_9001) newErrors.possui_iso_9001 = 'Resposta obrigatória';
        if (formData.possui_iso_9001 === 'SIM' && !isoPdfUrl) newErrors.iso_pdf = 'Envie o certificado ISO';
        break;
      case 6:
        if (formData.possui_iso_9001 === 'NÃO') {
          const fields = ['auto_recebimento','auto_verificacao_qualidade','auto_produto_nao_conforme','auto_nao_conformidade_tratativa','auto_rastreabilidade','auto_controle_processo','auto_calibracao_maquinas','auto_eficacia_acoes_corretivas','auto_qualidade_operacional','auto_taxa_defeitos','auto_ambiente_expedicao','auto_expedicao_transporte'] as const;
          fields.forEach(f => { if (!formData[f]) newErrors[f] = 'Obrigatório'; });
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentStep(p => Math.min(p + 1, totalSteps)); }
  };
  const handlePrev = () => { window.scrollTo({ top: 0, behavior: 'smooth' }); setCurrentStep(p => Math.max(p - 1, 1)); };

  const handleSubmit = async () => {
    validateStep(currentStep);
    setIsSubmitting(true);
    try {
      const insertData: Record<string, unknown> = {
        email: formData.email, tipo_fornecedor: formData.tipo_fornecedor,
        razao_social: formData.razao_social || null, ramo_atuacao: formData.ramo_atuacao || null,
        cnpj: formData.cnpj, telefone: formData.telefone || null,
        documentacoes_url: documentacoesUrl, regime_tributario: formData.regime_tributario,
        possui_iso_9001: formData.possui_iso_9001 === 'SIM', iso_9001_pdf_url: isoPdfUrl,
        iso_data_emissao: formData.iso_data_emissao || null, iso_data_validade: formData.iso_data_validade || null,
        responsavel: formData.responsavel || null, status: 'Pendente',
      };
      if (formData.possui_iso_9001 === 'NÃO') {
        ['auto_recebimento','auto_verificacao_qualidade','auto_produto_nao_conforme','auto_nao_conformidade_tratativa','auto_rastreabilidade','auto_controle_processo','auto_calibracao_maquinas','auto_eficacia_acoes_corretivas','auto_qualidade_operacional','auto_taxa_defeitos','auto_ambiente_expedicao','auto_expedicao_transporte'].forEach(f => {
          insertData[f] = parseInt(formData[f as keyof FornecedorFormData] as string) || null;
        });
      }
      const { error } = await supabase.from('fornecedores').insert(insertData).select();
      if (error) throw error;
      setIsSubmitted(true);
      toast.success('Cadastro enviado com sucesso!');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erro ao enviar: ${err?.message || 'Tente novamente.'}`);
    } finally { setIsSubmitting(false); }
  };

  if (isSubmitted) return (
    <div className="max-w-lg mx-auto">
      <div className="bg-white rounded-lg p-10 text-center space-y-5" style={{ boxShadow: "var(--fb-shadow-floating)", border: "1px solid var(--fb-mid-gray)" }}>
        <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto" style={{ background: "rgba(40,167,69,0.1)" }}>
          <CheckCircle2 className="w-8 h-8" style={{ color: "var(--fb-success)" }} />
        </div>
        <div>
          <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-6 w-auto mx-auto mb-4" />
          <h2 className="font-bold uppercase tracking-tight mb-2" style={{ fontSize: "18px", color: "var(--fb-blue)" }}>
            Cadastro Enviado com Sucesso!
          </h2>
          <p className="text-sm leading-relaxed" style={{ color: "var(--fb-slate-gray)" }}>
            Obrigado. Nossa equipe de compras irá analisar as informações e entrará em contato em breve pelo e-mail informado.
          </p>
        </div>
        <div className="pt-4 text-xs" style={{ borderTop: "1px solid var(--fb-mid-gray)", color: "var(--fb-slate-gray)" }}>
          Dúvidas?{" "}
          <a href="mailto:compras@filtrosbrasil.com.br" className="font-semibold hover:underline" style={{ color: "var(--fb-blue)" }}>
            compras@filtrosbrasil.com.br
          </a>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      {/* Header */}
      <div className="bg-white rounded-lg" style={{ boxShadow: "var(--fb-shadow-sm)", border: "1px solid var(--fb-mid-gray)" }}>
        <div className="flex items-center gap-4 px-6 py-4" style={{ borderBottom: "1px solid var(--fb-mid-gray)" }}>
          <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-7 w-auto" />
          <div style={{ borderLeft: "1px solid var(--fb-mid-gray)" }} className="pl-4">
            <p className="text-[10px] font-semibold uppercase tracking-widest" style={{ color: "var(--fb-slate-gray)" }}>
              Cadastro de Fornecedores · Setor de Compras
            </p>
          </div>
        </div>
        <div className="px-6 py-5">
          <FormProgress currentStep={currentStep} totalSteps={totalSteps} steps={STEPS} />
        </div>
      </div>

      {/* Conteúdo */}
      <div className="bg-white rounded-lg px-6 py-6 min-h-[300px]" style={{ boxShadow: "var(--fb-shadow-sm)", border: "1px solid var(--fb-mid-gray)" }}>
        {currentStep === 1 && <StepDadosFornecedor formData={formData} onChange={handleChange} errors={errors} />}
        {currentStep === 2 && <StepDocumentacoes documentUrl={documentacoesUrl} onDocumentChange={setDocumentacoesUrl} errors={errors} />}
        {currentStep === 3 && <StepRegimeTributario formData={formData} onChange={handleChange} errors={errors} />}
        {currentStep === 4 && <StepISO formData={formData} onChange={handleChange} isoPdfUrl={isoPdfUrl} onIsoPdfChange={setIsoPdfUrl} errors={errors} />}
        {currentStep === 5 && <StepResponsavel formData={formData} onChange={handleChange} errors={errors} />}
        {currentStep === 6 && formData.possui_iso_9001 === 'NÃO' && <StepAutoavaliacao formData={formData} onChange={handleChange} errors={errors} />}
      </div>

      {/* Navegação */}
      <div className="bg-white rounded-lg px-6 py-4 flex items-center justify-between" style={{ boxShadow: "var(--fb-shadow-sm)", border: "1px solid var(--fb-mid-gray)" }}>
        <button
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider transition-opacity disabled:opacity-30"
          style={{ color: "var(--fb-slate-gray)" }}
        >
          <ArrowLeft className="w-4 h-4" /> Anterior
        </button>

        <span className="text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--fb-slate-gray)" }}>
          {currentStep} de {totalSteps}
        </span>

        {currentStep < totalSteps ? (
          <button
            onClick={handleNext}
            className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 transition-all"
            style={{ background: "var(--fb-blue)", borderRadius: "9999px" }}
          >
            Próximo <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 text-white text-xs font-semibold uppercase tracking-widest px-6 py-2.5 transition-all disabled:opacity-60"
            style={{ background: "var(--fb-red)", borderRadius: "9999px" }}
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
            Enviar Cadastro
          </button>
        )}
      </div>
    </div>
  );
}
