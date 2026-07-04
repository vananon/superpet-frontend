(function () {
  const feed = document.getElementById('feed');
  const postText = document.getElementById('postText');
  const postBtn = document.getElementById('postBtn');
  const fileInput = document.getElementById('fileInput');
  const addPhotoBtn = document.getElementById('addPhotoBtn');
  const photoPreview = document.getElementById('photoPreview');
  const photoPreviewImg = document.getElementById('photoPreviewImg');
  const removePhoto = document.getElementById('removePhoto');
  const chips = document.querySelectorAll('.pet-chip');
  const logoutBtn = document.getElementById('logoutBtn');

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      localStorage.removeItem('pawvlog_token');
      window.location.href = 'pawvlog-landing.html';
    });
  }

  let attachedPhoto = null;
  let selectedPets = [];
  let globalInteractions = [];
  let myDogs = [
    { id: 1, name: 'Yuna', breed: 'Shiba Inu', age: '24', interests: '#friendly #sunspot', color: 'var(--pet-1)', initials: 'Y', followers: 125, bio: 'Amo dormir al sol y comer premios.' },
    { id: 2, name: 'Sky', breed: 'Border Collie', age: '36', interests: '#exploring #fetch', color: 'var(--pet-2)', initials: 'S', followers: 340, bio: 'Correr es mi pasión.' },
    { id: 3, name: 'Thea', breed: 'Golden Retriever', age: '12', interests: '#eating #friendly', color: 'var(--pet-3)', initials: 'T', followers: 89, bio: '' },
    { id: 4, name: 'Gibby', breed: 'Dachshund', age: '48', interests: '#napping #eating', color: 'var(--pet-4)', initials: 'G', followers: 210, bio: '' }
  ];

  let seedPosts = [];

  function updatePostBtn() {
    postBtn.disabled = !(postText.value.trim().length || attachedPhoto);
  }

  postText.addEventListener('input', () => {
    postText.style.height = 'auto';
    postText.style.height = postText.scrollHeight + 'px';
    updatePostBtn();
  });

  addPhotoBtn.addEventListener('click', () => fileInput.click());

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      attachedPhoto = ev.target.result;
      photoPreviewImg.src = attachedPhoto;
      photoPreview.style.display = 'block';
      updatePostBtn();
    };
    reader.readAsDataURL(file);
  });

  removePhoto.addEventListener('click', () => {
    attachedPhoto = null;
    fileInput.value = '';
    photoPreview.style.display = 'none';
    updatePostBtn();
  });

  function attachChipListeners() {
    const chipBtns = document.querySelectorAll('.pet-chip');
    chipBtns.forEach(chip => {
      chip.addEventListener('click', () => {
        const pet = chip.dataset.pet;
        chip.classList.toggle('selected');
        if (selectedPets.includes(pet)) {
          selectedPets = selectedPets.filter(p => p !== pet);
        } else {
          selectedPets.push(pet);
        }
      });
    });
  }

  function pawSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.6l-1-1a5.5 5.5 0 10-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.6z"/></svg>';
  }
  function commentSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 11.5a8.38 8.38 0 01-8.5 8.5 8.5 8.5 0 01-4-1l-4.5 1 1-4.5a8.5 8.5 0 1116-4z"/></svg>';
  }
  function saveSvg() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M19 21l-7-5-7 5V5a2 2 0 012-2h10a2 2 0 012 2z"/></svg>';
  }

  function renderPost(post, index) {
    const el = document.createElement('article');
    el.className = 'post';
    const tagsHtml = post.tags.map(t => `<span class="mini-tag">${t}</span>`).join('');

    let isFollowing = false;
    let followInteractionId = null;
    const userId = localStorage.getItem('pawvlog_user_id');

    if (globalInteractions.length > 0) {
      const myDogIds = myDogs.map(d => d.id);
      if (userId) myDogIds.push(userId);

      const followObj = globalInteractions.find(i =>
        i.tipo_interaccion === 'follow' &&
        i.entidad_destino_id === post.name &&
        myDogIds.includes(i.id_usuario)
      );

      if (followObj) {
        isFollowing = true;
        followInteractionId = followObj._id;
      }
    }

    const isMyOwnPost = myDogs.some(d => d.name === post.name);

    el.innerHTML = `
      <div class="post-head">
        <div class="av" style="background:${post.color}">${post.initials}</div>
        <div class="who">
          <div class="name" style="display:flex; align-items:center;">
            ${post.name}
            ${(!isMyOwnPost && post.name !== 'Desconocido') ?
        `<button class="btn-follow-post" data-target="${post.name}" data-isfollowing="${isFollowing}" data-interactionid="${followInteractionId}">${isFollowing ? 'Dejar de seguir' : 'Seguir'}</button>` : ''}
          </div>
          <div class="meta">${post.time}</div>
        </div>
        <div class="post-tags">${tagsHtml}</div>
      </div>
      ${post.text ? `<div class="post-text">${post.text}</div>` : ''}
      ${post.photo ? `<div class="post-photo"><img src="${post.photo}" alt="Foto del post"></div>` : ''}
      <div class="post-actions">
        <button class="pa-btn like-btn" data-i="${index}">${pawSvg()}<span>${post.likes}</span></button>
        <button class="pa-btn comment-toggle-btn" data-i="${index}" data-postid="${post._id}">${commentSvg()}<span>${post.comentarios_count || 0}</span></button>
        <button class="pa-btn save-btn" data-i="${index}">${saveSvg()}<span>Guardar</span></button>
      </div>
      <div class="comments-section" id="comments-section-${index}" style="display: none;">
        <div class="comments-list" id="comments-list-${index}">
          <div style="padding: 10px; color: var(--ink-soft); font-size: 0.9rem;">Cargando comentarios...</div>
        </div>
        <div class="comment-form">
          <select class="comment-pet-select" id="comment-pet-${index}">
            <option value="">¿Quién comenta?</option>
            ${myDogs.map(d => `<option value="${d.name}">${d.name}</option>`).join('')}
          </select>
          <input type="text" class="comment-input" id="comment-input-${index}" placeholder="Escribe un comentario...">
          <button class="btn btn-primary btn-sm comment-submit-btn" data-i="${index}" data-postid="${post._id}">Enviar</button>
        </div>
      </div>
    `;
    return el;
  }

  async function renderAll() {
    feed.innerHTML = '';
    seedPosts.forEach((p, i) => feed.appendChild(renderPost(p, i)));
    attachInteractions();
  }

  function attachInteractions() {
    document.querySelectorAll('.like-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        const post = seedPosts[i];
        post.liked = !post.liked;
        post.likes += post.liked ? 1 : -1;
        btn.classList.toggle('liked', post.liked);
        btn.querySelector('span').textContent = post.likes;
      });
    });
    document.querySelectorAll('.save-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const i = +btn.dataset.i;
        seedPosts[i].saved = !seedPosts[i].saved;
        btn.classList.toggle('saved', seedPosts[i].saved);
      });
    });

    document.querySelectorAll('.comment-toggle-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = btn.dataset.i;
        const postId = btn.dataset.postid;
        const section = document.getElementById(`comments-section-${index}`);
        const list = document.getElementById(`comments-list-${index}`);

        if (section.style.display === 'none') {
          section.style.display = 'block';
          if (postId && window.PawvlogAPI) {
            try {
              const comments = await window.PawvlogAPI.getPostComments(postId);
              if (comments.length === 0) {
                list.innerHTML = '<div style="padding: 10px; color: var(--ink-soft); font-size: 0.9rem;">Sé el primero en comentar.</div>';
              } else {
                list.innerHTML = comments.map(c => `
                  <div class="comment-item">
                    <div class="comment-av">${(c.handle_usuario || 'U').charAt(0).toUpperCase()}</div>
                    <div class="comment-content">
                      <div class="comment-who">
                        ${c.handle_usuario || 'Usuario'}
                        <button class="btn-follow-comment" data-target="${c.handle_usuario}" data-index="${index}">Seguir</button>
                      </div>
                      <div class="comment-text">${c.texto}</div>
                    </div>
                  </div>
                `).join('');

                list.querySelectorAll('.btn-follow-comment').forEach(btn => {
                  btn.addEventListener('click', async (e) => {
                    const targetPet = e.target.dataset.target;
                    const idx = e.target.dataset.index;
                    const petSelect = document.getElementById(`comment-pet-${idx}`);
                    const myPet = petSelect.value;

                    if (!myPet) {
                      alert("Selecciona a tu mascota en la lista de abajo para saber quién va a seguir a " + targetPet);
                      return;
                    }
                    if (myPet === targetPet) {
                      alert("No puedes seguirte a ti mismo.");
                      return;
                    }

                    try {
                      e.target.disabled = true;
                      e.target.textContent = 'Siguiendo...';
                      const userId = localStorage.getItem('pawvlog_user_id') || 'local_user';
                      const myPetObj = myDogs.find(d => d.name === myPet);
                      const followerId = myPetObj ? myPetObj.id : userId;
                      const newFollow = await window.PawvlogAPI.followPet(followerId, targetPet);
                      
                      if(newFollow && newFollow._id) {
                        globalInteractions.push(newFollow);
                      }
                      e.target.textContent = 'Siguiendo ✓';
                    } catch (err) {
                      alert("Error al seguir");
                      e.target.textContent = 'Seguir';
                    } finally {
                      e.target.disabled = false;
                    }
                  });
                });
              }
            } catch (e) {
              list.innerHTML = '<div style="padding: 10px; color: var(--red); font-size: 0.9rem;">Error al cargar comentarios.</div>';
            }
          } else {
            list.innerHTML = '<div style="padding: 10px; color: var(--ink-soft); font-size: 0.9rem;">Modo sin conexión.</div>';
          }
        } else {
          section.style.display = 'none';
        }
      });
    });

    document.querySelectorAll('.comment-submit-btn').forEach(btn => {
      btn.addEventListener('click', async () => {
        const index = btn.dataset.i;
        const postId = btn.dataset.postid;
        const petSelect = document.getElementById(`comment-pet-${index}`);
        const textInput = document.getElementById(`comment-input-${index}`);

        const petName = petSelect.value;
        const text = textInput.value.trim();

        if (!petName) {
          alert("Debes seleccionar una mascota para comentar.");
          return;
        }
        if (!text) return;

        if (postId && window.PawvlogAPI) {
          btn.disabled = true;
          try {
            const userId = localStorage.getItem('pawvlog_user_id');
            const newComment = await window.PawvlogAPI.addComment({
              id_publicacion: postId,
              id_usuario: userId || 'local_user',
              handle_usuario: petName,
              texto: text
            });

            const list = document.getElementById(`comments-list-${index}`);
            const isFirst = list.innerHTML.includes('Sé el primero');
            const commentHtml = `
              <div class="comment-item">
                <div class="comment-av">${petName.charAt(0).toUpperCase()}</div>
                <div class="comment-content">
                  <div class="comment-who">${petName}</div>
                  <div class="comment-text">${text}</div>
                </div>
              </div>
            `;
            if (isFirst) {
              list.innerHTML = commentHtml;
            } else {
              list.insertAdjacentHTML('afterbegin', commentHtml);
            }
            const countSpan = document.querySelector(`.comment-toggle-btn[data-i="${index}"] span`);
            countSpan.textContent = parseInt(countSpan.textContent || 0) + 1;

            textInput.value = '';
          } catch (e) {
            alert("Error al enviar comentario.");
          } finally {
            btn.disabled = false;
          }
        }
      });
    });

    document.querySelectorAll('.btn-follow-post').forEach(btn => {
      btn.addEventListener('click', async (e) => {
        const targetPet = e.target.dataset.target;
        const isFollowing = e.target.dataset.isfollowing === 'true';
        const interactionId = e.target.dataset.interactionid;

        try {
          e.target.disabled = true;

          if (isFollowing) {
            e.target.textContent = 'Dejando de seguir...';
            if (interactionId && interactionId !== 'null') {
              await window.PawvlogAPI.unfollowPet(interactionId);
              // Optimistic Update
              globalInteractions = globalInteractions.filter(i => i._id !== interactionId);
              e.target.dataset.isfollowing = 'false';
              e.target.dataset.interactionid = 'null';
              e.target.textContent = 'Seguir';
            }
          } else {
            let myPetObj = myDogs.length > 0 ? myDogs[0] : null;
            if (myDogs.length > 1) {
              const petNames = myDogs.map(d => d.name).join(', ');
              const chosen = prompt(`Tienes varias mascotas: ${petNames}.\n¿Qué mascota tuya va a seguir a ${targetPet}?`, myDogs[0].name);
              if (!chosen) {
                e.target.disabled = false;
                return;
              }
              myPetObj = myDogs.find(d => d.name.toLowerCase() === chosen.toLowerCase());
              if (!myPetObj) {
                alert('Nombre de mascota no válido.');
                e.target.disabled = false;
                return;
              }
            }

            if (!myPetObj && !localStorage.getItem('pawvlog_user_id')) {
              alert("Debes tener al menos una mascota en tu perfil para poder seguir a otros.");
              e.target.disabled = false;
              return;
            }

            e.target.textContent = 'Siguiendo...';
            const followerId = myPetObj ? myPetObj.id : localStorage.getItem('pawvlog_user_id');
            const newFollow = await window.PawvlogAPI.followPet(followerId, targetPet);
            
            // Optimistic Update
            if(newFollow && newFollow._id) {
              globalInteractions.push(newFollow);
              e.target.dataset.interactionid = newFollow._id;
            }
            e.target.dataset.isfollowing = 'true';
            e.target.textContent = 'Dejar de seguir';
          }
        } catch (err) {
          alert(isFollowing ? "Error al dejar de seguir" : "Error al seguir");
          e.target.textContent = isFollowing ? 'Dejar de seguir' : 'Seguir';
        } finally {
          e.target.disabled = false;
        }
      });
    });
  }

  postBtn.addEventListener('click', async () => {
    const text = postText.value.trim();
    if (!text && !attachedPhoto) return;

    if (selectedPets.length === 0) {
      alert("Por favor etiqueta a una mascota para publicar.");
      return;
    }

    const selectedPet = myDogs.find(d => d.name === selectedPets[0]);
    if (!selectedPet) {
      alert("Mascota no válida.");
      return;
    }

    postBtn.disabled = true;
    postBtn.textContent = 'Publicando...';

    try {
      if (window.PawvlogAPI) {
        const postData = {
          id_mascota: selectedPet.id,
          autor: {
            nombre_mascota: selectedPet.name,
            foto_mascota: '',
            usuario_handle: localStorage.getItem('pawvlog_user_id') || 'usuario_local'
          },
          tipo: attachedPhoto ? 'foto' : 'texto',
          contenido_texto: text,
          media_url: attachedPhoto ? [attachedPhoto] : []
        };

        await window.PawvlogAPI.createPost(postData);
        await loadInitialData();
      } else {
        const newPost = {
          _id: 'local_' + Date.now(),
          name: selectedPet.name,
          initials: selectedPet.initials,
          color: selectedPet.color,
          tags: selectedPets.map(p => '#' + p),
          time: 'ahora',
          text: text,
          photo: attachedPhoto,
          likes: 0,
          liked: false,
          saved: false,
          comentarios_count: 0
        };
        seedPosts.unshift(newPost);
        renderAll();
      }

      postText.value = '';
      postText.style.height = 'auto';
      attachedPhoto = null;
      fileInput.value = '';
      photoPreview.style.display = 'none';
      selectedPets = [];
      document.querySelectorAll('.pet-chip').forEach(c => c.classList.remove('selected'));
      updatePostBtn();
    } catch (e) {
      alert('Error al publicar. Inténtalo de nuevo.');
    } finally {
      postBtn.textContent = 'Publicar';
      updatePostBtn();
    }
  });

  const sideLinks = document.querySelectorAll('.side-link[data-view]');
  const homeView = document.getElementById('homeView');
  const profileView = document.getElementById('profileView');
  const mainTitle = document.getElementById('mainTitle');
  const profileList = document.getElementById('profileList');
  const dogDetail = document.getElementById('dogDetail');
  const dogDetailCard = document.getElementById('dogDetailCard');
  const backToProfileList = document.getElementById('backToProfileList');

  const notificationsView = document.getElementById('notificationsView');
  const searchView = document.getElementById('searchView');
  const messagingView = document.getElementById('messagingView');
  const settingsView = document.getElementById('settingsView');

  const allViews = [homeView, profileView, notificationsView, searchView, messagingView, settingsView];
  const mockNotifications = [
    { text: 'A <strong>Milo</strong> le gustó la foto de <strong>Yuna</strong>.', time: 'hace 5 min', icon: 'M', color: 'var(--pet-3)' },
    { text: '<strong>Pepper</strong> comentó: ¡Qué lindo día para pasear!', time: 'hace 1 hora', icon: 'P', color: 'var(--pet-7)' },
    { text: '<strong>Nube</strong> comenzó a seguir a tu manada.', time: 'hace 3 horas', icon: 'N', color: 'var(--pet-5)' },
    { text: 'A <strong>Thea</strong> y 3 más les gustó tu post reciente.', time: 'ayer', icon: 'T', color: 'var(--pet-4)' }
  ];

  const mockExplore = [
    { tag: '#friendly', count: '12.4k posts' },
    { tag: '#goldenretriever', count: '8.2k posts' },
    { tag: '#parque', count: '5.1k posts' },
    { tag: '#zoomies', count: '4.8k posts' }
  ];

  const mockChats = [
    { name: 'Milo (Golden)', preview: '¡Nos vemos en el parque a las 5!', time: '14:20', unread: true, icon: 'M', color: 'var(--pet-3)' },
    { name: 'Pepper & Co.', preview: 'Llevo los premios 🦴', time: 'Ayer', unread: false, icon: 'P', color: 'var(--pet-7)' },
    { name: 'Nube', preview: 'Jajaja sí, le encantó.', time: 'Lun', unread: false, icon: 'N', color: 'var(--pet-5)' }
  ];

  function hideAllViews() {
    allViews.forEach(v => {
      if (v) v.style.display = 'none';
    });
  }

  sideLinks.forEach(link => {
    link.addEventListener('click', () => {
      sideLinks.forEach(l => l.classList.remove('active'));
      link.classList.add('active');

      hideAllViews();
      const view = link.dataset.view;

      switch (view) {
        case 'home':
          homeView.style.display = 'block';
          mainTitle.textContent = 'Home';
          break;
        case 'profile':
          profileView.style.display = 'block';
          mainTitle.textContent = 'Profile';
          showProfileList();
          break;
        case 'notifications':
          notificationsView.style.display = 'block';
          mainTitle.textContent = 'Notifications';
          renderNotifications();
          break;
        case 'search':
          searchView.style.display = 'block';
          mainTitle.textContent = 'Search';
          renderSearch();
          break;
        case 'messaging':
          messagingView.style.display = 'block';
          mainTitle.textContent = 'Messaging';
          renderChats();
          break;
        case 'settings':
          settingsView.style.display = 'block';
          mainTitle.textContent = 'Settings';
          break;
      }
    });
  });

  function showProfileList() {
    profileList.style.display = 'grid';
    dogDetail.style.display = 'none';

    profileList.innerHTML = '';
    myDogs.forEach(dog => {
      const card = document.createElement('div');
      card.className = 'dog-card';
      card.innerHTML = `
        <div class="av" style="background:${dog.color}">${dog.initials}</div>
        <div class="name">${dog.name}</div>
        <div class="breed">${dog.breed}</div>
      `;
      card.addEventListener('click', () => showDogDetail(dog));
      profileList.appendChild(card);
    });
  }

  function showDogDetail(dog) {
    profileList.style.display = 'none';
    dogDetail.style.display = 'block';

    dogDetailCard.innerHTML = `
      <div class="dd-header">
        <div class="dd-avatar-wrap">
          <div class="dd-avatar" style="background:${dog.color}">${dog.initials}</div>
          <button class="change-photo-btn" title="Cambiar foto">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path><circle cx="12" cy="13" r="4"></circle></svg>
          </button>
        </div>
        <div class="dd-title">
          <h2>${dog.name}</h2>
          <div class="dd-followers">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="16" height="16"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>
            ${dog.followers} seguidores
          </div>
        </div>
      </div>

      <div class="dd-info-grid">
        <div class="dd-info-item">
          <label>Raza</label>
          <div class="val">${dog.breed}</div>
        </div>
        <div class="dd-info-item">
          <label>Edad</label>
          <div class="val">${dog.age} meses</div>
        </div>
        <div class="dd-info-item" style="grid-column: span 2;">
          <label>Intereses</label>
          <div class="val" style="color: var(--red);">${dog.interests}</div>
        </div>
      </div>

      <div class="dd-bio">
        <div class="dd-bio-head">
          <h3>Biografía</h3>
          <button class="edit-bio-btn" id="editBioBtn">${dog.bio ? 'Editar' : 'Añadir Bio'}</button>
        </div>
        <div class="bio-content" id="bioContent">
          ${dog.bio ? dog.bio : '<em style="color:var(--ink-faint);">Aún no hay biografía. ¡Cuéntanos sobre ' + dog.name + '!</em>'}
        </div>
        <div class="bio-editor" id="bioEditor">
          <textarea id="bioInput" placeholder="Escribe algo sobre ${dog.name}...">${dog.bio}</textarea>
          <div class="bio-editor-actions">
            <button class="btn-cancel-bio" id="cancelBioBtn">Cancelar</button>
            <button class="btn-save-bio" id="saveBioBtn">Guardar</button>
          </div>
        </div>
      </div>
      
      <div class="dd-following" style="margin-top: 24px;">
        <button id="btnViewFollowing" class="btn btn-secondary btn-sm" style="background:var(--gray-lighter); border:none; color:var(--ink); padding:8px 16px; border-radius:20px; cursor:pointer; font-weight:600;">Ver seguidos</button>
        <div id="followingList" class="following-list" style="display:none; margin-top: 12px; max-height:200px; overflow-y:auto; border-radius:12px; background:var(--gray-light); padding:10px;"></div>
      </div>
    `;

    const editBioBtn = document.getElementById('editBioBtn');
    const bioContent = document.getElementById('bioContent');
    const bioEditor = document.getElementById('bioEditor');
    const bioInput = document.getElementById('bioInput');
    const cancelBioBtn = document.getElementById('cancelBioBtn');
    const saveBioBtn = document.getElementById('saveBioBtn');

    editBioBtn.addEventListener('click', () => {
      bioContent.style.display = 'none';
      editBioBtn.style.display = 'none';
      bioEditor.style.display = 'flex';
      bioInput.focus();
    });

    cancelBioBtn.addEventListener('click', () => {
      bioContent.style.display = 'block';
      editBioBtn.style.display = 'block';
      bioEditor.style.display = 'none';
    });

    saveBioBtn.addEventListener('click', () => {
      dog.bio = bioInput.value.trim();

      if (dog.bio) {
        bioContent.textContent = dog.bio;
        editBioBtn.textContent = 'Editar';
      } else {
        bioContent.innerHTML = '<em style="color:var(--ink-faint);">Aún no hay biografía. ¡Cuéntanos sobre ' + dog.name + '!</em>';
        editBioBtn.textContent = 'Añadir Bio';
      }

      bioContent.style.display = 'block';
      editBioBtn.style.display = 'block';
      bioEditor.style.display = 'none';
    });

    const btnViewFollowing = document.getElementById('btnViewFollowing');
    const followingList = document.getElementById('followingList');
    if (btnViewFollowing) {
      btnViewFollowing.addEventListener('click', async () => {
        if (followingList.style.display === 'none') {
          followingList.style.display = 'block';
          followingList.innerHTML = '<div style="color:var(--ink-soft); font-size:0.9rem;">Cargando...</div>';
          try {
            if (window.PawvlogAPI) {
              const allInteractions = await window.PawvlogAPI.getInteractions();
              const follows = allInteractions.filter(i => i.tipo_interaccion === 'follow' && i.id_usuario === dog.id);
              if (follows.length > 0) {
                const uniqueFollows = [...new Set(follows.map(f => f.entidad_destino_id))];
                followingList.innerHTML = uniqueFollows.map(name => `
                  <div class="following-item" style="display:flex; align-items:center; gap:10px; margin-bottom:8px; padding:6px; background:#fff; border-radius:8px;">
                    <div class="following-av" style="width:28px; height:28px; background:var(--ink); color:#fff; border-radius:50%; display:flex; align-items:center; justify-content:center; font-weight:bold; font-size:0.8rem;">${name.charAt(0).toUpperCase()}</div>
                    <div class="following-name" style="font-size:0.9rem; font-weight:600; color:var(--ink);">${name}</div>
                  </div>
                `).join('');
              } else {
                followingList.innerHTML = '<div style="color:var(--ink-soft); font-size:0.9rem; padding:8px;">No sigue a nadie aún.</div>';
              }
            } else {
              followingList.innerHTML = '<div style="color:var(--ink-soft); font-size:0.9rem; padding:8px;">Modo sin conexión.</div>';
            }
          } catch (e) {
            followingList.innerHTML = '<div style="color:var(--red); font-size:0.9rem; padding:8px;">Error al cargar.</div>';
          }
        } else {
          followingList.style.display = 'none';
        }
      });
    }
  }

  backToProfileList.addEventListener('click', showProfileList);

  const petColors = ['var(--pet-1)', 'var(--pet-2)', 'var(--pet-3)', 'var(--pet-4)', 'var(--pet-5)', 'var(--pet-6)'];

  function renderTags() {
    const tagRow = document.getElementById('tagRow');
    if (tagRow) {
      const tagsHtml = myDogs.map((d, i) => {
        const color = d.color || petColors[i % petColors.length];
        return `<button class="pet-chip" data-pet="${d.name}" data-color="${color}"><span class="dot" style="background:${color}"></span>${d.name}</button>`;
      }).join('');
      tagRow.innerHTML = `<span class="label">Etiquetar:</span>` + tagsHtml;
      attachChipListeners();
    }
  }

  async function loadInitialData() {
    try {
      if (window.PawvlogAPI) {
        const postsResponse = await window.PawvlogAPI.getPosts();
        try {
          globalInteractions = await window.PawvlogAPI.getInteractions();
        } catch (err) {
          console.warn("No se pudieron cargar interacciones.");
        }

        if (postsResponse && postsResponse.length > 0) {
          seedPosts = postsResponse.map((p, i) => ({
            _id: p._id,
            name: (p.autor && p.autor.nombre_mascota) ? p.autor.nombre_mascota : 'Desconocido',
            initials: (p.autor && p.autor.nombre_mascota) ? p.autor.nombre_mascota.charAt(0).toUpperCase() : '?',
            color: petColors[i % petColors.length],
            tags: [],
            time: p.fecha_publicacion ? new Date(p.fecha_publicacion).toLocaleDateString() : 'ahora',
            text: p.contenido_texto || '',
            photo: (p.media_url && p.media_url.length > 0) ? p.media_url[0] : null,
            likes: p.likes_count || 0,
            comentarios_count: p.comentarios_count || 0,
            liked: false,
            saved: false
          }));
        }

        const userId = localStorage.getItem('pawvlog_user_id');
        if (userId) {
          const profile = await window.PawvlogAPI.getUserProfile(userId);
          if (profile) {
            const sideUserName = document.querySelector('.side-user .name');
            const sideUserSub = document.querySelector('.side-user .sub');
            const sideUserAv = document.querySelector('.side-user .av');
            if (sideUserName) sideUserName.textContent = profile.nombre_usuario || profile.email;
            if (sideUserSub) sideUserSub.textContent = `@${profile.nombre_usuario || profile.email.split('@')[0]} · ${profile.pets ? profile.pets.length : 0} perros`;
            if (sideUserAv) sideUserAv.textContent = (profile.nombre_usuario || profile.email).substring(0, 2).toUpperCase();

            if (profile.pets) {
              myDogs = profile.pets.map((p, i) => ({
                id: p._id,
                name: p.nombre,
                breed: p.raza || 'Desconocida',
                age: p.edad_meses || 0,
                interests: p.intereses ? p.intereses.map(int => '#' + int).join(' ') : '',
                color: petColors[i % petColors.length],
                initials: p.nombre ? p.nombre.charAt(0).toUpperCase() : 'P',
                followers: p.seguidores_count || 0,
                bio: ''
              }));
            }
          }
        }
      }
    } catch (e) {
      console.warn("La API no está disponible o el usuario no existe. Mostrando datos simulados (Fallback).");
    } finally {
      renderTags();
      renderAll();
    }
  }

  loadInitialData();

  function renderNotifications() {
    const notifList = document.getElementById('notificationsList');
    if (!notifList.innerHTML) {
      notifList.innerHTML = mockNotifications.map(n => `
        <div class="notification-item">
          <div class="notif-icon" style="background:${n.color}">${n.icon}</div>
          <div class="notif-content">
            <div>${n.text}</div>
            <div class="notif-time">${n.time}</div>
          </div>
        </div>
      `).join('');
    }
  }

  function renderSearch() {
    const searchRes = document.getElementById('searchResults');
    if (!searchRes.innerHTML) {
      searchRes.innerHTML = `
        <div class="search-section">
          <h3>Explorar tendencias</h3>
          <div class="explore-grid">
            ${mockExplore.map(e => `
              <div class="explore-card">
                <div style="font-weight:700; color:var(--red); font-size:1.1rem; margin-bottom:4px;">${e.tag}</div>
                <div style="font-size:0.8rem; color:var(--ink-soft);">${e.count}</div>
              </div>
            `).join('')}
          </div>
        </div>
      `;
    }
  }

  function renderChats() {
    const chatList = document.getElementById('chatList');
    if (!chatList.innerHTML) {
      chatList.innerHTML = mockChats.map(c => `
        <div class="chat-item ${c.unread ? 'unread' : ''}">
          <div class="chat-av" style="background:${c.color}">
            ${c.icon}
            ${c.unread ? '<div class="chat-unread-dot"></div>' : ''}
          </div>
          <div class="chat-info">
            <div class="chat-info-top">
              <div class="chat-name">${c.name}</div>
              <div class="chat-time">${c.time}</div>
            </div>
            <div class="chat-preview">${c.preview}</div>
          </div>
        </div>
      `).join('');
    }
  }

  document.querySelectorAll('.btn-follow-suggested').forEach(btn => {
    btn.addEventListener('click', async (e) => {
      const targetPet = e.target.dataset.target;

      let myPetObj = myDogs.length > 0 ? myDogs[0] : null;
      if (myDogs.length > 1) {
        const petNames = myDogs.map(d => d.name).join(', ');
        const chosen = prompt(`Tienes varias mascotas: ${petNames}.\n¿Qué mascota tuya va a seguir a ${targetPet}?`, myDogs[0].name);
        if (!chosen) return;
        myPetObj = myDogs.find(d => d.name.toLowerCase() === chosen.toLowerCase());
        if (!myPetObj) {
          alert('Nombre de mascota no válido.');
          return;
        }
      }

      if (!myPetObj && !localStorage.getItem('pawvlog_user_id')) {
        alert("Debes tener al menos una mascota en tu perfil para poder seguir a otros.");
        return;
      }

      try {
        e.target.disabled = true;
        e.target.textContent = 'Siguiendo...';
        const followerId = myPetObj ? myPetObj.id : localStorage.getItem('pawvlog_user_id');
        const newFollow = await window.PawvlogAPI.followPet(followerId, targetPet);
        
        if(newFollow && newFollow._id) {
          globalInteractions.push(newFollow);
        }
        e.target.textContent = 'Siguiendo ✓';
      } catch (err) {
        alert("Error al seguir");
        e.target.textContent = 'Seguir';
      } finally {
        e.target.disabled = false;
      }
    });
  });

  renderAll();
})();
