document.addEventListener('DOMContentLoaded', function() {
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabsContent = document.getElementById('tabs-content');
    const totalGemsElement = document.getElementById('total-gems');
    const summaryTableBody = document.getElementById('summary-table')?.querySelector('tbody');
    const whatsappButtonDiv = document.getElementById('whatsapp-button');
    
    let data = {};
    let currentTabId = 'speed-ups'; // Default tab
    let dataLoaded = false;

    async function fetchData() {
        try {
            const response = await fetch('data.json');
            if (!response.ok) {
                throw new Error('Network response was not ok ' + response.statusText);
            }
            data = await response.json();
            dataLoaded = true;
            initialize();
        } catch (error) {
            console.error('Fetch error:', error);
        }
    }

    function formatNumber(number) {
        return new Intl.NumberFormat('id-ID').format(number);
    }

    function createTable(data) {
        return `
            <table class="min-w-full bg-gray-800 text-white border border-gray-700 rounded-lg shadow-lg">
                <thead>
                    <tr class="bg-gray-900">
                        <th class="p-4 text-left">Image</th>
                        <th class="p-4 text-left">Item Name</th>
                        <th class="p-4 text-left">Price</th>
                        <th class="p-4 text-left">Quantity</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.map(item => `
                        <tr class="border-b border-gray-700">
                            <td class="p-4"><img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover"></td>
                            <td class="p-4">${item.name}</td>
                            <td class="p-4">${formatNumber(item.price)} Gems</td>
                            <td class="p-4">
                                <input type="number" class="border border-gray-500 bg-gray-700 text-white p-1 rounded w-24 text-right" data-price="${item.price}" value="0" data-item='${JSON.stringify(item)}'>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
    }

    function showTab(targetId) {
        if (!dataLoaded) return;

        // Remove existing tab content
        tabsContent.innerHTML = '';

        // Create and display new tab content
        const newTabContent = document.createElement('div');
        newTabContent.id = targetId;
        newTabContent.className = 'tab-content active';
        newTabContent.innerHTML = createTable(data[targetId] || []);
        tabsContent.appendChild(newTabContent);

        currentTabId = targetId; // Update the current tab
        updateTotalAndSummary();
    }

    function initialize() {
        if (!dataLoaded) return;

        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const targetId = this.getAttribute('data-target');
                showTab(targetId);
                tabButtons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');
            });
        });

        // Set default tab
        showTab(currentTabId);
        tabButtons.forEach(btn => {
            if (btn.getAttribute('data-target') === currentTabId) {
                btn.classList.add('active');
            }
        });

        // Use event delegation to handle input changes with debounce
        let debounceTimer;
        tabsContent.addEventListener('input', (event) => {
            if (event.target.matches('input[type="number"]')) {
                clearTimeout(debounceTimer);
                debounceTimer = setTimeout(() => updateTotalAndSummary(), 300);
            }
        });
    }

    function updateTotalAndSummary() {
        // Ensure required elements exist
        const summaryTableBody = document.getElementById('summary-table')?.querySelector('tbody');
        const totalGemsElement = document.getElementById('total-gems');
        const whatsappButtonDiv = document.getElementById('whatsapp-button');

        if (!summaryTableBody || !totalGemsElement || !whatsappButtonDiv) {
            console.error("One or more elements required for updating total and summary are not found.");
            return; // Exit if any element is missing
        }

        let total = 0;
        summaryTableBody.innerHTML = ''; // Clear existing summary

        // Aggregate items from the current tab only
        const currentTabData = data[currentTabId] || [];
        let message = "Hi, I'd like to purchase the following items:\n\n"; // Message for WhatsApp

        currentTabData.forEach(item => {
            const input = document.querySelector(`input[data-item='${JSON.stringify(item)}']`);
            if (input) {
                const quantity = parseInt(input.value) || 0;
                const price = parseInt(input.getAttribute('data-price'));
                if (quantity > 0) {
                    const itemTotal = quantity * price;
                    total += itemTotal;

                    // Add to WhatsApp message
                    message += `Item: *${item.name}*\nQuantity: *${quantity}*\nTotal: *${formatNumber(itemTotal)}* Gems\n\n`;

                    const row = document.createElement('tr');
                    row.innerHTML = `
                        <td class="p-4"><img src="${item.image}" alt="${item.name}" class="w-12 h-12 object-cover"></td>
                        <td class="p-4">${item.name}</td>
                        <td class="p-4">${formatNumber(item.price)} Gems</td>
                        <td class="p-4">${quantity}</td>
                        <td class="p-4">${formatNumber(itemTotal)} Gems</td>
                    `;
                    summaryTableBody.appendChild(row);
                }
            }
        });

        totalGemsElement.textContent = formatNumber(total);

        // Update WhatsApp button
        const whatsappUrl = `https://wa.me/6282211219993?text=${encodeURIComponent(message)}%0A%0ATotal%20Gems:%20*${formatNumber(total)}*%20Gems`;
        whatsappButtonDiv.innerHTML = `<a href="${whatsappUrl}" target="_blank" class="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600">Beli via WhatsApp</a>`;
    }

    fetchData(); // Load initial data
});
