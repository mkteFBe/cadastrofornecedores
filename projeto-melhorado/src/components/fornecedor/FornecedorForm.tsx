import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { FormProgress } from './FormProgress';
import { StepDadosFornecedor } from './StepDadosFornecedor';
import { StepDocumentacoes } from './StepDocumentacoes';
import { StepRegimeTributario } from './StepRegimeTributario';
import { StepISO } from './StepISO';
import { StepResponsavel } from './StepResponsavel';
import { StepAutoavaliacao } from './StepAutoavaliacao';
import { StepAceite } from './StepAceite';
import { FornecedorFormData } from '@/types/fornecedor';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { Loader2, CheckCircle2, ArrowRight, ArrowLeft } from 'lucide-react';
import { z } from 'zod';

const emailSchema = z.string().email('E-mail inválido');

const initialFormData: FornecedorFormData = {
  email: '', tipo_fornecedor: '', razao_social: '', ramo_atuacao: '',
  cnpj: '', telefone: '', regime_tributario: '', possui_iso_9001: '',
  iso_data_emissao: '', iso_data_validade: '', responsavel: '',
  auto_recebimento: '', auto_verificacao_qualidade: '', auto_produto_nao_conforme: '',
  auto_nao_conformidade_tratativa: '', auto_rastreabilidade: '', auto_controle_processo: '',
  auto_calibracao_maquinas: '', auto_eficacia_acoes_corretivas: '', auto_qualidade_operacional: '',
  auto_taxa_defeitos: '', auto_ambiente_expedicao: '', auto_expedicao_transporte: ''
};

interface DocUrls {
  contrato_social: string | null;
  alvara: string | null;
  certidao_federal: string | null;
  certidao_estadual: string | null;
  outros: string | null;
}

