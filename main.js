function adjustPadding() {
    const header = document.querySelector('header');
    const body = document.body;
    const headerHeight = header.offsetHeight;
    body.style.paddingTop = `${headerHeight + 20}px`; // Adding extra space if needed
}

window.addEventListener('load', adjustPadding);
window.addEventListener('resize', adjustPadding);

document.addEventListener('DOMContentLoaded', function() {
    // Find the main element with the workshop attribute
    const mainElement = document.querySelector('main[workshop]');
    
    if (mainElement && mainElement.hasAttribute('workshop')) {
        const workshopName = mainElement.getAttribute('workshop');
        
        // Fetch the workshop's index.html
        fetch(`/${workshopName}/index.html`)
            .then(response => {
                if (!response.ok) {
                    throw new Error(`Failed to load workshop content from /${workshopName}/index.html`);
                }
                return response.text();
            })
            .then(html => {
                // Parse the HTML
                const parser = new DOMParser();
                const doc = parser.parseFromString(html, 'text/html');
                
                // Try multiple strategies to extract the content
                let contentElements = [];
                
                // Strategy 1: Find sections within main
                const mainSections = doc.querySelectorAll('main > section');
                if (mainSections.length > 0) {
                    contentElements = Array.from(mainSections);
                }
                // Strategy 2: Find sections directly in body
                else {
                    const bodySections = doc.querySelectorAll('body > section');
                    if (bodySections.length > 0) {
                        contentElements = Array.from(bodySections);
                    }
                    // Strategy 3: Find the main element
                    else {
                        const fetchedMain = doc.querySelector('main');
                        if (fetchedMain) {
                            contentElements = Array.from(fetchedMain.children);
                        }
                        // Strategy 4: Use any relevant body content
                        else {
                            const body = doc.querySelector('body');
                            if (body) {
                                contentElements = Array.from(body.children).filter(el => 
                                    !['header', 'footer', 'script', 'style', 'nav'].includes(el.tagName.toLowerCase())
                                );
                            }
                        }
                    }
                }
                
                // Replace the main content
                if (contentElements.length > 0) {
                    mainElement.innerHTML = '';
                    contentElements.forEach(element => {
                        mainElement.appendChild(document.importNode(element, true));
                    });
                    
                    // Load any CSS from the workshop page if needed
                    const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
                    linkElements.forEach(link => {
                        const href = link.getAttribute('href');
                        if (href && !href.startsWith('http') && !document.querySelector(`link[href*="${href}"]`)) {
                            const newLink = document.createElement('link');
                            newLink.rel = 'stylesheet';
                            newLink.href = `/${workshopName}/${href}`;
                            document.head.appendChild(newLink);
                        }
                    });
                } else {
                    mainElement.innerHTML = '<p>No content found in the workshop page.</p>';
                }
            })
            .catch(error => {
                console.error('Error:', error);
                mainElement.innerHTML = `
                    <div class="error">
                        <h2>Error Loading Workshop Content</h2>
                        <p>${error.message}</p>
                    </div>
                `;
            });
    }
});
