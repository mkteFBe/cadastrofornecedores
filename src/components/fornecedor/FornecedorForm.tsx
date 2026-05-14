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
import { Loader2, ArrowLeft, ArrowRight, Send } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('E-mail inválido');

const initialFormData: FornecedorFormData = {
  email: '',
  tipo_fornecedor: '',
  razao_social: '',
  ramo_atuacao: '',
  cnpj: '',
  telefone: '',
  regime_tributario: '',
  possui_iso_9001: '',
  iso_data_emissao: '',
  iso_data_validade: '',
  responsavel: '',
  auto_recebimento: '',
  auto_verificacao_qualidade: '',
  auto_produto_nao_conforme: '',
  auto_nao_conformidade_tratativa: '',
  auto_rastreabilidade: '',
  auto_controle_processo: '',
  auto_calibracao_maquinas: '',
  auto_eficacia_acoes_corretivas: '',
  auto_qualidade_operacional: '',
  auto_taxa_defeitos: '',
  auto_ambiente_expedicao: '',
  auto_expedicao_transporte: '',
};

export function FornecedorForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FornecedorFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [documentacoesUrl, setDocumentacoesUrl] = useState<string | null>(null);
  const [isoPdfUrl, setIsoPdfUrl] = useState<string | null>(null);

  const getSteps = () => {
    if (formData.possui_iso_9001 === 'SIM') {
      return ['Dados do fornecedor', 'Documentações', 'Regime tributário', 'ISO 9001', 'Responsável'];
    }
    return ['Dados do fornecedor', 'Documentações', 'Regime tributário', 'ISO 9001', 'Responsável', 'Autoavaliação'];
  };

  const STEPS = getSteps();
  const totalSteps = STEPS.length;

  const handleChange = (field: keyof FornecedorFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};
    switch (step) {
      case 1:
        if (!formData.email.trim()) {
          newErrors.email = 'E-mail é obrigatório';
        } else {
          try { emailSchema.parse(formData.email); } catch { newErrors.email = 'E-mail inválido'; }
        }
        if (!formData.tipo_fornecedor) newErrors.tipo_fornecedor = 'Selecione o tipo de fornecedor';
        if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
        break;
      case 2:
        if (!documentacoesUrl) newErrors.documentacoes = 'O upload do documento é obrigatório';
        break;
      case 3:
        if (!formData.regime_tributario) newErrors.regime_tributario = 'Selecione o regime tributário';
        break;
      case 4:
        if (!formData.possui_iso_9001) newErrors.possui_iso_9001 = 'Esta resposta é obrigatória';
        if (formData.possui_iso_9001 === 'SIM' && !isoPdfUrl) newErrors.iso_pdf = 'Envie o certificado ISO';
        break;
      case 5:
        break;
      case 6:
        if (formData.possui_iso_9001 === 'NÃO') {
          const autoFields = [
            'auto_recebimento', 'auto_verificacao_qualidade', 'auto_produto_nao_conforme',
            'auto_nao_conformidade_tratativa', 'auto_rastreabilidade', 'auto_controle_processo',
            'auto_calibracao_maquinas', 'auto_eficacia_acoes_corretivas', 'auto_qualidade_operacional',
            'auto_taxa_defeitos', 'auto_ambiente_expedicao', 'auto_expedicao_transporte',
          ] as const;
          autoFields.forEach((field) => {
            if (!formData[field]) newErrors[field] = 'Esta pergunta é obrigatória';
          });
        }
        break;
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
      setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    }
  };

  const handlePrev = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    validateStep(currentStep);
    setIsSubmitting(true);
    try {
      const insertData: Record<string, unknown> = {
        email: formData.email,
        tipo_fornecedor: formData.tipo_fornecedor,
        razao_social: formData.razao_social || null,
        ramo_atuacao: formData.ramo_atuacao || null,
        cnpj: formData.cnpj,
        telefone: formData.telefone || null,
        documentacoes_url: documentacoesUrl,
        regime_tributario: formData.regime_tributario,
        possui_iso_9001: formData.possui_iso_9001 === 'SIM',
        iso_9001_pdf_url: isoPdfUrl,
        iso_data_emissao: formData.iso_data_emissao || null,
        iso_data_validade: formData.iso_data_validade || null,
        responsavel: formData.responsavel || null,
        status: 'Pendente',
      };

      if (formData.possui_iso_9001 === 'NÃO') {
        insertData.auto_recebimento = parseInt(formData.auto_recebimento) || null;
        insertData.auto_verificacao_qualidade = parseInt(formData.auto_verificacao_qualidade) || null;
        insertData.auto_produto_nao_conforme = parseInt(formData.auto_produto_nao_conforme) || null;
        insertData.auto_nao_conformidade_tratativa = parseInt(formData.auto_nao_conformidade_tratativa) || null;
        insertData.auto_rastreabilidade = parseInt(formData.auto_rastreabilidade) || null;
        insertData.auto_controle_processo = parseInt(formData.auto_controle_processo) || null;
        insertData.auto_calibracao_maquinas = parseInt(formData.auto_calibracao_maquinas) || null;
        insertData.auto_eficacia_acoes_corretivas = parseInt(formData.auto_eficacia_acoes_corretivas) || null;
        insertData.auto_qualidade_operacional = parseInt(formData.auto_qualidade_operacional) || null;
        insertData.auto_taxa_defeitos = parseInt(formData.auto_taxa_defeitos) || null;
        insertData.auto_ambiente_expedicao = parseInt(formData.auto_ambiente_expedicao) || null;
        insertData.auto_expedicao_transporte = parseInt(formData.auto_expedicao_transporte) || null;
      }

      const { error, data } = await supabase.from('fornecedores').insert(insertData).select();
      if (error) throw error;
      console.log('Cadastro inserido:', data);
      setIsSubmitted(true);
      toast.success('Cadastro enviado com sucesso!');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erro ao enviar: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Tela de sucesso ─── */
  if (isSubmitted) {
    return (
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-2xl border shadow-sm p-8 text-center space-y-4">
          <div className="flex justify-center mb-2">
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-7 w-auto" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-foreground">Cadastro enviado com sucesso!</h2>
            <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
              Obrigado pelo preenchimento. Nossa equipe de compras irá analisar as informações
              e entrará em contato em breve pelo e-mail informado.
            </p>
          </div>
          <div className="pt-2 border-t text-xs text-muted-foreground">
            Dúvidas? Entre em contato:{' '}
            <a href="mailto:compras@filtrosbrasil.com.br" className="text-brand-navy font-medium hover:underline">
              compras@filtrosbrasil.com.br
            </a>
          </div>
        </div>
      </div>
    );
  }

  /* ─── Formulário ─── */
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="flex items-center gap-3 px-6 py-4 border-b">
          <img
            src="/logo-filtros-brasil.svg"
            alt="Filtros Brasil"
            className="h-7 w-auto"
          />
          <div className="border-l pl-3">
            <p className="text-xs text-muted-foreground">Cadastro de Fornecedores · Setor de Compras</p>
          </div>
        </div>
        <div className="px-6 py-5">
          <FormProgress currentStep={currentStep} totalSteps={totalSteps} steps={STEPS} />
        </div>
      </div>

      {/* Conteúdo da etapa */}
      <div className="bg-white rounded-xl border shadow-sm px-6 py-6 min-h-[320px]">
        {currentStep === 1 && (
          <StepDadosFornecedor formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 2 && (
          <StepDocumentacoes
            documentUrl={documentacoesUrl}
            onDocumentChange={setDocumentacoesUrl}
            errors={errors}
          />
        )}
        {currentStep === 3 && (
          <StepRegimeTributario formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 4 && (
          <StepISO
            formData={formData}
            onChange={handleChange}
            isoPdfUrl={isoPdfUrl}
            onIsoPdfChange={setIsoPdfUrl}
            errors={errors}
          />
        )}
        {currentStep === 5 && (
          <StepResponsavel formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 6 && formData.possui_iso_9001 === 'NÃO' && (
          <StepAutoavaliacao formData={formData} onChange={handleChange} errors={errors} />
        )}
      </div>

      {/* Navegação */}
      <div className="bg-white rounded-xl border shadow-sm px-6 py-4 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        <span className="text-xs text-muted-foreground">
          {currentStep} de {totalSteps}
        </span>

        {currentStep < totalSteps ? (
          <Button
            onClick={handleNext}
            className="flex items-center gap-2 bg-brand-navy hover:bg-brand-navy/90 text-white"
          >
            Próximo
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex items-center gap-2 bg-brand-red hover:bg-brand-red/90 text-white"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            Enviar cadastro
          </Button>
        )}
      </div>
    </div>
  );
}
