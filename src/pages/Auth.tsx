import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email('E-mail inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export default function Auth() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { signIn } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    try {
      loginSchema.parse({ email, password });
    } catch (err) {
      if (err instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        err.errors.forEach((e) => { if (e.path[0]) newErrors[e.path[0] as string] = e.message; });
        setErrors(newErrors);
        return;
      }
    }

    setIsLoading(true);
    try {
      const { error } = await signIn(email, password);
      if (error) {
        toast.error(error.message.includes('Invalid login credentials') ? 'E-mail ou senha incorretos' : error.message);
        return;
      }
      toast.success('Login realizado com sucesso!');
      navigate('/admin');
    } catch {
      toast.error('Erro ao fazer login. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img src="/logo-filtros-brasil.svg" alt="Filtros Brasil" className="h-8 w-auto" />
          </div>
          <h1 className="text-xl font-semibold text-brand-navy">Área Administrativa</h1>
          <p className="text-sm text-muted-foreground mt-1">Acesso restrito — Filtros Brasil</p>
        </div>

        <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@filtrosbrasil.com.br" className={errors.email ? 'border-destructive' : ''} disabled={isLoading} />
              {errors.email && <p className="text-xs text-destructive">{errors.email}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••" className={errors.password ? 'border-destructive' : ''} disabled={isLoading} />
              {errors.password && <p className="text-xs text-destructive">{errors.password}</p>}
            </div>

            <Button type="submit" className="w-full bg-brand-navy hover:bg-brand-navy/90" disabled={isLoading}>
              {isLoading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Entrar
            </Button>
          </form>

          <div className="pt-2 border-t text-center">
            <Button variant="link" className="text-xs text-muted-foreground" onClick={() => navigate('/')}>
              Voltar para o formulário
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
