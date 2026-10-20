// shell.js
// Adds the data4news.com top bar and footer to workshop pages that live in their own repos.
// Include it in a workshop page's <head> with:
//   <script src="/shell.js" defer></script>

(function () {
    // The homepage and previous.html already have the bar and footer.
    if (document.querySelector('header .site-title')) return;

    const font = document.createElement('link');
    font.rel = 'stylesheet';
    font.href = 'https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap';
    document.head.appendChild(font);

    // Matches the header and footer styles in style.css, scoped so they don't touch the workshop's own styles.
    const style = document.createElement('style');
    style.textContent = `
        .d4n-topbar {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            box-sizing: border-box;
            background-color: #f8f8f8;
            border-bottom: 1px solid #e7e7e7;
            height: 80px;
            padding: 20px 40px;
            z-index: 1000;
            display: flex;
            align-items: center;
            justify-content: space-between;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
        }
        .d4n-topbar .site-info {
            display: flex;
            flex-direction: column;
        }
        .d4n-topbar .site-title {
            font-size: 1.5rem;
            font-weight: 700;
            color: #333333;
            text-decoration: none;
        }
        .d4n-topbar .site-subtitle {
            font-size: 0.9rem;
            color: #777777;
            font-style: italic;
        }
        .d4n-topbar ul {
            list-style: none;
            display: flex;
            gap: 20px;
            margin: 0;
            padding: 0;
        }
        .d4n-topbar li {
            margin: 0;
        }
        .d4n-topbar a.d4n-link {
            text-decoration: none;
            color: #3498db;
            font-weight: 500;
            transition: color 0.3s ease;
        }
        .d4n-topbar a.d4n-link:hover {
            color: #1d6fa5;
        }
        .d4n-footer {
            position: fixed;
            left: 0;
            bottom: 0;
            width: 100%;
            height: 60px;
            box-sizing: border-box;
            padding: 20px 0;
            text-align: center;
            background-color: #f8f8f8;
            border-top: 1px solid #e7e7e7;
            z-index: 1000;
            font-family: 'Roboto', sans-serif;
            line-height: 1.6;
        }
        .d4n-footer p {
            margin: 0;
            font-size: 0.9rem;
            color: #777777;
        }
        @media (max-width: 768px) {
            .d4n-footer {
                position: relative;
                height: auto;
                margin-top: 20px;
            }
            .d4n-topbar {
                flex-direction: column;
                align-items: flex-start;
                height: auto;
                padding: 15px 20px;
            }
            .d4n-topbar ul {
                flex-direction: column;
                gap: 10px;
                margin-top: 10px;
            }
        }
        @media (max-width: 480px) {
            .d4n-topbar {
                padding: 10px 15px;
            }
            .d4n-topbar .site-title {
                font-size: 1.2rem;
            }
            .d4n-topbar .site-subtitle {
                font-size: 0.8rem;
            }
        }
    `;
    document.head.appendChild(style);

    const header = document.createElement('header');
    header.className = 'd4n-topbar';
    header.innerHTML = `
        <div class="site-info">
            <a class="site-title" href="/">data4news.com</a>
            <span class="site-subtitle">...it's where Dhrumil stores stuff for workshops.</span>
        </div>
        <nav aria-label="Main Navigation">
            <ul>
                <li><a class="d4n-link" href="/">Today’s Workshop</a></li>
                <li><a class="d4n-link" href="/previous.html">Previous Workshops</a></li>
            </ul>
        </nav>
    `;

    const footer = document.createElement('footer');
    footer.className = 'd4n-footer';
    footer.innerHTML = `
        <p>
            The data4news.com website was made by Dhrumil <a href="https://chatgpt.com/share/678f4c65-c928-8010-ba8d-b9a87b6d2483" target="_blank" rel="noopener noreferrer"> with the help of ChatGPT</a> in Jan 2025 🤖.
        </p>
    `;

    function mount() {
        document.body.prepend(header);
        document.body.append(footer);
        // Keep the page content clear of the fixed bar and footer.
        const bodyStyle = getComputedStyle(document.body);
        const basePaddingTop = parseFloat(bodyStyle.paddingTop) || 0;
        const basePaddingBottom = parseFloat(bodyStyle.paddingBottom) || 0;
        const adjustPadding = () => {
            document.body.style.paddingTop = `${header.offsetHeight + basePaddingTop + 20}px`;
            const footerIsFixed = getComputedStyle(footer).position === 'fixed';
            document.body.style.paddingBottom = `${(footerIsFixed ? footer.offsetHeight : 0) + basePaddingBottom}px`;
        };
        adjustPadding();
        const observer = new ResizeObserver(adjustPadding);
        observer.observe(header);
        observer.observe(footer);
    }

    if (document.body) {
        mount();
    } else {
        document.addEventListener('DOMContentLoaded', mount);
    }
})();
