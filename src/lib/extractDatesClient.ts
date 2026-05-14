import { supabase } from '@/integrations/supabase/client';

interface ExtractedDates {
  data_emissao: string | null;
  data_validade: string | null;
}

export async function extractDatesFromImageClient(imageBase64: string): Promise<ExtractedDates> {
  const { data, error } = await supabase.functions.invoke('extract-iso-dates', {
    body: { imageBase64 },
  });

  if (error) {
    throw new Error(error.message || 'Erro ao processar o certificado');
  }

  if (data?.error) {
    throw new Error(data.error);
  }

  return {
    data_emissao: data?.data_emissao || null,
    data_validade: data?.data_validade || null,
  };
}
