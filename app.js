const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        const info = ref(null);
        const error = ref(null);
        const loading = ref(true);
        
        // Auth & UI State
        const currentView = ref('profile'); // 'profile', 'login', 'dashboard', 'changePassword'
        const token = ref(localStorage.getItem('token') || null);
        const loginId = ref('');
        const loginPassword = ref('');
        const menuItems = ref([]);
        
        // Password Change State
        const oldPassword = ref('');
        const newPassword = ref('');

        const BASE_URL = 'https://abc4soft.com/api/v1';

        const fetchData = async (id) => {
            loading.value = true;
            try {
                const response = await fetch(`${BASE_URL}/get_info/${id}`);
                const data = await response.json();
                if (data.detail) throw new Error(data.detail);
                info.value = data;
                loginId.value = data.id; // Pre-fill login ID
            } catch (err) {
                error.value = "User not found or connection error.";
            } finally {
                loading.value = false;
            }
        };

        const handleLogin = async () => {
            loading.value = true;
            try {
                // FastAPI OAuth2 expects form-data
                const formData = new FormData();
                formData.append('username', loginId.value);
                formData.append('password', loginPassword.value);

                const response = await fetch(`${BASE_URL}/login`, {
                    method: 'POST',
                    body: formData
                });

                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Login Failed');

                token.value = data.access_token;
                localStorage.setItem('token', data.access_token);
                await fetchMenu();
                currentView.value = 'dashboard';
            } catch (err) {
                alert(err.message);
            } finally {
                loading.value = false;
            }
        };

        const fetchMenu = async () => {
            try {
                const response = await fetch(`${BASE_URL}/menu`, {
                    headers: { 'Authorization': `Bearer ${token.value}` }
                });
                menuItems.value = await response.json();
            } catch (err) {
                console.error("Menu fetch failed");
            }
        };

        const handleAction = (item) => {
            if (item.action_type === 'NAVIGATE' && item.destination === '/change-password') {
                currentView.value = 'changePassword';
            } else if (item.action_type === 'LOGOUT') {
                logout();
            }
        };

        const updatePassword = async () => {
            loading.value = true;
            try {
                const response = await fetch(`${BASE_URL}/change-password`, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token.value}`
                    },
                    body: JSON.stringify({
                        old_password: oldPassword.value,
                        new_password: newPassword.value
                    })
                });
                const data = await response.json();
                if (!response.ok) throw new Error(data.detail || 'Update Failed');
                alert("Success!");
                currentView.value = 'dashboard';
            } catch (err) {
                alert(err.message);
            } finally {
                loading.value = false;
            }
        };

        const logout = () => {
            token.value = null;
            localStorage.removeItem('token');
            currentView.value = 'profile';
        };

        onMounted(() => {
            const urlParams = new URLSearchParams(window.location.search);
            let id = urlParams.get('v') || window.location.search.slice(1);
            if (id) fetchData(id);
            else loading.value = false;
        });

        return {
            info, error, loading, currentView,
            loginId, loginPassword, handleLogin,
            menuItems, handleAction,
            oldPassword, newPassword, updatePassword,
            logout
        };
    }
}).mount('#app');
