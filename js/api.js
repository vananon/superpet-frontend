
async function fetchAPI(endpoint, options = {}) {
  const token = localStorage.getItem('pawvlog_token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` }),
    ...options.headers
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición a la API');
    }

    return data;
  } catch (error) {
    console.error(`[API Error] ${endpoint}:`, error);
    throw error;
  }
}

async function checkUserExists(username) {
  const users = await fetchAPI('/users');
  return users.some(u => u.nombre_usuario === username || u.email === username);
}

async function loginUser(identifier, password) {
  const isEmail = identifier.includes('@');
  const payload = { password };

  if (isEmail) {
    payload.email = identifier;
  } else {
    payload.username = identifier;
  }

  return fetchAPI('/users/login', {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

async function registerUser(userData) {
  return fetchAPI('/users/register', {
    method: 'POST',
    body: JSON.stringify(userData)
  });
}

async function getUserProfile(userId) {
  return fetchAPI(`/users/${userId}`);
}

async function updatePetBio(userId, petId, bio) {
  return fetchAPI(`/users/${userId}/pets/${petId}`, {
    method: 'PUT',
    body: JSON.stringify({ bio })
  });
}


async function getPosts() {
  return fetchAPI('/posts');
}

async function createPost(postData) {
  return fetchAPI('/posts', {
    method: 'POST',
    body: JSON.stringify(postData)
  });
}

async function likePost(postId, userId) {
  return fetchAPI('/interactions', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario: userId,
      tipo_interaccion: 'like',
      entidad_destino_id: postId
    })
  });
}

async function getPostComments(postId) {
  return fetchAPI(`/posts/${postId}/comments`);
}

async function addComment(commentData) {
  return fetchAPI('/comments', {
    method: 'POST',
    body: JSON.stringify(commentData)
  });
}

async function followPet(userId, targetPetName) {
  return fetchAPI('/interactions', {
    method: 'POST',
    body: JSON.stringify({
      id_usuario: userId,
      tipo_interaccion: 'follow',
      entidad_destino_id: targetPetName
    })
  });
}

async function getInteractions() {
  return fetchAPI('/interactions');
}

async function unfollowPet(interactionId) {
  return fetchAPI(`/interactions/${interactionId}`, {
    method: 'DELETE'
  });
}

window.PawvlogAPI = {
  checkUserExists,
  loginUser,
  registerUser,
  getUserProfile,
  updatePetBio,
  getPosts,
  createPost,
  likePost,
  getPostComments,
  addComment,
  followPet,
  getInteractions,
  unfollowPet,
  API_BASE_URL
};
