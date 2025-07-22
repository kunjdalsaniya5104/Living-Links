function extractProperties() {
    const properties = [];
    const propertyCards = document.querySelectorAll('.property-card');
    
    propertyCards.forEach(card => {
        const property = {
            title: card.querySelector('.card-title a').textContent.trim(),
            price: card.querySelector('.card-price strong').textContent.trim(),
            address: card.querySelector('.banner-actions-btn address').textContent.trim(),
            type: card.querySelector('.card-badge').textContent.trim(),
            bedrooms: card.querySelector('.card-item ion-icon[name="bed-outline"]')
                .parentElement.querySelector('strong').textContent,
            bathrooms: card.querySelector('.card-item ion-icon[name="man-outline"]')
                .parentElement.querySelector('strong').textContent,
            sqft: card.querySelector('.card-item ion-icon[name="square-outline"]')
                .parentElement.querySelector('strong').textContent,
            image: card.querySelector('.card-banner img').src,
            owner: {
                name: card.querySelector('.author-name a').textContent.trim(),
                image: card.querySelector('.author-avatar img').src,
                title: card.querySelector('.author-title').textContent.trim()
            }
        };
        properties.push(property);
    });
    
    localStorage.setItem('properties', JSON.stringify(properties));
}

// Call this when index.html loads
if (document.querySelector('.property-list')) {
    extractProperties();
} 