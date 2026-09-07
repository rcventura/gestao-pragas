# Gestão de Pragas

## Objetivo

Sistema SaaS para gestão de ordens de serviço de controle de pragas, com um painel administrativo para a empresa prestadora e um portal individual para cada cliente.

## Arquitetura

O projeto utiliza uma arquitetura monolítica modular, multi-tenant e orientada a domínios. A aplicação começa como um único projeto Next.js, mas suas regras ficam separadas por módulos para permitir evolução sem microserviços prematuros.

## Tecnologias

- Next.js com React e TypeScript.
- Tailwind CSS para a interface responsiva.
- Supabase Auth para autenticação.
- Supabase PostgreSQL para persistência.
- Supabase Row Level Security (RLS) para isolamento entre empresas e perfis.
- Supabase Storage para fotos, documentos e certificados.
- PWA e IndexedDB para uso em campo e operação offline.
- Zod para validação de entradas.
- Vitest e Playwright para testes.

## Visões do sistema

### Painel administrativo

Usado pelo administrador e pela equipe da empresa prestadora. Permite gerenciar clientes, locais, usuários, técnicos, ordens de serviço, agenda, produtos, relatórios e permissões.

### Portal do cliente

Cada cliente acessa com seu próprio usuário e senha. O cliente visualiza somente seus locais, ordens de serviço, agenda, histórico, certificados, fotos e documentos, podendo também solicitar ou aprovar atendimentos conforme suas permissões.

### Área do técnico

Interface responsiva para consultar serviços atribuídos, executar checklists, registrar produtos e evidências, coletar aceite e trabalhar temporariamente sem conexão.

## Perfis iniciais

- `admin`: acesso total à empresa prestadora.
- `operador`: gerencia clientes e ordens de serviço.
- `tecnico`: executa as ordens atribuídas.
- `cliente`: acessa apenas os dados da própria organização cliente.

## Multi-tenancy e segurança

Todas as tabelas de negócio terão `organization_id`. As políticas RLS serão aplicadas no banco, e não somente na interface. O servidor também validará o perfil e o vínculo do usuário antes de executar operações sensíveis.

## Módulos previstos

```text
src/modules/
├── auth/
├── organizations/
├── users/
├── customers/
├── service-locations/
├── work-orders/
├── scheduling/
├── technicians/
├── products/
├── reports/
└── synchronization/
```

## Primeiro marco

1. Login, logout e recuperação de senha.
2. Criação e seleção da empresa ativa.
3. Perfis e permissões iniciais.
4. Dashboard administrativo protegido.
5. Portal do cliente protegido.
6. Configuração do Supabase por variáveis de ambiente.

## Evolução posterior

O ciclo completo da ordem de serviço virá depois da fundação de autenticação: cadastro de clientes e locais, agendamento, execução, fotos, checklist, assinatura, certificados, integrações e sincronização offline.

Contabilidade completa, emissão fiscal própria, roteirização avançada e aplicativos nativos ficam fora do primeiro corte.
