document.addEventListener('DOMContentLoaded', () => {
  const container = document.getElementById('dogsContainer');
  const addBtn = document.getElementById('addDogBtn');
  let dogCount = 1;

  addBtn.addEventListener('click', () => {
    dogCount++;
    const dogEntry = document.createElement('div');
    dogEntry.className = 'dog-entry';
    dogEntry.innerHTML = `
      <div class="dog-entry-header">
        <span>Perrito #${dogCount}</span>
        <button type="button" class="remove-dog" aria-label="Quitar perrito">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>
      <div class="dog-grid">
        <div class="form-group">
          <label>Nombre del perro</label>
          <input type="text" placeholder="Ej. Yuna" required>
        </div>
        <div class="form-group">
          <label>Raza</label>
          <input type="text" placeholder="Ej. Shiba Inu" required>
        </div>
        <div class="form-group">
          <label>Edad (meses)</label>
          <input type="number" min="0" placeholder="Ej. 24" required>
        </div>
        <div class="form-group">
          <label>Intereses</label>
          <select required>
            <option value="">Selecciona uno...</option>
            <option value="friendly">#friendly</option>
            <option value="exploring">#exploring</option>
            <option value="eating">#eating</option>
            <option value="napping">#napping</option>
            <option value="fetch">#fetch</option>
            <option value="sunspot">#sunspot</option>
          </select>
        </div>
      </div>
    `;
    const removeBtn = dogEntry.querySelector('.remove-dog');
    removeBtn.addEventListener('click', () => {
      dogEntry.remove();
      updateDogHeaders();
    });

    container.appendChild(dogEntry);
  });

  function updateDogHeaders() {
    const entries = container.querySelectorAll('.dog-entry');
    entries.forEach((entry, index) => {
      const header = entry.querySelector('.dog-entry-header span');
      if (header) {
        header.textContent = `Perrito #${index + 1}`;
      }
    });
    dogCount = entries.length;
  }

  const form = document.querySelector('form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const username = document.getElementById('username').value;
      const email = document.getElementById('email').value;
      const password = document.getElementById('password').value;
      const btn = form.querySelector('button[type="submit"]');

      const pets = [];
      const dogEntries = document.querySelectorAll('.dog-entry');
      dogEntries.forEach(entry => {
        const inputs = entry.querySelectorAll('input, select');
        if (inputs.length >= 4) {
          pets.push({
            nombre: inputs[0].value,
            raza: inputs[1].value,
            edad_meses: Number(inputs[2].value),
            intereses: [inputs[3].value]
          });
        }
      });

      const userData = {
        nombre_usuario: username,
        email: email,
        password: password,
        pets: pets
      };

      btn.textContent = 'Creando manada...';
      btn.disabled = true;

      try {
        const existingError = document.getElementById('register-error');
        if (existingError) existingError.remove();

        if (window.PawvlogAPI) {
          const res = await window.PawvlogAPI.registerUser(userData);
          if (res && res.token) {
            localStorage.setItem('pawvlog_token', res.token);
            if (res.user && res.user._id) {
              localStorage.setItem('pawvlog_user_id', res.user._id);
            }
            window.location.href = 'pawvlog-home.html';
          } else {
            throw new Error(res.message || 'Error al registrar.');
          }
        } else {
          throw new Error('No se pudo conectar con el servicio de registro.');
        }
      } catch (err) {
        console.warn("Error en registro:", err);
        const errorMsg = document.createElement('div');
        errorMsg.id = 'register-error';
        errorMsg.style.color = 'var(--red)';
        errorMsg.style.fontSize = '0.9rem';
        errorMsg.style.marginTop = '12px';
        errorMsg.style.textAlign = 'center';
        errorMsg.textContent = err.message || 'Error al registrar.';
        btn.parentElement.appendChild(errorMsg);

        btn.textContent = 'Crear mi cuenta';
        btn.disabled = false;
      }
    });
  }
});
