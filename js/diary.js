document.addEventListener('DOMContentLoaded', async () => {
    // Verificar sesión
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = 'login.html';
        return;
    }

    // Configurar cierre de sesión
    document.getElementById('logout-btn').addEventListener('click', async () => {
        await supabase.auth.signOut();
        window.location.href = 'login.html';
    });

    const calendarEl = document.getElementById('calendar');
    const entriesList = document.getElementById('entries-list');
    const entryForm = document.getElementById('entry-form');
    const selectedDateTitle = document.getElementById('selected-date-title');
    const entryContent = document.getElementById('entry-content');
    const entryImage = document.getElementById('entry-image');

    let currentDate = new Date();
    let selectedDate = null;
    let entriesData = [];

    // Renderizar calendario del mes actual
    function renderCalendar(date) {
        const year = date.getFullYear();
        const month = date.getMonth();
        const firstDay = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const today = new Date().toDateString();

        calendarEl.innerHTML = '';
        // Cabeceras de días
        ['Dom','Lun','Mar','Mié','Jue','Vie','Sáb'].forEach(d => {
            const dayHeader = document.createElement('div');
            dayHeader.style.fontWeight = 'bold';
            dayHeader.style.color = 'var(--rojo-oscuro)';
            dayHeader.textContent = d;
            calendarEl.appendChild(dayHeader);
        });

        // Días vacíos al inicio
        for (let i = 0; i < firstDay; i++) {
            const empty = document.createElement('div');
            empty.className = 'calendar-day other-month';
            calendarEl.appendChild(empty);
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.className = 'calendar-day';
            dayEl.textContent = day;
            const fullDate = new Date(year, month, day).toDateString();
            if (fullDate === today) dayEl.classList.add('today');

            // Marcar si tiene entradas
            if (entriesData.some(e => e.date === fullDate)) {
                dayEl.classList.add('has-entries');
            }

            dayEl.addEventListener('click', () => {
                selectedDate = new Date(year, month, day);
                loadDayEntries(selectedDate);
            });

            calendarEl.appendChild(dayEl);
        }
    }

    // Cargar entradas del día seleccionado
    async function loadDayEntries(date) {
        const dateStr = date.toDateString();
        selectedDateTitle.textContent = `📅 ${dateStr}`;
        entryForm.style.display = 'block';
        entriesList.innerHTML = 'Cargando...';

        const { data, error } = await supabase
            .from('diary_entries')
            .select('*')
            .eq('date', dateStr)
            .order('created_at', { ascending: true });

        if (error) {
            entriesList.innerHTML = '<p>Error al cargar las entradas.</p>';
            return;
        }

        entriesList.innerHTML = '';
        if (data.length === 0) {
            entriesList.innerHTML = '<p>No hay entradas aún. ¡Escribe la primera!</p>';
        } else {
            data.forEach(entry => {
                const card = document.createElement('div');
                card.className = 'entry-card';
                card.innerHTML = `
                    <p>${entry.content.replace(/\n/g, '<br>')}</p>
                    ${entry.image_url ? `<img src="${entry.image_url}" alt="Foto del día">` : ''}
                    <small style="color:#666;">${new Date(entry.created_at).toLocaleTimeString()}</small>
                `;
                entriesList.appendChild(card);
            });
        }
    }

    // Cargar todas las entradas del mes (para pintar puntos)
    async function loadMonthEntries(year, month) {
        const firstDay = new Date(year, month, 1).toDateString();
        const lastDay = new Date(year, month + 1, 0).toDateString();
        const { data, error } = await supabase
            .from('diary_entries')
            .select('date')
            .gte('date', firstDay)
            .lte('date', lastDay);

        if (!error) {
            entriesData = data;
        }
        renderCalendar(new Date(year, month));
    }

    // Guardar nueva entrada
    entryForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedDate) return;

        const content = entryContent.value.trim();
        if (!content) return;

        let imageUrl = null;
        const file = entryImage.files[0];
        if (file) {
            const filePath = `public/${Date.now()}-${file.name}`;
            const { error: uploadError } = await supabase.storage
                .from('diary-images')
                .upload(filePath, file);

            if (uploadError) {
                alert('Error al subir la foto');
                return;
            }
            imageUrl = `${SUPABASE_URL}/storage/v1/object/public/diary-images/${filePath}`;
        }

        const { error: insertError } = await supabase
            .from('diary_entries')
            .insert([{ 
                user_id: (await supabase.auth.getUser()).data.user.id,
                date: selectedDate.toDateString(),
                content,
                image_url: imageUrl
            }]);

        if (insertError) {
            alert('No se pudo guardar la entrada');
            return;
        }

        // Limpiar y recargar
        entryContent.value = '';
        entryImage.value = '';
        loadDayEntries(selectedDate);
        loadMonthEntries(selectedDate.getFullYear(), selectedDate.getMonth());
    });

    // Navegación de mes (flechas simples con botones que puedes añadir si quieres, pero dejamos solo este mes)
    // Para simplificar, solo se muestra el mes actual. Puedes añadir botones "Anterior / Siguiente" luego.

    // Inicializar
    const now = new Date();
    loadMonthEntries(now.getFullYear(), now.getMonth());
});
