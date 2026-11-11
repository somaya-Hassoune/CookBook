import { useCallback, useEffect, useMemo, useState } from 'react';
import './Horizons.css';

const API_URL = 'http://127.0.0.1:8000/horizons';
const PAGE_SIZE = 8;

const EMPTY_FORM = {
  id: '', code: '', name: '', material: '', compacity: '', water: '',
  contacts: '', risk: '', orientation: '', tagsText: '',
};

function getErrorMessage(error) {
  return error?.message || 'Une erreur est survenue. Vérifie que le serveur FastAPI est démarré.';
}

function Field({ label, name, value, onChange, placeholder = '', multiline = false, required = false }) {
  const shared = { id: name, name, value: value ?? '', onChange: (e) => onChange(name, e.target.value), placeholder, required };
  return (
    <label className="hz-field" htmlFor={name}>
      <span>{label}{required && <i> *</i>}</span>
      {multiline ? <textarea {...shared} rows="3" /> : <input {...shared} />}
    </label>
  );
}

export default function Horizons() {
  const [horizons, setHorizons] = useState([]);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selectedId, setSelectedId] = useState(null);
  const [detail, setDetail] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [actionId, setActionId] = useState(null);

  const loadHorizons = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const response = await fetch(API_URL);
      if (!response.ok) throw new Error(`Erreur API (${response.status})`);
      const payload = await response.json();
      setHorizons(Array.isArray(payload) ? payload : payload.horizons || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadDetail = useCallback(async (id) => {
    setSelectedId(id);
    setDetail(null);
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(id)}`);
      if (!response.ok) throw new Error(`Impossible de charger la fiche (${response.status})`);
      setDetail(await response.json());
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }, []);

  useEffect(() => { loadHorizons(); }, [loadHorizons]);

  const filtered = useMemo(() => {
    const term = search.trim().toLocaleLowerCase('fr');
    if (!term) return horizons;
    return horizons.filter((h) => [h.code, h.name, h.material, h.compacity, h.water, h.contacts, h.risk, h.orientation, ...(h.tags || [])]
      .filter(Boolean).join(' ').toLocaleLowerCase('fr').includes(term));
  }, [horizons, search]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const visible = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const openCreate = () => {
    setEditing(false);
    setForm(EMPTY_FORM);
    setModalOpen(true);
  };

  const openEdit = (h) => {
    setEditing(true);
    setForm({
      id: h.id || '', code: h.code || '', name: h.name || '', material: h.material || '',
      compacity: h.compacity || '', water: h.water || '', contacts: h.contacts || '',
      risk: h.risk || '', orientation: h.orientation || '', tagsText: (h.tags || []).join(', '),
    });
    setModalOpen(true);
  };

  const updateForm = (name, value) => setForm((current) => ({ ...current, [name]: value }));

  const saveHorizon = async (event) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const payload = {
      ...(editing ? {} : { id: form.id.trim() }),
      code: form.code.trim(), name: form.name.trim(), material: form.material.trim(),
      compacity: form.compacity.trim(), water: form.water.trim(), contacts: form.contacts.trim(),
      risk: form.risk.trim(), orientation: form.orientation.trim(),
      tags: form.tagsText.split(',').map((tag) => tag.trim()).filter(Boolean),
    };
    try {
      const url = editing ? `${API_URL}/${encodeURIComponent(form.id)}` : API_URL;
      const response = await fetch(url, {
        method: editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `Erreur lors de l'enregistrement (${response.status})`);
      setModalOpen(false);
      setNotice(editing ? 'Horizon modifié avec succès.' : 'Horizon ajouté avec succès.');
      await loadHorizons();
      if (result.id || form.id) await loadDetail(result.id || form.id);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  };

  const deleteHorizon = async (h) => {
    const confirmed = window.confirm(`Supprimer l'horizon « ${h.name || h.code} » ?`);
    if (!confirmed) return;
    setActionId(h.id);
    setError('');
    try {
      const response = await fetch(`${API_URL}/${encodeURIComponent(h.id)}`, { method: 'DELETE' });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.detail || `Erreur lors de la suppression (${response.status})`);
      setNotice('Horizon supprimé.');
      if (selectedId === h.id) { setSelectedId(null); setDetail(null); }
      await loadHorizons();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setActionId(null);
    }
  };

  const closeDetail = () => { setSelectedId(null); setDetail(null); };

  return (
    <main className="hz-page">
      <div className="hz-page-heading">
        <div>
          <div className="hz-eyebrow">RÉFÉRENTIEL GÉOLOGIQUE</div>
          <h1>Horizons</h1>
          <p>Gérez les contextes géologiques et opérationnels utilisés pour les recettes.</p>
        </div>
        <button className="hz-primary" onClick={openCreate}><span>＋</span> Nouvel horizon</button>
      </div>

      {notice && <div className="hz-notice"><span>✓</span>{notice}<button onClick={() => setNotice('')} aria-label="Fermer">×</button></div>}
      {error && <div className="hz-error"><span>{error}</span><button onClick={() => setError('')}>Fermer</button></div>}

      {selectedId ? (
        <section className="hz-detail-view">
          <button className="hz-back" onClick={closeDetail}>← Retour à la liste</button>
          {!detail ? <div className="hz-empty">Chargement de la fiche…</div> : <>
            <div className="hz-detail-heading">
              <div><div className="hz-eyebrow">FICHE HORIZON</div><h2>{detail.name || 'Horizon sans nom'}</h2><p>{detail.code || '—'} <span className="hz-dot">•</span> {detail.material || 'Matériau non renseigné'}</p></div>
              <div className="hz-detail-actions">
                <button className="hz-secondary" onClick={() => openEdit(detail)}>✎ Modifier</button>
                <button className="hz-danger-outline" onClick={() => deleteHorizon(detail)} disabled={actionId === detail.id}>Supprimer</button>
              </div>
            </div>
            <div className="hz-detail-grid">
              <section className="hz-panel">
                <div className="hz-panel-title"><span className="hz-panel-icon">◈</span><h3>Caractéristiques</h3></div>
                <dl className="hz-properties">
                  <div><dt>Matériau</dt><dd>{detail.material || 'Non renseigné'}</dd></div>
                  <div><dt>Compacité</dt><dd>{detail.compacity || 'Non renseignée'}</dd></div>
                  <div><dt>Eau</dt><dd>{detail.water || 'Non renseignée'}</dd></div>
                  <div><dt>Contacts</dt><dd>{detail.contacts || 'Non renseignés'}</dd></div>
                  <div><dt>Risque</dt><dd>{detail.risk || 'Non renseigné'}</dd></div>
                  <div><dt>Orientation</dt><dd>{detail.orientation || 'Non renseignée'}</dd></div>
                </dl>
                {!!detail.tags?.length && <div className="hz-tags">{detail.tags.map((tag) => <span key={tag}>{tag}</span>)}</div>}
              </section>
              <section className="hz-panel">
                <div className="hz-panel-title"><span className="hz-panel-icon">▤</span><h3>Recettes associées</h3><span className="hz-count">{detail.recipes?.length || 0}</span></div>
                {detail.recipes?.length ? <div className="hz-recipe-list">{detail.recipes.map((recipe) => <div className="hz-recipe" key={recipe.id}>
                  <div><strong>{recipe.code || recipe.name}</strong><small>{recipe.name}{recipe.version ? ` · ${recipe.version}` : ''}</small></div>
                  <span className={`hz-status ${String(recipe.status || '').toLowerCase().includes('valid') || recipe.status === 'Standard OCP' ? 'is-valid' : 'is-pending'}`}>{recipe.status || 'Sans statut'}</span>
                </div>)}</div> : <div className="hz-empty-inline">Aucune recette associée à cet horizon.</div>}
              </section>
            </div>
            <section className="hz-panel hz-risk-panel">
              <div className="hz-panel-title"><span className="hz-panel-icon">⌁</span><h3>Contexte opérationnel</h3></div>
              <div className="hz-context-grid"><div><span>Risque identifié</span><p>{detail.risk || 'Non renseigné'}</p></div><div><span>Orientation recommandée</span><p>{detail.orientation || 'Non renseignée'}</p></div><div><span>Tirs associés</span><p className="hz-big-number">{detail.blastCount ?? 0}</p></div></div>
            </section>
          </>}
        </section>
      ) : (
        <>
          <div className="hz-toolbar">
            <label className="hz-search"><span>⌕</span><input value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }} placeholder="Rechercher un horizon…" /><kbd>⌘ K</kbd></label>
            <div className="hz-toolbar-right"><span>{filtered.length} horizon{filtered.length > 1 ? 's' : ''}</span><button className="hz-refresh" onClick={loadHorizons} title="Actualiser">↻</button></div>
          </div>
          <section className="hz-table-card">
            {loading ? <div className="hz-empty">Chargement des horizons…</div> : filtered.length === 0 ? <div className="hz-empty">Aucun horizon ne correspond à ta recherche.</div> : <div className="hz-table-scroll"><table className="hz-table">
              <thead><tr><th>Horizon</th><th>Description / contexte</th><th>Caractéristiques principales</th><th>Recettes associées</th><th>Actions</th></tr></thead>
              <tbody>{visible.map((h) => <tr key={h.id}>
                <td><button className="hz-horizon-link" onClick={() => loadDetail(h.id)}><strong>{h.name || 'Sans nom'}</strong><small>{h.code || h.id}</small></button></td>
                <td><span className="hz-context-text">{h.orientation || h.risk || 'Contexte non renseigné'}</span></td>
                <td><div className="hz-characteristics"><span>{h.material || '—'}</span><span>{h.compacity || '—'}</span><span>{h.water || '—'}</span></div><small className="hz-risk-text">Risque : {h.risk || 'Non renseigné'}</small></td>
                <td><button className="hz-recipe-count" onClick={() => loadDetail(h.id)}><b>{h.recipeCount ?? 0}</b><span>recette{(h.recipeCount ?? 0) > 1 ? 's' : ''}</span></button></td>
                <td><div className="hz-row-actions"><button onClick={() => loadDetail(h.id)} title="Voir la fiche">↗</button><button onClick={() => openEdit(h)} title="Modifier">✎</button><button onClick={() => deleteHorizon(h)} title="Supprimer" disabled={actionId === h.id}>⋯</button></div></td>
              </tr>)}</tbody>
            </table></div>}
            <div className="hz-table-footer"><span>Affichage de {filtered.length ? (page - 1) * PAGE_SIZE + 1 : 0} à {Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} horizons</span>
              <div className="hz-pagination"><button disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>‹</button><span>{page} / {pages}</span><button disabled={page >= pages} onClick={() => setPage((p) => p + 1)}>›</button></div>
            </div>
          </section>
          <div className="hz-footnote">Les informations affichées proviennent du référentiel des horizons et des recettes enregistrées.</div>
        </>
      )}

      {modalOpen && <div className="hz-modal-backdrop" role="presentation" onMouseDown={(e) => { if (e.target === e.currentTarget) setModalOpen(false); }}>
        <form className="hz-modal" onSubmit={saveHorizon}>
          <div className="hz-modal-heading"><div><div className="hz-eyebrow">RÉFÉRENTIEL</div><h2>{editing ? 'Modifier un horizon' : 'Créer un horizon'}</h2><p>Renseigne les informations géologiques et opérationnelles.</p></div><button type="button" onClick={() => setModalOpen(false)} aria-label="Fermer">×</button></div>
          <div className="hz-form-grid">
            {!editing && <Field label="Identifiant" name="id" value={form.id} onChange={updateForm} placeholder="ex. hz-humide" required />}
            <Field label="Code" name="code" value={form.code} onChange={updateForm} placeholder="ex. HZ-HUM" required />
            <Field label="Nom de l'horizon" name="name" value={form.name} onChange={updateForm} placeholder="Nom de l'horizon" required />
            <Field label="Matériau" name="material" value={form.material} onChange={updateForm} placeholder="Type de matériau" />
            <Field label="Compacité" name="compacity" value={form.compacity} onChange={updateForm} placeholder="Faible, moyenne, élevée…" />
            <Field label="Présence d'eau" name="water" value={form.water} onChange={updateForm} placeholder="Sec, humide, variable…" />
            <Field label="Contacts" name="contacts" value={form.contacts} onChange={updateForm} placeholder="Description des contacts" />
            <Field label="Risque principal" name="risk" value={form.risk} onChange={updateForm} placeholder="Risque identifié" />
            <Field label="Orientation" name="orientation" value={form.orientation} onChange={updateForm} placeholder="Orientation opérationnelle" multiline />
            <Field label="Tags (séparés par des virgules)" name="tagsText" value={form.tagsText} onChange={updateForm} placeholder="QA/QC, Eau, HSE…" />
          </div>
          <div className="hz-modal-footer"><span>* Champs obligatoires</span><button type="button" className="hz-secondary" onClick={() => setModalOpen(false)}>Annuler</button><button type="submit" className="hz-primary" disabled={saving}>{saving ? 'Enregistrement…' : editing ? 'Enregistrer les modifications' : 'Créer l’horizon'}</button></div>
        </form>
      </div>}
    </main>
  );
}