export function FornecedorForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<FornecedorFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isoPdfUrl, setIsoPdfUrl] = useState<string | null>(null);
  const [aceite, setAceite] = useState(false);
  const [docUrls, setDocUrls] = useState<DocUrls>({
    contrato_social: null, alvara: null,
    certidao_federal: null, certidao_estadual: null, outros: null,
  });

  const getSteps = () => {
    const base = ['Dados', 'Documentos', 'Regime', 'ISO 9001', 'Responsável'];
    if (formData.possui_iso_9001 === 'NÃO') base.push('Autoavaliação');
    base.push('Declaração');
    return base;
  };

  const STEPS = getSteps();
  const totalSteps = STEPS.length;

  const handleChange = (field: keyof FornecedorFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors(prev => { const e = { ...prev }; delete e[field]; return e; });
  };

  const handleDocChange = (field: keyof DocUrls, url: string | null) => {
    setDocUrls(prev => ({ ...prev, [field]: url }));
    if (errors[`doc_${field}`]) setErrors(prev => { const e = { ...prev }; delete e[`doc_${field}`]; return e; });
  };

  const validateStep = (step: number): boolean => {
    const newErrors: Record<string, string> = {};

    // Descobre qual conteúdo está no step atual
    const hasAuto = formData.possui_iso_9001 === 'NÃO';
    // step map: 1=Dados, 2=Docs, 3=Regime, 4=ISO, 5=Responsável, 6=Auto(se NÃO)/Aceite, 7=Aceite(se NÃO)
    const aceiteStep = hasAuto ? 7 : 6;
    const autoStep = 6;

    if (step === 1) {
      if (!formData.email.trim()) newErrors.email = 'E-mail é obrigatório';
      else { try { emailSchema.parse(formData.email); } catch { newErrors.email = 'E-mail inválido'; } }
      if (!formData.tipo_fornecedor) newErrors.tipo_fornecedor = 'Tipo de fornecedor é obrigatório';
      if (!formData.cnpj.trim()) newErrors.cnpj = 'CNPJ é obrigatório';
    }

    if (step === 2) {
      if (!docUrls.contrato_social) newErrors.doc_contrato_social = 'Contrato Social é obrigatório';
      if (!docUrls.alvara) newErrors.doc_alvara = 'Alvará de Funcionamento é obrigatório';
      if (!docUrls.certidao_federal) newErrors.doc_certidao_federal = 'Certidão Federal é obrigatória';
    }

    if (step === 3) {
      if (!formData.regime_tributario) newErrors.regime_tributario = 'Regime tributário é obrigatório';
    }

    if (step === 4) {
      if (!formData.possui_iso_9001) newErrors.possui_iso_9001 = 'Esta pergunta é obrigatória';
      if (formData.possui_iso_9001 === 'SIM' && !isoPdfUrl) newErrors.iso_pdf = 'Upload do certificado ISO é obrigatório';
    }

    if (hasAuto && step === autoStep) {
      const autoFields = [
        'auto_recebimento','auto_verificacao_qualidade','auto_produto_nao_conforme',
        'auto_nao_conformidade_tratativa','auto_rastreabilidade','auto_controle_processo',
        'auto_calibracao_maquinas','auto_eficacia_acoes_corretivas','auto_qualidade_operacional',
        'auto_taxa_defeitos','auto_ambiente_expedicao','auto_expedicao_transporte',
      ] as const;
      autoFields.forEach(f => { if (!formData[f]) newErrors[f] = 'Resposta obrigatória'; });
    }

    if (step === aceiteStep) {
      if (!aceite) newErrors.aceite = 'Você precisa aceitar a declaração para enviar o cadastro';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => { if (validateStep(currentStep)) setCurrentStep(p => Math.min(p + 1, totalSteps)); };
  const handlePrev = () => setCurrentStep(p => Math.max(p - 1, 1));

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    setIsSubmitting(true);
    try {
      // Captura IP do cliente (best-effort, pode ser IPv6/NAT)
      let clientIp = 'não disponível';
      try {
        const r = await fetch('https://api.ipify.org?format=json');
        const d = await r.json();
        clientIp = d.ip ?? 'não disponível';
      } catch { /* ignora */ }

      const now = new Date().toISOString();

      const insertData: Record<string, unknown> = {
        email: formData.email,
        tipo_fornecedor: formData.tipo_fornecedor,
        razao_social: formData.razao_social || null,
        ramo_atuacao: formData.ramo_atuacao || null,
        cnpj: formData.cnpj,
        telefone: formData.telefone || null,
        // Documentos individualizados
        doc_contrato_social_url: docUrls.contrato_social,
        doc_alvara_url: docUrls.alvara,
        doc_certidao_federal_url: docUrls.certidao_federal,
        doc_certidao_estadual_url: docUrls.certidao_estadual,
        doc_outros_url: docUrls.outros,
        regime_tributario: formData.regime_tributario,
        possui_iso_9001: formData.possui_iso_9001 === 'SIM',
        iso_9001_pdf_url: isoPdfUrl,
        iso_data_emissao: formData.iso_data_emissao || null,
        iso_data_validade: formData.iso_data_validade || null,
        responsavel: formData.responsavel || null,
        // Aceite formal
        aceite_declaracao: true,
        aceite_ip: clientIp,
        aceite_timestamp: now,
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

      const { error } = await supabase.from('fornecedores').insert(insertData).select();
      if (error) throw error;
      setIsSubmitted(true);
      toast.success('Cadastro enviado com sucesso!');
    } catch (error: unknown) {
      const err = error as { message?: string };
      toast.error(`Erro ao enviar: ${err?.message || 'Tente novamente.'}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="bg-white rounded-2xl border border-border shadow-sm p-12 text-center">
        <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mx-auto mb-5">
          <CheckCircle2 className="w-8 h-8 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-brand-navy mb-2">Cadastro enviado!</h2>
        <p className="text-muted-foreground max-w-sm mx-auto">
          Obrigado pelo interesse. Nossa equipe irá analisar suas informações e retornará em até 5 dias úteis.
        </p>
        <div className="mt-6 inline-flex items-center gap-2 bg-muted rounded-lg px-4 py-2">
          <div className="w-2 h-2 rounded-full bg-amber-400" />
          <span className="text-sm text-muted-foreground">
            Status: <strong className="text-foreground">Aguardando análise</strong>
          </span>
        </div>
      </div>
    );
  }

  const stepTitles: Record<number, string> = {
    1: 'Dados do Fornecedor',
    2: 'Documentações',
    3: 'Regime Tributário',
    4: 'Certificação ISO 9001',
    5: 'Responsável',
    6: formData.possui_iso_9001 === 'NÃO' ? 'Autoavaliação de Qualidade' : 'Declaração de Veracidade',
    7: 'Declaração de Veracidade',
  };

  const isLastStep = currentStep === totalSteps;

  return (
    <div className="bg-white rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="bg-brand-navy px-8 py-6">
        <div className="mb-5">
          <FormProgress currentStep={currentStep} totalSteps={totalSteps} steps={STEPS} />
        </div>
        <h2 className="text-white font-semibold text-lg">{stepTitles[currentStep]}</h2>
        <p className="text-white/50 text-xs mt-0.5">Etapa {currentStep} de {totalSteps}</p>
      </div>

      <div className="px-8 py-8 min-h-[420px]">
        {currentStep === 1 && (
          <StepDadosFornecedor formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 2 && (
          <StepDocumentacoes docUrls={docUrls} onDocChange={handleDocChange} errors={errors} />
        )}
        {currentStep === 3 && (
          <StepRegimeTributario formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 4 && (
          <StepISO formData={formData} onChange={handleChange} isoPdfUrl={isoPdfUrl} onIsoPdfChange={setIsoPdfUrl} errors={errors} />
        )}
        {currentStep === 5 && (
          <StepResponsavel formData={formData} onChange={handleChange} errors={errors} />
        )}
        {currentStep === 6 && formData.possui_iso_9001 === 'NÃO' && (
          <StepAutoavaliacao formData={formData} onChange={handleChange} errors={errors} />
        )}
        {/* Aceite: step 6 se tem ISO, step 7 se não tem */}
        {((currentStep === 6 && formData.possui_iso_9001 === 'SIM') ||
          (currentStep === 7 && formData.possui_iso_9001 === 'NÃO')) && (
          <StepAceite aceite={aceite} onChange={setAceite} errors={errors} />
        )}
      </div>

      <div className="px-8 py-5 border-t border-border bg-muted/30 flex items-center justify-between">
        <Button
          variant="ghost"
          onClick={handlePrev}
          disabled={currentStep === 1}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="w-4 h-4" />
          Anterior
        </Button>

        {!isLastStep ? (
          <Button onClick={handleNext} className="bg-brand-navy hover:bg-brand-navy/90 gap-2">
            Próximo
            <ArrowRight className="w-4 h-4" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting || !aceite}
            className="bg-brand-red hover:bg-brand-red/90 gap-2 min-w-[160px]"
          >
            {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isSubmitting ? 'Enviando...' : 'Enviar Cadastro'}
          </Button>
        )}
      </div>
    </div>
  );
}
