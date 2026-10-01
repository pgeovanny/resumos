import React, { useMemo, useState } from "react";

const demoEdital = {
  id: "uf-2026-assistente",
  orgao: "Universidade Federal",
  concurso: "Concurso 2026",
  cargo: "Assistente em Administração",
  published: 12,
  total: 18,
  progress: 67,
  updatedAt: "01/10/2026",
  materias: [
    {
      id: "adm-publica",
      nome: "Administração Pública",
      topicos: [
        { id: "fundamentos", nome: "Fundamentos da Administração Pública", materiais: [
          { id: "m1", titulo: "Fundamentos da Administração Pública", versao: "v1.2", data: "01/10/2026", status: "ATUALIZADO", download: "available" }
        ]},
        { id: "principios", nome: "Princípios da Administração Pública", materiais: [
          { id: "m2", titulo: "Princípios da Administração Pública", versao: "v1.0", data: "29/09/2026", status: "NOVO", download: "locked", unlockAt: "06/10/2026" }
        ]},
        { id: "organizacao", nome: "Organização Administrativa", materiais: [
          { id: "m3", titulo: "Organização Administrativa", versao: "v1.0", data: "27/09/2026", status: "DISPONÍVEL", download: "available" }
        ]},
      ],
    },
    {
      id: "adm-geral",
      nome: "Administração Geral",
      topicos: [
        { id: "pdca", nome: "Ciclo PDCA", materiais: [
          { id: "m4", titulo: "Ciclo PDCA", versao: "v1.1", data: "30/09/2026", status: "ATUALIZADO", download: "available" }
        ]},
        { id: "processos", nome: "Processos Organizacionais", materiais: [] },
      ],
    },
    {
      id: "gestao-pessoas",
      nome: "Gestão de Pessoas",
      topicos: [
        { id: "motivacao", nome: "Motivação e Liderança", materiais: [] },
        { id: "avaliacao", nome: "Avaliação de Desempenho", materiais: [] },
      ],
    },
    {
      id: "arquivologia",
      nome: "Arquivologia",
      topicos: [
        { id: "gestao-documentos", nome: "Gestão de Documentos", materiais: [] },
      ],
    },
    {
      id: "materiais",
      nome: "Administração de Materiais",
      topicos: [
        { id: "estoques", nome: "Gestão de Estoques", materiais: [] },
      ],
    },
  ],
};

const updates = [
  ["01/10", "Fundamentos da Administração Pública", "Material atualizado · versão 1.2"],
  ["30/09", "Ciclo PDCA", "Material atualizado · versão 1.1"],
  ["29/09", "Princípios da Administração Pública", "Novo resumo publicado"],
];

function Brand() {
  return <div className="brand">
    <strong>RESUMOS <span>SF</span></strong>
    <small>RESUMOS ESTRATÉGICOS<br/>PARA CONCURSOS</small>
  </div>;
}

function Sidebar({ view, setView }) {
  return <aside className="sidebar">
    <Brand />
    <nav>
      <button className={view === "aluno" ? "active" : ""} onClick={() => setView("aluno")}>Meus materiais</button>
      <button onClick={() => setView("aluno")}>Buscar</button>
      <button onClick={() => setView("aluno")}>Atualizações</button>
      <button className={view === "admin" ? "active" : ""} onClick={() => setView("admin")}>Administração</button>
    </nav>
    <div className="side-foot">
      <div className="avatar">PG</div>
      <div><b>Conta de demonstração</b><small>Acesso ativo</small></div>
    </div>
  </aside>;
}

