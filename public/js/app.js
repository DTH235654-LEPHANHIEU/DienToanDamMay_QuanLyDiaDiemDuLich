// Travel Dashboard - Core Logic
let map;
let markers = [];
let locations = [];
let currentFilter = 'all';
let searchQuery = '';

// Initial Data
const initialData = [
    {
        id: 1,
        name: "Vịnh Hạ Long",
        lat: 20.9101,
        lng: 107.1839,
        category: "Biển",
        image: "https://picsum.photos/seed/halong/400/300",
        description: "Di sản thiên nhiên thế giới với hàng ngàn đảo đá vôi kỳ vĩ."
    },
    {
        id: 2,
        name: "Sapa",
        lat: 22.3364,
        lng: 103.8438,
        category: "Núi",
        image: "https://picsum.photos/seed/sapa/400/300",
        description: "Thị trấn trong mây với những thửa ruộng bậc thang tuyệt đẹp."
    },
    {
        id: 3,
        name: "Phố Cổ Hội An",
        lat: 15.8801,
        lng: 108.3380,
        category: "Văn hóa",
        image: "https://picsum.photos/seed/hoian/400/300",
        description: "Thương cảng cổ kính với những dãy nhà vàng và đèn lồng rực rỡ."
    }
];

// Initialize App
function initApp() {
    loadData();
    setupEventListeners();
    if (document.getElementById('locationList')) {
        renderLocations();
    }
}

// Load data from localStorage
function loadData() {
    const savedData = localStorage.getItem('travel_locations');
    if (savedData) {
        locations = JSON.parse(savedData);
    } else {
        locations = initialData;
        localStorage.setItem('travel_locations', JSON.stringify(locations));
    }
    updateLocationCount();
}

// Initialize Map
function initMap() {
    const defaultCenter = { lat: 16.0471, lng: 108.2062 }; // Center of Vietnam
    map = new google.maps.Map(document.getElementById("map"), {
        zoom: 6,
        center: defaultCenter,
        styles: [
            {
                "featureType": "administrative",
                "elementType": "geometry",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "poi",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "road",
                "elementType": "labels.icon",
                "stylers": [{ "visibility": "off" }]
            },
            {
                "featureType": "transit",
                "stylers": [{ "visibility": "off" }]
            }
        ],
        disableDefaultUI: false,
        zoomControl: true,
        mapTypeControl: false,
        streetViewControl: false,
        fullscreenControl: true
    });

    // Wait for data to be loaded before adding markers
    if (locations.length > 0) {
        addMarkers();
    }
}

