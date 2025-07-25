import React, { useState, useEffect } from 'react';
import Modal from '../components/Modal';
import './AdminDocumentos.css'; // Asegúrate de crear este archivo para los estilos
import { FaEdit } from 'react-icons/fa';

const API_URL = 'http://localhost:3001';

const AdminDocumentos = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadSuccess, setUploadSuccess] = useState('');
  const [documents, setDocuments] = useState([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  // Paso 1: Estados para usuarios y roles
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  // Estados para selección
  const [selectedRoles, setSelectedRoles] = useState([]);
  const [selectedUsers, setSelectedUsers] = useState([]);
  const [isGlobal, setIsGlobal] = useState(false);

  // Estados para edición
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editingDoc, setEditingDoc] = useState(null);
  const [editFile, setEditFile] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSelectedRoles, setEditSelectedRoles] = useState([]);
  const [editSelectedUsers, setEditSelectedUsers] = useState([]);
  const [editIsGlobal, setEditIsGlobal] = useState(false);

  // Cargar documentos al montar
  useEffect(() => {
    fetchDocuments();
  }, []);

  // Paso 1: Cargar usuarios y roles al abrir el modal
  useEffect(() => {
    if (modalOpen) {
      fetchUsersAndRoles();
    }
  }, [modalOpen]);

  // Lista fija de roles igual que en AdminCoursesPage.jsx
  const FIXED_ROLES = [
    "Gerente",
    "Contabilidad",
    "Compras",
    "Atención al Cliente"
  ];

  const fetchUsersAndRoles = async () => {
    setLoadingUsers(true);
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/usuarios`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setUsers(data.usuarios);
        setRoles(FIXED_ROLES);
      }
    } catch (err) {
      setUsers([]);
      setRoles(FIXED_ROLES);
    } finally {
      setLoadingUsers(false);
    }
  };

  const fetchDocuments = async () => {
    setLoadingDocs(true);
    setUploadError('');
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/documents`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) setDocuments(data.documents);
      else setUploadError('No se pudieron cargar los documentos');
    } catch (err) {
      setUploadError('Error al cargar documentos');
    } finally {
      setLoadingDocs(false);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setUploadError('');
    setUploadSuccess('');
  };

  const handleRoleToggle = (role) => {
    setSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };
  const handleUserToggle = (userId) => {
    setSelectedUsers(prev => prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]);
  };
  const handleGlobalChange = (e) => {
    setIsGlobal(e.target.checked);
    if (e.target.checked) {
      setSelectedRoles([]);
      setSelectedUsers([]);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setUploadError('Selecciona un archivo');
      return;
    }
    if (!isGlobal && selectedRoles.length === 0 && selectedUsers.length === 0) {
      setUploadError('Selecciona al menos un destinatario (rol, usuario o para todos)');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('document', file);
      formData.append('is_global', isGlobal);
      formData.append('roles', JSON.stringify(selectedRoles));
      formData.append('users', JSON.stringify(selectedUsers));
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/documents`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess('Documento subido exitosamente');
        setFile(null);
        setSelectedRoles([]);
        setSelectedUsers([]);
        setIsGlobal(false);
        fetchDocuments();
        setTimeout(() => {
          setModalOpen(false);
          setUploadSuccess('');
        }, 1200);
      } else {
        setUploadError(data.message || 'Error al subir documento');
      }
    } catch (err) {
      setUploadError('Error al subir documento');
    } finally {
      setUploading(false);
    }
  };

  const openEditModal = async (doc) => {
    setEditingDoc(doc);
    setEditName(doc.name);
    setEditFile(null);
    setEditIsGlobal(doc.is_global === 1 || doc.is_global === true);
    // Cargar destinatarios actuales
    try {
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/documents/${doc.id}/targets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        // Esperar a que usuarios y roles estén cargados
        if (users.length === 0) {
          await fetchUsersAndRoles();
        }
        // Normalizar tipos y valores
        const normalizedRoles = (data.roles || []).map(r => String(r).trim());
        const normalizedUsers = (data.users || []).map(u => String(u));
        setEditSelectedRoles(roles.filter(r => normalizedRoles.includes(r)));
        setEditSelectedUsers(users.filter(u => normalizedUsers.includes(String(u.id))).map(u => u.id));
      } else {
        setEditSelectedRoles([]);
        setEditSelectedUsers([]);
      }
    } catch {
      setEditSelectedRoles([]);
      setEditSelectedUsers([]);
    }
    setEditModalOpen(true);
  };
  const handleEditRoleToggle = (role) => {
    setEditSelectedRoles(prev => prev.includes(role) ? prev.filter(r => r !== role) : [...prev, role]);
  };
  const handleEditUserToggle = (userId) => {
    setEditSelectedUsers(prev => prev.includes(userId) ? prev.filter(u => u !== userId) : [...prev, userId]);
  };
  const handleEditGlobalChange = (e) => {
    setEditIsGlobal(e.target.checked);
    if (e.target.checked) {
      setEditSelectedRoles([]);
      setEditSelectedUsers([]);
    }
  };
  const handleEditFileChange = (e) => {
    setEditFile(e.target.files[0]);
  };
  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editName) return;
    if (!editIsGlobal && editSelectedRoles.length === 0 && editSelectedUsers.length === 0) {
      setUploadError('Selecciona al menos un destinatario (rol, usuario o para todos)');
      return;
    }
    setUploading(true);
    setUploadError('');
    setUploadSuccess('');
    try {
      const formData = new FormData();
      formData.append('name', editName);
      formData.append('is_global', editIsGlobal);
      formData.append('roles', JSON.stringify(editSelectedRoles));
      formData.append('users', JSON.stringify(editSelectedUsers));
      if (editFile) formData.append('document', editFile);
      const token = localStorage.getItem('authToken');
      const res = await fetch(`${API_URL}/api/documents/${editingDoc.id}`, {
        method: 'PUT',
        headers: { Authorization: `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if (data.success) {
        setUploadSuccess('Documento actualizado exitosamente');
        fetchDocuments();
        setTimeout(() => {
          setEditModalOpen(false);
          setUploadSuccess('');
        }, 1200);
      } else {
        setUploadError(data.message || 'Error al actualizar documento');
      }
    } catch (err) {
      setUploadError('Error al actualizar documento');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-documentos-page" style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'flex-start' }}>
      <div style={{
        width: '100%',
        maxWidth: 1200,
        margin: '56px auto',
        background: 'rgba(30,32,44,0.92)',
        borderRadius: 22,
        boxShadow: '0 6px 32px rgba(0,0,0,0.10)',
        padding: '44px 36px 48px 36px',
        display: 'flex',
        flexDirection: 'column',
        gap: 32
      }}>
        <div className="header-row" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h1 style={{ fontSize: 28, fontWeight: 700, margin: 0 }}>Gestión de Documentos</h1>
          <button className="btn-primary" onClick={() => setModalOpen(true)}>
            + Agregar archivo
          </button>
        </div>

        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Subir documento">
          <form onSubmit={handleUpload}>
            <label style={{ fontWeight: 500 }}>Selecciona un archivo (PDF, Word, Excel):</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx,.xls,.xlsx,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
              onChange={handleFileChange}
              disabled={uploading}
              style={{ margin: '12px 0' }}
            />
            {/* Checkbox para todos */}
            <div className="doc-checkbox-row" style={{ marginBottom: 18 }}>
              <label htmlFor="global-doc" style={{
                display: 'flex', alignItems: 'center',
                background: isGlobal ? 'var(--gradient-primary, #a78bfa)' : 'var(--bg-secondary, #23232b)',
                color: isGlobal ? 'var(--text-white, #fff)' : 'var(--text-primary, #fff)',
                border: isGlobal ? '2px solid var(--gradient-primary, #a78bfa)' : '2px solid var(--border-color, #333)',
                borderRadius: 16,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: isGlobal ? '0 2px 12px rgba(167,139,250,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.18s'
              }}>
                <input type="checkbox" id="global-doc" checked={isGlobal} onChange={handleGlobalChange} style={{ marginRight: 10, width: 20, height: 20, accentColor: '#a78bfa' }} />
                Para todos
              </label>
            </div>
            {/* Multi-select visual de roles */}
            <div className="doc-multiselect-section">
              <label style={{ fontWeight: 500 }}>Asignar a roles:</label>
              <div className="doc-multiselect-list">
                {roles.map(role => (
                  <span
                    key={role}
                    className={`doc-pill ${selectedRoles.includes(role) ? 'selected' : ''}`}
                    onClick={() => !isGlobal && handleRoleToggle(role)}
                    style={{ cursor: isGlobal ? 'not-allowed' : 'pointer' }}
                  >
                    {role}
                  </span>
                ))}
                {roles.length === 0 && <span style={{ color: '#888', fontSize: 13 }}>No hay roles disponibles</span>}
              </div>
            </div>
            {/* Multi-select visual de usuarios */}
            <div className="doc-multiselect-section">
              <label style={{ fontWeight: 500 }}>Asignar a usuarios:</label>
              <div className="doc-multiselect-list">
                {users.map(user => (
                  <span
                    key={user.id}
                    className={`doc-pill ${selectedUsers.includes(user.id) ? 'selected' : ''}`}
                    onClick={() => !isGlobal && handleUserToggle(user.id)}
                    style={{ cursor: isGlobal ? 'not-allowed' : 'pointer' }}
                  >
                    {user.nombre}{user.rol ? ` [${user.rol}]` : ''}
                  </span>
                ))}
                {users.length === 0 && <span style={{ color: '#888', fontSize: 13 }}>No hay usuarios disponibles</span>}
              </div>
            </div>
            {uploadError && <div style={{ color: '#dc2626', marginBottom: 8 }}>{uploadError}</div>}
            {uploadSuccess && <div style={{ color: '#16a34a', marginBottom: 8 }}>{uploadSuccess}</div>}
            <button className="btn-primary" type="submit" disabled={uploading} style={{ width: '100%' }}>
              {uploading ? 'Subiendo...' : 'Subir documento'}
            </button>
          </form>
        </Modal>

        {/* Modal de edición */}
        <Modal isOpen={editModalOpen} onClose={() => setEditModalOpen(false)} title="Editar documento">
          <form onSubmit={handleEditSubmit}>
            <label style={{ fontWeight: 500 }}>Nombre del documento:</label>
            <input type="text" value={editName} onChange={e => setEditName(e.target.value)} style={{ margin: '10px 0', width: '100%' }} />
            <label style={{ fontWeight: 500 }}>Reemplazar archivo (opcional):</label>
            <input type="file" onChange={handleEditFileChange} style={{ margin: '10px 0' }} />
            <div className="doc-checkbox-row" style={{ marginBottom: 18 }}>
              <label htmlFor="edit-global-doc" style={{
                display: 'flex', alignItems: 'center',
                background: editIsGlobal ? 'var(--gradient-primary, #a78bfa)' : 'var(--bg-secondary, #23232b)',
                color: editIsGlobal ? 'var(--text-white, #fff)' : 'var(--text-primary, #fff)',
                border: editIsGlobal ? '2px solid var(--gradient-primary, #a78bfa)' : '2px solid var(--border-color, #333)',
                borderRadius: 16,
                padding: '8px 18px',
                fontWeight: 600,
                fontSize: '1.08rem',
                cursor: 'pointer',
                boxShadow: editIsGlobal ? '0 2px 12px rgba(167,139,250,0.18)' : '0 2px 8px rgba(0,0,0,0.08)',
                transition: 'all 0.18s'
              }}>
                <input type="checkbox" id="edit-global-doc" checked={editIsGlobal} onChange={handleEditGlobalChange} style={{ marginRight: 10, width: 20, height: 20, accentColor: '#a78bfa' }} />
                Para todos
              </label>
            </div>
            <div className="doc-multiselect-section">
              <label style={{ fontWeight: 500 }}>Asignar a roles:</label>
              <div className="doc-multiselect-list">
                {roles.map(role => (
                  <span
                    key={role}
                    className={`doc-pill ${editSelectedRoles.includes(role) ? 'selected' : ''}`}
                    onClick={() => !editIsGlobal && handleEditRoleToggle(role)}
                    style={{ cursor: editIsGlobal ? 'not-allowed' : 'pointer' }}
                  >
                    {role}
                  </span>
                ))}
                {roles.length === 0 && <span style={{ color: '#888', fontSize: 13 }}>No hay roles disponibles</span>}
              </div>
            </div>
            <div className="doc-multiselect-section">
              <label style={{ fontWeight: 500 }}>Asignar a usuarios:</label>
              <div className="doc-multiselect-list">
                {users.map(user => (
                  <span
                    key={user.id}
                    className={`doc-pill ${editSelectedUsers.includes(user.id) ? 'selected' : ''}`}
                    onClick={() => !editIsGlobal && handleEditUserToggle(user.id)}
                    style={{ cursor: editIsGlobal ? 'not-allowed' : 'pointer' }}
                  >
                    {user.nombre}{user.rol ? ` [${user.rol}]` : ''}
                  </span>
                ))}
                {users.length === 0 && <span style={{ color: '#888', fontSize: 13 }}>No hay usuarios disponibles</span>}
              </div>
            </div>
            {uploadError && <div style={{ color: '#dc2626', marginBottom: 8 }}>{uploadError}</div>}
            {uploadSuccess && <div style={{ color: '#16a34a', marginBottom: 8 }}>{uploadSuccess}</div>}
            <button className="btn-primary" type="submit" disabled={uploading} style={{ width: '100%' }}>
              {uploading ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </form>
        </Modal>

        <div className="document-list-section">
          <h2 style={{ marginBottom: 18, fontSize: 22, fontWeight: 600 }}>Documentos subidos</h2>
          {loadingDocs ? (
            <div style={{ padding: 24, textAlign: 'center' }}>Cargando documentos...</div>
          ) : documents.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#888' }}>No hay documentos subidos.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table className="document-table" style={{ width: '100%', borderCollapse: 'separate', borderSpacing: 0, background: 'var(--bg-primary, #18181b)', borderRadius: 16, overflow: 'hidden', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', border: '1px solid var(--border-color, #333)' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary, #23232b)' }}>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Nombre</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Tipo</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Tamaño</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Fecha</th>
                    <th style={{ padding: '12px 10px', textAlign: 'left', fontWeight: 600 }}>Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {documents.map(doc => (
                    <tr key={doc.id} style={{ borderBottom: '1px solid var(--border-color, #333)' }}>
                      <td style={{ padding: '10px 10px' }}>{doc.name}</td>
                      <td style={{ padding: '10px 10px' }}>{doc.mimetype.split('/')[1]}</td>
                      <td style={{ padding: '10px 10px' }}>{(doc.size / 1024).toFixed(1)} KB</td>
                      <td style={{ padding: '10px 10px' }}>{new Date(doc.created_at).toLocaleString('es-CO', { hour12: false })}</td>
                      <td style={{ padding: '10px 10px' }}>
                        <a
                          href={`${API_URL}/uploads/documents/${doc.filename}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary"
                          style={{ marginRight: 10 }}
                        >
                          Ver/Descargar
                        </a>
                        <button className="btn-edit" title="Editar" onClick={() => openEditModal(doc)}>
                          <FaEdit />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDocumentos;