function StudentView() {
  const [query, setQuery] = useState("");
  const [openedSubject, setOpenedSubject] = useState(null);
  const allMaterials = useMemo(() =>
    demoEdital.materias.flatMap(m =>
      m.topicos.flatMap(t =>
        t.materiais.map(x => ({ ...x, materia: m.nome, topico: t.nome }))
      )
    ), []
  );
  const results = query.trim()
    ? allMaterials.filter(x =>
        (x.titulo + " " + x.materia + " " + x.topico).toLowerCase().includes(query.toLowerCase())
      )
    : [];

  return <div className="page">
    <header className="page-head">
      <div>
        <span className="eyebrow">BIBLIOTECA DO ALUNO</span>
        <h1>Meus materiais</h1>
        <p>Seu conteúdo organizado pela estrutura do edital.</p>
      </div>
      <label className="search">
        <span>⌕</span>
        <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar matéria, tópico ou resumo" />
      </label>
    </header>

    {query && <section className="search-box">
      <div className="section-title">
        <div><small>RESULTADOS</small><h2>Busca</h2></div>
        <span>{results.length} encontrados</span>
      </div>
      {results.length ? results.map(r => <div className="search-row" key={r.id}>
        <div><b>{r.titulo}</b><small>{r.materia} · {r.topico}</small></div>
        <span>→</span>
      </div>) : <div className="empty">Nenhum material encontrado.</div>}
    </section>}

    <section className="hero-card">
      <div className="hero-top">
        <div>
          <span className="status-badge">ACESSO ATIVO</span>
          <small>{demoEdital.orgao} · {demoEdital.concurso}</small>
          <h2>{demoEdital.cargo}</h2>
        </div>
        <b className="year">2026</b>
      </div>
      <div className="metrics">
        <div><b>{demoEdital.published}</b><span>resumos publicados</span></div>
        <div><b>{demoEdital.total - demoEdital.published}</b><span>em produção</span></div>
        <div><b>{demoEdital.updatedAt}</b><span>última atualização</span></div>
      </div>
      <div className="progress"><i style={{ width: demoEdital.progress + "%" }} /></div>
      <div className="hero-foot"><span>{demoEdital.progress}% do conteúdo editorial publicado</span><button onClick={() => setOpenedSubject("all")}>Abrir material →</button></div>
    </section>

    <div className="student-grid">
      <section>
        <div className="section-title">
          <div><small>ESTRUTURA DO EDITAL</small><h2>Matérias</h2></div>
          <span>{demoEdital.materias.length} matérias</span>
        </div>
        <div className="subject-list">
          {demoEdital.materias.map((m, i) => {
            const published = m.topicos.filter(t => t.materiais.length).length;
            const total = m.topicos.length;
            const pct = Math.round((published / total) * 100);
            const open = openedSubject === m.id || openedSubject === "all";
            return <div key={m.id} className="subject-block">
              <button className="subject-row" onClick={() => setOpenedSubject(openedSubject === m.id ? null : m.id)}>
                <span className="num">{String(i + 1).padStart(2, "0")}</span>
                <div><b>{m.nome}</b><small>{published} de {total} tópicos com material</small></div>
                <div className="mini-progress"><i style={{ width: pct + "%" }} /></div>
                <span className="pct">{pct}%</span>
                <span>⌄</span>
              </button>
              {open && <div className="topic-list">
                {m.topicos.map((t, ti) => <div className="topic-row" key={t.id}>
                  <div className="topic-label"><span>{i + 1}.{ti + 1}</span><b>{t.nome}</b></div>
                  {t.materiais.length ? t.materiais.map(material => <div className="material-row" key={material.id}>
                    <div className="file-icon">PDF</div>
                    <div className="material-info">
                      <div><b>{material.titulo}</b>{material.status !== "DISPONÍVEL" && <em>{material.status}</em>}</div>
                      <small>{material.versao} · publicado em {material.data}</small>
                    </div>
                    <button className="ghost">Ler online</button>
                    {material.download === "available"
                      ? <button className="primary">Baixar PDF</button>
                      : <div className="download-lock">Download em<br/><b>{material.unlockAt}</b></div>}
                  </div>) : <div className="production">EM PRODUÇÃO · o material aparecerá aqui quando for publicado.</div>}
                </div>}
            </div>;
          })}
        </div>
      </section>

      <aside>
        <div className="section-title">
          <div><small>ÚLTIMOS MOVIMENTOS</small><h2>Atualizações</h2></div>
        </div>
        <div className="updates">
          {updates.map(([date, title, meta]) => <div key={title}>
            <span>{date}</span><p><b>{title}</b><small>{meta}</small></p>
          </div>)}
        </div>
        <div className="notice"><b>Downloads protegidos</b><p>Alguns PDFs podem ter liberação programada de acordo com a regra do produto.</p></div>
      </aside>
    </div>
  </div>;
}

function AdminView() {
  const [tab, setTab] = useState("conteudo");
  const [modal, setModal] = useState(false);
  const [drafts, setDrafts] = useState([]);
  const [form, setForm] = useState({ title: "", links: "", download: "7" });

  const createDraft = e => {
    e.preventDefault();
    setDrafts(d => [{ id: Date.now(), ...form }, ...d]);
    setForm({ title: "", links: "", download: "7" });
    setModal(false);
  };

  return <div className="page admin-page">
    <header className="page-head admin-head">
      <div>
        <span className="eyebrow">PAINEL OPERACIONAL</span>
        <h1>Administração</h1>
        <p>Cadastre uma vez. Vincule o mesmo resumo a quantos editais e tópicos precisar.</p>
      </div>
      <button className="primary big" onClick={() => setModal(true)}>+ Novo material</button>
    </header>

    <div className="tabs">
      <button className={tab === "conteudo" ? "active" : ""} onClick={() => setTab("conteudo")}>Conteúdo</button>
      <button className={tab === "acessos" ? "active" : ""} onClick={() => setTab("acessos")}>Acessos</button>
      <button className={tab === "kiwify" ? "active" : ""} onClick={() => setTab("kiwify")}>Kiwify</button>
    </div>

    {tab === "conteudo" && <>
      <section className="admin-metrics">
        <div><b>{demoEdital.published}</b><span>materiais publicados</span></div>
        <div><b>1</b><span>edital ativo</span></div>
        <div><b>{demoEdital.materias.length}</b><span>matérias vinculadas</span></div>
        <div><b>{demoEdital.total - demoEdital.published}</b><span>pendências editoriais</span></div>
      </section>

      {drafts.map(d => <div className="draft" key={d.id}>
        <div><b>{d.title || "Novo material sem título"}</b><small>Rascunho · regra de download: {d.download === "0" ? "imediata" : d.download + " dias"}</small></div>
        <button className="ghost">Editar</button>
      </div>)}

      <section className="admin-panel">
        <div className="panel-head">
          <div><small>EDITAL</small><h2>{demoEdital.orgao} · {demoEdital.cargo}</h2></div>
          <button className="primary">+ Adicionar edital</button>
        </div>
        {demoEdital.materias.map((m, mi) => <div className="admin-subject" key={m.id}>
          <div className="admin-subject-head">
            <span>{String(mi + 1).padStart(2, "0")}</span>
            <b>{m.nome}</b>
            <small>{m.topicos.length} tópicos</small>
            <button>•••</button>
          </div>
          {m.topicos.map((t, ti) => <div className="admin-topic" key={t.id}>
            <span>{mi + 1}.{ti + 1}</span>
            <div><b>{t.nome}</b><small>{t.materiais.length ? t.materiais.length + " material vinculado" : "Nenhum material publicado"}</small></div>
            <button className="ghost">+ Vincular</button>
          </div>)}
        </div>)}
      </section>
    </>}

    {tab === "acessos" && <section className="admin-panel">
      <div className="panel-head"><div><small>ALUNOS E COMPRAS</small><h2>Controle de acessos</h2></div></div>
      <div className="access-table">
        <div className="thead"><span>Aluno</span><span>Produto</span><span>Compra</span><span>Status</span></div>
        <div className="trow"><span><b>Conta de demonstração</b><small>demo@resumossf.com.br</small></span><span>{demoEdital.cargo}</span><span>01/10/2026</span><span><em>ACTIVE</em></span></div>
      </div>
    </section>}

    {tab === "kiwify" && <section className="admin-panel">
      <div className="panel-head">
        <div><small>INTEGRAÇÃO</small><h2>Kiwify</h2></div>
        <span className="pending">AGUARDANDO CONFIGURAÇÃO</span>
      </div>
      <div className="integration-grid">
        <label>Product ID da Kiwify<input placeholder="Ex.: 8f0a..." /><small>Vincula o produto vendido ao edital correto.</small></label>
        <label>Webhook Secret<input type="password" placeholder="••••••••••••" /><small>Será armazenado apenas no backend.</small></label>
        <button className="primary">Salvar configuração</button>
      </div>
      <div className="webhook-box"><b>Eventos previstos</b><p>Compra aprovada → concede acesso · Reembolso/chargeback/cancelamento → revoga acesso · event_id impede processamento duplicado.</p></div>
    </section>}

    {modal && <div className="modal-bg" onMouseDown={e => e.target === e.currentTarget && setModal(false)}>
      <form className="modal" onSubmit={createDraft}>
        <div className="modal-head"><div><small>NOVO MATERIAL</small><h2>Publicar resumo</h2></div><button type="button" onClick={() => setModal(false)}>×</button></div>
        <div className="dropzone"><b>PDF</b><span>Arraste o arquivo aqui ou selecione no computador</span><input type="file" accept="application/pdf" /></div>
        <label>Título do material<input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Ex.: Fundamentos da Administração Pública" /></label>
        <label>Vincular aos tópicos<input value={form.links} onChange={e => setForm({ ...form, links: e.target.value })} placeholder="Busque e selecione um ou mais tópicos" /></label>
        <label>Regra de download<select value={form.download} onChange={e => setForm({ ...form, download: e.target.value })}>
          <option value="0">Imediato</option>
          <option value="7">7 dias após a compra</option>
          <option value="14">14 dias após a compra</option>
          <option value="date">Data específica</option>
          <option value="off">Desabilitado</option>
        </select></label>
        <div className="modal-actions"><button type="button" className="ghost" onClick={() => setModal(false)}>Cancelar</button><button className="primary">Criar rascunho</button></div>
      </form>
    </div>}
  </div>;
}

export default function App() {
  const [view, setView] = useState("aluno");
  return <div className="app-shell">
    <Sidebar view={view} setView={setView} />
    <main>{view === "aluno" ? <StudentView /> : <AdminView />}</main>
  </div>;
}
