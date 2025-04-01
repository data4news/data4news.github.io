function adjustPadding() {
    const header = document.querySelector('header');
    const body = document.body;
    const headerHeight = header.offsetHeight;
    body.style.paddingTop = `${headerHeight + 20}px`; // Adding extra space if needed
}

window.addEventListener('load', adjustPadding);
window.addEventListener('resize', adjustPadding);

// Add this function to fix relative URLs
function fixRelativeUrls(element, workshopName) {
    // Fix URLs in elements with src, href, or srcset attributes
    const elementsWithUrls = element.querySelectorAll('[src], [href], [srcset]');
    elementsWithUrls.forEach(el => {
        // Handle src attribute
        if (el.hasAttribute('src')) {
            const src = el.getAttribute('src');
            if (src && !src.match(/^(https?:\/\/|\/|#|data:|mailto:)/)) {
                el.setAttribute('src', `/${workshopName}/${src}`);
            }
        }
        
        // Handle href attribute
        if (el.hasAttribute('href')) {
            const href = el.getAttribute('href');
            if (href && !href.match(/^(https?:\/\/|\/|#|data:|mailto:)/)) {
                el.setAttribute('href', `/${workshopName}/${href}`);
            }
        }
        
        // Handle srcset attribute
        if (el.hasAttribute('srcset')) {
            const srcset = el.getAttribute('srcset');
            if (srcset) {
                const newSrcset = srcset.split(',').map(src => {
                    const [url, descriptor] = src.trim().split(/\s+/);
                    if (url && !url.match(/^(https?:\/\/|\/|#|data:|mailto:)/)) {
                        return `/${workshopName}/${url} ${descriptor || ''}`.trim();
                    }
                    return src.trim();
                }).join(', ');
                
                el.setAttribute('srcset', newSrcset);
            }
        }
        
        // Handle style attribute with url()
        if (el.hasAttribute('style')) {
            const style = el.getAttribute('style');
            if (style && style.includes('url(')) {
                const newStyle = style.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
                    if (!url.match(/^(https?:\/\/|\/|#|data:|mailto:)/)) {
                        return `url('/${workshopName}/${url}')`;
                    }
                    return match;
                });
                el.setAttribute('style', newStyle);
            }
        }
    });
    
    // Fix CSS background images in style elements
    const styleElements = element.querySelectorAll('style');
    styleElements.forEach(style => {
        if (style.textContent) {
            style.textContent = style.textContent.replace(/url\(['"]?([^'")]+)['"]?\)/g, (match, url) => {
                if (!url.match(/^(https?:\/\/|\/|#|data:|mailto:)/)) {
                    return `url('/${workshopName}/${url}')`;
                }
                return match;
            });
        }
    });
}

document.addEventListener('DOMContentLoaded', function() {
    // Set up workshop link click handlers
    const workshopLinks = document.querySelectorAll('a[data-workshop]');
    workshopLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const workshopName = this.getAttribute('data-workshop');
            localStorage.setItem('selectedWorkshop', workshopName);
            window.location.href = 'index.html';
        });
    });
    
    // Find the main element with the workshop attribute
    const mainElement = document.querySelector('main[workshop]');
    
    if (mainElement) {
        // Check if we have a selected workshop from localStorage
        const selectedWorkshop = localStorage.getItem('selectedWorkshop');
        if (selectedWorkshop) {
            // Update the workshop attribute with the selected workshop
            mainElement.setAttribute('workshop', selectedWorkshop);
            // Clear the storage item after using it
            localStorage.removeItem('selectedWorkshop');
        }
        
        // Continue with existing code to load workshop content
        if (mainElement.hasAttribute('workshop')) {
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
                            // Fix relative URLs before appending to the document
                            fixRelativeUrls(element, workshopName);
                            mainElement.appendChild(document.importNode(element, true));
                        });
                        
                        // Load any CSS from the workshop page if needed
                        const linkElements = doc.querySelectorAll('link[rel="stylesheet"]');
                        linkElements.forEach(link => {
                            const href = link.getAttribute('href');
                            if (href && !href.startsWith('http') && !document.querySelector(`link[href*="${href}"]`)) {
                                const newLink = document.createElement('link');
                                newLink.rel = 'stylesheet';
                                // Fix relative URLs for stylesheets
                                if (!href.startsWith('/')) {
                                    newLink.href = `/${workshopName}/${href}`;
                                } else {
                                    newLink.href = href;
                                }
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
    }
});
