const { createApp, ref, onMounted } = Vue;

createApp({
    setup() {
        // Reactive data properties
        const info = ref(null);
        const error = ref(null);
        const loading = ref(true);

        // Function to fetch data from the API
        const fetchData = async (id) => {
            loading.value = true;
            error.value = null;
            try {
                // Dynamically construct the API URL (note quotes added)
                const apiUrl = `https://abc4soft.com/api/v1/get_info/R7V5CT`;

                alert(apiUrl);  // alert the URL here 

                // Use fetch to get data from the API
                const response = await fetch(apiUrl);
                alert("1");  
                const data = await response.json();
                if (data.error) {
                    // Handle the 'no matching document' error from the API
                    error.value = data.error;
                    info.value = null;
                } else {
                    // Successfully received data
                    info.value = data;
                    error.value = null;
                }
            } catch (err) {
                // Handle network or other fetch errors and display the API URL
                console.error("Fetch error:", err);
                error.value = `Failed to load data from the API: ${apiUrl}. Please check your network connection.`;
                info.value = null;
            } finally {
                loading.value = false;
            }
        };

        // The onMounted lifecycle hook is called when the component is mounted
        onMounted(() => {
            // Extract ID from URL query string
            const urlParams = new URLSearchParams(window.location.search);
            const id = urlParams.get('v');

            if (id) {
                fetchData(id);
            } else {
                // Handle case where no ID is provided in the URL
                loading.value = false;
                error.value = "No ID provided in the URL. Please use a format like /v=R7V5CT";
            }
        });

        return {
            info,
            error,
            loading
        };
    }
}).mount('#app');
