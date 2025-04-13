
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { useProfessors } from "@/hooks/useProfessors";
import { toast } from "sonner";
import { authService } from "@/services/auth.service";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info, AlertTriangle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const FetchProfessorsButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [showAuthAlert, setShowAuthAlert] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const { professors, refetch } = useProfessors();
  const navigate = useNavigate();

  const handleFetchProfessors = async () => {
    setIsLoading(true);
    setShowAuthAlert(false);
    setErrorMessage("");
    
    try {
      console.log("Iniciando busca de professores...");
      
      // Verificar autenticação antes de fazer a requisição
      if (!authService.isAuthenticated()) {
        console.log("Usuário não autenticado");
        setShowAuthAlert(true);
        setErrorMessage("Você precisa estar logado para acessar esta lista. Por favor, faça login primeiro.");
        toast.error("Você precisa estar logado para acessar esta lista");
        
        // Redirecionando para login
        setTimeout(() => {
          navigate('/login');
        }, 3000);
        return;
      }
      
      // Adicionando mais informações de debug
      console.log("Token JWT:", localStorage.getItem('atlas_token'));
      console.log("Papel do usuário:", authService.getRole());
      
      const result = await refetch();
      console.log("Resultado da busca:", result);
      
      if (professors && professors.length > 0) {
        toast.success(`${professors.length} professores carregados com sucesso!`);
        console.log("Professores carregados:", professors);
      } else {
        toast.success("Lista de professores carregada (vazia ou não disponível)");
      }
    } catch (error: any) {
      console.error("Erro ao buscar professores:", error);
      
      // Verificando o tipo específico de erro para dar mensagens mais claras
      if (error?.response?.status === 403) {
        const errorMsg = "Acesso negado. Você não tem permissão para acessar esta lista. Você precisa ser um administrador.";
        toast.error(errorMsg);
        setShowAuthAlert(true);
        setErrorMessage(errorMsg);
        
        console.log("Role do usuário:", authService.getRole());
        console.log("É admin?", authService.isAdmin());
      } else if (error?.response?.status === 401) {
        const errorMsg = "Autenticação necessária. Por favor, faça login novamente para acessar.";
        toast.error(errorMsg);
        setShowAuthAlert(true);
        setErrorMessage(errorMsg);
        
        // Limpar credenciais inválidas
        authService.logout();
        
        // Redirecionando para login
        setTimeout(() => {
          navigate('/login');
        }, 2000);
      } else if (error.message && (error.message.includes("Network Error") || error.message.includes("Failed to fetch") || error.message.includes("CORS"))) {
        const errorMsg = "Erro de conexão com o servidor. Verifique se o backend está em execução na porta 8080 e se está permitindo acesso CORS da sua origem.";
        toast.error(errorMsg);
        setShowAuthAlert(true);
        setErrorMessage(errorMsg);
      } else {
        const errorMsg = `Erro ao buscar professores: ${error.message || 'Erro desconhecido'}. Verifique o console para mais detalhes.`;
        toast.error(errorMsg);
        setShowAuthAlert(true);
        setErrorMessage(errorMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {showAuthAlert && (
        <Alert variant="destructive" className="mb-4">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Erro de autorização</AlertTitle>
          <AlertDescription>
            {errorMessage || "Você não tem permissão para acessar este recurso. Verifique se está logado com as credenciais corretas e se tem as permissões necessárias."}
          </AlertDescription>
        </Alert>
      )}
      
      <Button 
        onClick={handleFetchProfessors}
        disabled={isLoading}
        className="bg-blue-600 hover:bg-blue-700"
      >
        {isLoading ? "Carregando..." : "Buscar Professores"}
      </Button>
    </div>
  );
};

export default FetchProfessorsButton;