// Add Markers to Map
function addMarkers() {
    // Clear existing markers
    markers.forEach(marker => marker.setMap(null));
    markers = [];

    const filtered = getFilteredLocations();
    const bounds = new google.maps.LatLngBounds();

    filtered.forEach(loc => {
        const marker = new google.maps.Marker({
            position: { lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) },
            map: map,
            title: loc.name,
            animation: google.maps.Animation.DROP,
            icon: {
                path: google.maps.SymbolPath.CIRCLE,
                fillColor: '#0d6efd',
                fillOpacity: 1,
                strokeWeight: 2,
                strokeColor: '#ffffff',
                scale: 10
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div style="max-width: 200px;">
                    <h6 class="fw-bold mb-1">${loc.name}</h6>
                    <p class="small text-muted mb-0">${loc.category}</p>
                </div>
            `
        });

        marker.addListener("click", () => {
            infoWindow.open(map, marker);
            highlightCard(loc.id);
        });

        markers.push(marker);
        bounds.extend(marker.getPosition());
    });

    if (filtered.length > 0) {
        map.fitBounds(bounds);
        // Don't zoom in too much if only one marker
        if (filtered.length === 1) {
            map.setZoom(12);
        }
    }
}

// Get filtered and searched locations
function getFilteredLocations() {
    return locations.filter(loc => {
        const matchesCategory = currentFilter === 'all' || loc.category === currentFilter;
        const matchesSearch = loc.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
    });
}

// Render Location List in Sidebar
function renderLocations() {
    const listContainer = document.getElementById('locationList');
    const filtered = getFilteredLocations();
    
    if (filtered.length === 0) {
        listContainer.innerHTML = `
            <div class="text-center py-5 text-muted">
                <i class="bi bi-geo-alt fs-1 mb-3 d-block"></i>
                <p>Không tìm thấy địa điểm nào.</p>
            </div>
        `;
        return;
    }

    listContainer.innerHTML = filtered.map(loc => `
        <div class="location-card p-0" data-id="${loc.id}">
            <div class="card-img-container" onclick="focusLocation(${loc.id})">
                <img src="${loc.image}" alt="${loc.name}" onerror="this.src='https://placehold.co/400x300?text=No+Image'">
            </div>
            <div class="p-3">
                <div class="d-flex justify-content-between align-items-start mb-2">
                    <div onclick="focusLocation(${loc.id})" class="flex-grow-1">
                        <h6 class="fw-bold mb-0">${loc.name}</h6>
                        <span class="badge bg-primary-subtle text-primary badge-category">${loc.category}</span>
                    </div>
                    <div class="d-flex gap-1">
                        <button class="btn btn-sm btn-light border-0 text-primary p-1" onclick="openEditModal(${loc.id})" title="Sửa">
                            <i class="bi bi-pencil-square"></i>
                        </button>
                        <button class="btn btn-sm btn-light border-0 text-danger p-1" onclick="deleteLocation(${loc.id})" title="Xóa">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                </div>
                <p class="small text-muted mb-0 text-truncate-2" onclick="focusLocation(${loc.id})">${loc.description || 'Không có mô tả.'}</p>
            </div>
        </div>
    `).join('');
}

// Focus on a location (Sidebar click)
function focusLocation(id) {
    const loc = locations.find(l => l.id === id);
    if (loc && map) {
        map.panTo({ lat: parseFloat(loc.lat), lng: parseFloat(loc.lng) });
        map.setZoom(14);
        highlightCard(id);
        
        // Find corresponding marker and show info window
        const marker = markers.find(m => m.getTitle() === loc.name);
        if (marker) {
            google.maps.event.trigger(marker, 'click');
        }
    }
}

// Open Edit Modal and fill data
function openEditModal(id) {
    const loc = locations.find(l => l.id === id);
    if (!loc) return;

    document.getElementById('editLocId').value = loc.id;
    document.getElementById('editLocName').value = loc.name;
    document.getElementById('editLocLat').value = loc.lat;
    document.getElementById('editLocLng').value = loc.lng;
    document.getElementById('editLocCategory').value = loc.category;
    document.getElementById('editLocImage').value = loc.image;
    document.getElementById('editLocDesc').value = loc.description || '';
    
    const preview = document.getElementById('editImagePreview');
    preview.querySelector('img').src = loc.image;
    preview.classList.remove('d-none');

    const modal = new bootstrap.Modal(document.getElementById('editLocationModal'));
    modal.show();
}

// Delete Location
function deleteLocation(id) {
    if (confirm('Bạn có chắc chắn muốn xóa địa điểm này không?')) {
        locations = locations.filter(l => l.id !== id);
        localStorage.setItem('travel_locations', JSON.stringify(locations));
        
        updateLocationCount();
        renderLocations();
        addMarkers();
    }
}

// Highlight the active card in sidebar
function highlightCard(id) {
    document.querySelectorAll('.location-card').forEach(card => {
        card.classList.remove('active');
        if (parseInt(card.dataset.id) === id) {
            card.classList.add('active');
            card.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }
    });
}

// Event Listeners Setup
function setupEventListeners() {
    // Search Input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('input', (e) => {
            searchQuery = e.target.value;
            renderLocations();
            addMarkers();
        });
    }

    // Category Filters
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active', 'btn-primary'));
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.add('btn-outline-primary'));
            
            btn.classList.add('active', 'btn-primary');
            btn.classList.remove('btn-outline-primary');
            
            currentFilter = btn.dataset.category;
            renderLocations();
            addMarkers();
        });
    });

    // Image Preview in Modal
    const locImage = document.getElementById('locImage');
    if (locImage) {
        locImage.addEventListener('input', (e) => {
            const preview = document.getElementById('imagePreview');
            const img = preview.querySelector('img');
            if (e.target.value) {
                img.src = e.target.value;
                preview.classList.remove('d-none');
            } else {
                preview.classList.add('d-none');
            }
        });
    }

    // Add Location Form Submit
    const addLocationForm = document.getElementById('addLocationForm');
    if (addLocationForm) {
        addLocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const newLoc = {
                id: Date.now(),
                name: document.getElementById('locName').value,
                lat: parseFloat(document.getElementById('locLat').value),
                lng: parseFloat(document.getElementById('locLng').value),
                category: document.getElementById('locCategory').value,
                image: document.getElementById('locImage').value,
                description: document.getElementById('locDesc').value
            };

            locations.push(newLoc);
            localStorage.setItem('travel_locations', JSON.stringify(locations));
            
            // Reset form and close modal
            e.target.reset();
            document.getElementById('imagePreview').classList.add('d-none');
            const modal = bootstrap.Modal.getInstance(document.getElementById('addLocationModal'));
            modal.hide();

            // Refresh UI
            updateLocationCount();
            renderLocations();
            addMarkers();
            
            // Focus on new location
            setTimeout(() => focusLocation(newLoc.id), 500);
        });
    }

    // Edit Image Preview
    const editLocImage = document.getElementById('editLocImage');
    if (editLocImage) {
        editLocImage.addEventListener('input', (e) => {
            const preview = document.getElementById('editImagePreview');
            const img = preview.querySelector('img');
            if (e.target.value) {
                img.src = e.target.value;
                preview.classList.remove('d-none');
            } else {
                preview.classList.add('d-none');
            }
        });
    }

    // Edit Location Form Submit
    const editLocationForm = document.getElementById('editLocationForm');
    if (editLocationForm) {
        editLocationForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            const id = parseInt(document.getElementById('editLocId').value);
            const index = locations.findIndex(l => l.id === id);
            
            if (index !== -1) {
                locations[index] = {
                    ...locations[index],
                    name: document.getElementById('editLocName').value,
                    lat: parseFloat(document.getElementById('editLocLat').value),
                    lng: parseFloat(document.getElementById('editLocLng').value),
                    category: document.getElementById('editLocCategory').value,
                    image: document.getElementById('editLocImage').value,
                    description: document.getElementById('editLocDesc').value
                };

                localStorage.setItem('travel_locations', JSON.stringify(locations));
                
                // Close modal
                const modalElement = document.getElementById('editLocationModal');
                const modal = bootstrap.Modal.getInstance(modalElement);
                modal.hide();

                // Refresh UI
                renderLocations();
                addMarkers();
                focusLocation(id);
            }
        });
    }

    // Mock Login Handler
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Đăng nhập thành công! (Demo)');
            window.location.href = '/';
        });
    }

    // Mock Register Handler
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            alert('Đăng ký thành công! (Demo)');
            window.location.href = '/login';
        });
    }
}

function updateLocationCount() {
    const countEl = document.getElementById('locationCount');
    if (countEl) {
        countEl.textContent = `${locations.length} địa điểm`;
    }
}

// Start the app when DOM is ready
document.addEventListener('DOMContentLoaded', initApp);

// Global callback for Google Maps
window.initMap = initMap;
