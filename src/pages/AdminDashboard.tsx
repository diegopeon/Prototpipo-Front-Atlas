
import { useEffect, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { projectService, Project, ProjectStatus } from "@/services/project.service";
import { professorService, Professor } from "@/services/professor.service";
import { authService } from "@/services/auth.service";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const AdminDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [projects, setProjects] = useState<Project[]>([]);
  const [professors, setProfessors] = useState<Professor[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [projectsData, professorsData] = await Promise.all([
          projectService.getAll(),
          professorService.getAll(),
        ]);
        setProjects(projectsData);
        setProfessors(professorsData);
      } catch (error) {
        console.error("Erro ao buscar dados:", error);
        toast({
          title: "Erro",
          description: "Não foi possível carregar os dados.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [toast]);

  const handleLogout = () => {
    authService.logout();
    navigate("/");
  };

  const handleUpdateProject = (projectId: number) => {
    navigate(`/admin/project/${projectId}`);
  };

  const handleAddProfessor = () => {
    navigate("/admin/new-professor");
  };

  const getStatusLabel = (status: ProjectStatus) => {
    const labels = {
      [ProjectStatus.AGUARDANDO_ANALISE_PRELIMINAR]: "Aguardando Análise",
      [ProjectStatus.EM_ANALISE]: "Em Análise",
      [ProjectStatus.PROJETO_RECUSADO]: "Recusado",
      [ProjectStatus.EM_ANDAMENTO]: "Em Andamento",
      [ProjectStatus.FINALIZADO]: "Finalizado",
    };
    return labels[status];
  };

  const getStatusColor = (status: ProjectStatus) => {
    switch (status) {
      case ProjectStatus.AGUARDANDO_ANALISE_PRELIMINAR:
        return "bg-yellow-100 text-yellow-800";
      case ProjectStatus.EM_ANALISE:
        return "bg-blue-100 text-blue-800";
      case ProjectStatus.PROJETO_RECUSADO:
        return "bg-red-100 text-red-800";
      case ProjectStatus.EM_ANDAMENTO:
        return "bg-purple-100 text-purple-800";
      case ProjectStatus.FINALIZADO:
        return "bg-green-100 text-green-800";
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold">Painel Administrativo</h1>
          <p className="text-gray-600">Fábrica de Software - Gestão de Projetos</p>
        </div>
        <Button variant="outline" onClick={handleLogout}>Sair</Button>
      </div>

      <Tabs defaultValue="projects" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="projects">Projetos</TabsTrigger>
          <TabsTrigger value="professors">Professores</TabsTrigger>
        </TabsList>

        <TabsContent value="projects">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Projetos</CardTitle>
              <Button onClick={() => navigate('/admin/new-project')}>Novo Projeto</Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando projetos...</div>
              ) : projects.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum projeto cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {projects.map((project) => (
                    <div key={project.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-medium">{project.name}</h3>
                          <p className="text-sm text-gray-500">
                            Início: {new Date(project.dataInicio).toLocaleDateString()}
                          </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                          {getStatusLabel(project.status)}
                        </span>
                      </div>
                      <p className="mt-2 text-sm">{project.objetivo}</p>
                      <div className="mt-4 flex justify-end space-x-2">
                        <Button variant="outline" size="sm" onClick={() => handleUpdateProject(project.id!)}>
                          Editar
                        </Button>
                        <Button 
                          variant="destructive" 
                          size="sm" 
                          onClick={async () => {
                            try {
                              await projectService.delete(project.id!);
                              setProjects(projects.filter(p => p.id !== project.id));
                              toast({
                                title: "Sucesso",
                                description: "Projeto excluído com sucesso",
                              });
                            } catch (error) {
                              toast({
                                title: "Erro",
                                description: "Não foi possível excluir o projeto",
                                variant: "destructive",
                              });
                            }
                          }}
                        >
                          Excluir
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professors">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Professores</CardTitle>
              <Button onClick={handleAddProfessor}>Cadastrar Professor</Button>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">Carregando professores...</div>
              ) : professors.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum professor cadastrado.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {professors.map((professor) => (
                    <div key={professor.id} className="border rounded-lg p-4">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="text-lg font-medium">{professor.login}</h3>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => navigate(`/admin/professor/${professor.id}`)}
                          >
                            Editar
                          </Button>
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={async () => {
                              try {
                                await professorService.delete(professor.id!);
                                setProfessors(professors.filter((p) => p.id !== professor.id));
                                toast({
                                  title: "Sucesso",
                                  description: "Professor excluído com sucesso",
                                });
                              } catch (error) {
                                toast({
                                  title: "Erro",
                                  description: "Não foi possível excluir o professor",
                                  variant: "destructive",
                                });
                              }
                            }}
                          >
                            Excluir
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
